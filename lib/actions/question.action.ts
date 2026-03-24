"use server";

import { cache } from "react";
import { QueryFilter as FilterQuery, Types } from "mongoose";
import { revalidatePath } from "next/cache";
import { after } from "next/server";

import { auth } from "@/auth";
import { Answer, Collection, Interaction, Vote } from "@/database";
import Question, { IQuestionDoc } from "@/database/question.model";
import TagQuestion from "@/database/tag-question.model";
import Tag, { ITagDoc } from "@/database/tag.model";
import action from "@/lib/handlers/action";
import handleError from "@/lib/handlers/error";
import { connectDB, runInTransaction } from "@/lib/mongodb";
import {
  AskQuestionSchema,
  DeleteQuestionSchema,
  EditQuestionSchema,
  GetQuestionSchema,
  IncrementViewsSchema,
  PaginatedSearchParamsSchema,
} from "@/lib/validations";

import { createInteraction } from "./interaction.action";

export async function createQuestion(params: CreateQuestionParams): Promise<ActionResponse<Question>> {
  const validationResult = await action({
    params,
    schema: AskQuestionSchema,
    authorize: true,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { title, content, tags } = validationResult.params!;
  const userId = validationResult.session?.user?.id;

  try {
    const result = await runInTransaction(async (session) => {
      const [question] = await Question.create([{ title, content, author: userId }], { session });

      if (!question) {
        throw new Error("Failed to create the question");
      }

      const tagIds: Types.ObjectId[] = [];
      const tagQuestionDocuments: Array<{
        tag: Types.ObjectId;
        question: Types.ObjectId;
      }> = [];

      for (const tag of tags) {
        const existingTag = await Tag.findOneAndUpdate(
          { name: { $regex: new RegExp(`^${tag}$`, "i") } },
          { $setOnInsert: { name: tag }, $inc: { questions: 1 } },
          { upsert: true, new: true, session }
        );

        if (!existingTag) {
          throw new Error(`Failed to create or load tag: ${tag}`);
        }

        tagIds.push(existingTag._id);
        tagQuestionDocuments.push({
          tag: existingTag._id,
          question: question._id,
        });
      }

      if (tagQuestionDocuments.length > 0) {
        await TagQuestion.insertMany(tagQuestionDocuments, { session });
      }

      await Question.updateOne({ _id: question._id }, { $set: { tags: tagIds } }, { session });

      return {
        question: JSON.parse(JSON.stringify(question)),
        questionId: question._id.toString(),
      };
    });

    after(async () => {
      await createInteraction({
        action: "post",
        actionId: result.questionId,
        actionTarget: "question",
        authorId: userId as string,
      });
    });

    return {
      success: true,
      data: result.question,
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function editQuestion(params: EditQuestionParams): Promise<ActionResponse<IQuestionDoc>> {
  const validationResult = await action({
    params,
    schema: EditQuestionSchema,
    authorize: true,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { title, content, tags, questionId } = validationResult.params!;
  const userId = validationResult.session?.user?.id;

  try {
    const updatedQuestion = await runInTransaction(async (session) => {
      const question = await Question.findById(questionId).session(session).populate("tags");

      if (!question) {
        throw new Error("Question not found");
      }

      if (question.author.toString() !== userId) {
        throw new Error("You are not authorized to edit this question");
      }

      const currentTags = question.tags as ITagDoc[];

      const tagsToAdd = tags.filter((tag) => !currentTags.some((t) => t.name.toLowerCase() === tag.toLowerCase()));

      const tagsToRemove = currentTags.filter((tag) => !tags.some((t) => t.toLowerCase() === tag.name.toLowerCase()));

      const tagIdsToRemove = tagsToRemove.map((tag) => tag._id);

      const retainedTagIds = currentTags
        .filter((tag) => !tagIdsToRemove.some((id) => id.equals(tag._id)))
        .map((tag) => tag._id);

      const newTagIds: Types.ObjectId[] = [];
      const newTagDocuments: Array<{
        tag: Types.ObjectId;
        question: Types.ObjectId;
      }> = [];

      for (const tag of tagsToAdd) {
        const newTag = await Tag.findOneAndUpdate(
          { name: { $regex: `^${tag}$`, $options: "i" } },
          { $setOnInsert: { name: tag }, $inc: { questions: 1 } },
          { upsert: true, new: true, session }
        );

        if (!newTag) {
          throw new Error(`Failed to create or load tag: ${tag}`);
        }

        newTagIds.push(newTag._id);
        newTagDocuments.push({
          tag: newTag._id,
          question: question._id,
        });
      }

      if (tagIdsToRemove.length > 0) {
        await Tag.updateMany({ _id: { $in: tagIdsToRemove } }, { $inc: { questions: -1 } }, { session });

        await TagQuestion.deleteMany({ tag: { $in: tagIdsToRemove }, question: questionId }, { session });
      }

      if (newTagDocuments.length > 0) {
        await TagQuestion.insertMany(newTagDocuments, { session });
      }

      const nextTagIds = [...retainedTagIds, ...newTagIds];

      await Question.updateOne(
        { _id: questionId },
        {
          $set: {
            title,
            content,
            tags: nextTagIds,
          },
        },
        { session }
      );

      const reloadedQuestion = await Question.findById(questionId).session(session).populate("tags");

      if (!reloadedQuestion) {
        throw new Error("Failed to reload updated question");
      }

      return JSON.parse(JSON.stringify(reloadedQuestion));
    });

    return {
      success: true,
      data: updatedQuestion,
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export const getQuestion = cache(async function getQuestion(
  params: GetQuestionParams
): Promise<ActionResponse<Question>> {
  const validationResult = await action({
    params,
    schema: GetQuestionSchema,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { questionId } = validationResult.params!;

  try {
    await connectDB();

    const question = await Question.findById(questionId)
      .populate("tags", "_id name")
      .populate("author", "_id name image");

    if (!question) {
      throw new Error("Question not found");
    }

    return { success: true, data: JSON.parse(JSON.stringify(question)) };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
});

export async function getRecommendedQuestions({ userId, query, skip, limit }: RecommendationParams) {
  await connectDB();

  const interactions = await Interaction.find({
    user: new Types.ObjectId(userId),
    actionType: "question",
    action: { $in: ["view", "upvote", "bookmark", "post"] },
  })
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();

  const interactedQuestionIds = interactions.map((i) => i.actionId);

  const interactedQuestions = await Question.find({
    _id: { $in: interactedQuestionIds },
  }).select("tags");

  const allTags = interactedQuestions.flatMap((q) => q.tags.map((tag: Types.ObjectId) => tag.toString()));

  const uniqueTagIds = [...new Set(allTags)];

  const recommendedQuery: FilterQuery<IQuestionDoc> = {
    _id: { $nin: interactedQuestionIds },
    author: { $ne: new Types.ObjectId(userId) },
    tags: { $in: uniqueTagIds.map((id) => new Types.ObjectId(id)) },
  };

  if (query) {
    recommendedQuery.$or = [{ title: { $regex: query, $options: "i" } }, { content: { $regex: query, $options: "i" } }];
  }

  const total = await Question.countDocuments(recommendedQuery);

  const questions = await Question.find(recommendedQuery)
    .populate("tags", "name")
    .populate("author", "name image")
    .sort({ upvotes: -1, views: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  return {
    questions: JSON.parse(JSON.stringify(questions)),
    isNext: total > skip + questions.length,
  };
}

export async function getQuestions(params: PaginatedSearchParams): Promise<
  ActionResponse<{
    questions: Question[];
    isNext: boolean;
  }>
> {
  const validationResult = await action({
    params,
    schema: PaginatedSearchParamsSchema,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { page = 1, pageSize = 10, query, filter } = validationResult.params!;

  const skip = (Number(page) - 1) * pageSize;
  const limit = pageSize;

  const filterQuery: FilterQuery<IQuestionDoc> = {};
  let sortCriteria = {};

  try {
    await connectDB();

    if (filter === "recommended") {
      const session = await auth();
      const userId = session?.user?.id;

      if (!userId) {
        return { success: true, data: { questions: [], isNext: false } };
      }

      const recommended = await getRecommendedQuestions({
        userId,
        query,
        skip,
        limit,
      });

      return { success: true, data: recommended };
    }

    if (query) {
      filterQuery.$or = [{ title: { $regex: query, $options: "i" } }, { content: { $regex: query, $options: "i" } }];
    }

    switch (filter) {
      case "newest":
        sortCriteria = { createdAt: -1 };
        break;
      case "unanswered":
        filterQuery.answers = 0;
        sortCriteria = { createdAt: -1 };
        break;
      case "popular":
        sortCriteria = { upvotes: -1 };
        break;
      default:
        sortCriteria = { createdAt: -1 };
        break;
    }

    const totalQuestions = await Question.countDocuments(filterQuery);

    const questions = await Question.find(filterQuery)
      .populate("tags", "name")
      .populate("author", "name image")
      .lean()
      .sort(sortCriteria)
      .skip(skip)
      .limit(limit);

    const isNext = totalQuestions > skip + questions.length;

    return {
      success: true,
      data: {
        questions: JSON.parse(JSON.stringify(questions)),
        isNext,
      },
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function incrementViews(params: IncrementViewsParams): Promise<ActionResponse<{ views: number }>> {
  const validationResult = await action({
    params,
    schema: IncrementViewsSchema,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { questionId } = validationResult.params!;

  try {
    await connectDB();

    const question = await Question.findById(questionId);

    if (!question) {
      throw new Error("Question not found");
    }

    question.views += 1;
    await question.save();

    return {
      success: true,
      data: { views: question.views },
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function getHotQuestions(): Promise<ActionResponse<Question[]>> {
  try {
    await connectDB();

    const questions = await Question.find().sort({ views: -1, upvotes: -1 }).limit(5);

    return {
      success: true,
      data: JSON.parse(JSON.stringify(questions)),
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function deleteQuestion(params: DeleteQuestionParams): Promise<ActionResponse> {
  const validationResult = await action({
    params,
    schema: DeleteQuestionSchema,
    authorize: true,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { questionId } = validationResult.params!;
  const { user } = validationResult.session!;

  try {
    const result = await runInTransaction(async (session) => {
      const question = await Question.findById(questionId).session(session);

      if (!question) {
        throw new Error("Question not found");
      }

      if (question.author.toString() !== user?.id) {
        throw new Error("You are not authorized to delete this question");
      }

      await Collection.deleteMany({ question: questionId }, { session });
      await TagQuestion.deleteMany({ question: questionId }, { session });

      if (question.tags.length > 0) {
        await Tag.updateMany({ _id: { $in: question.tags } }, { $inc: { questions: -1 } }, { session });
      }

      await Vote.deleteMany(
        {
          actionId: questionId,
          actionType: "question",
        },
        { session }
      );

      const answers = await Answer.find({ question: questionId }).session(session);

      if (answers.length > 0) {
        await Answer.deleteMany({ question: questionId }, { session });

        await Vote.deleteMany(
          {
            actionId: { $in: answers.map((answer) => answer.id) },
            actionType: "answer",
          },
          { session }
        );
      }

      await Question.findByIdAndDelete(questionId).session(session);

      return {
        questionId,
        userId: user?.id as string,
      };
    });

    after(async () => {
      await createInteraction({
        action: "delete",
        actionId: result.questionId,
        actionTarget: "question",
        authorId: result.userId,
      });
    });

    revalidatePath(`/profile/${user?.id}`);

    return { success: true };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}
