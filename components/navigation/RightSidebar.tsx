import React from "react";
import Link from "next/link";
import ROUTES from "@/constants/routes";
import Image from "next/image";
import TagCard from "@/components/cards/TagCard";
import { getHotQuestions } from "@/lib/actions/question.action";
import DataRenderer from "@/components/DataRenderer";
import { EMPTY_QUESTION, EMPTY_TAGS } from "@/constants/states";
import { getTopTags } from "@/lib/actions/tag.action";

const RightSidebar = async () => {
  const [{ success, data, error }, { success: tagsSuccess, data: tags, error: tagsError }] = await Promise.all([
    getHotQuestions(),
    getTopTags(),
  ]);

  const hotQuestions = data || [];

  return (
    <section className="custom-scrollbar background-light900_dark200 light-border shadow-light-300 sticky top-0 right-0 flex h-screen w-[350px] flex-col gap-6 overflow-y-auto border-l p-6 pt-36 max-xl:hidden dark:shadow-none">
      <div>
        <h3 className="h3-bold text-dark200_light900">Top Questions</h3>

        <div className="mt-7 flex w-full flex-col gap-[30px]">
          <DataRenderer
            success={success}
            error={error}
            data={hotQuestions}
            empty={EMPTY_QUESTION}
            render={(hotQuestions) =>
              hotQuestions.map(({ _id, title }) => (
                <Link
                  key={_id}
                  href={ROUTES.QUESTION(_id)}
                  className={"flex cursor-pointer items-center justify-between gap-7"}
                >
                  <p className="body-medium text-dark500_light700">{title}</p>
                  <Image
                    src="/icons/chevron-right.svg"
                    alt="Chevron"
                    width={20}
                    height={20}
                    className="invert-colors"
                  />
                </Link>
              ))
            }
          />
        </div>
      </div>

      <div className="mt-16">
        <h3 className={"h3-bold text-dark200_light900"}>Popular Tags</h3>
        <DataRenderer
          success={tagsSuccess}
          error={tagsError}
          data={tags}
          empty={EMPTY_TAGS}
          render={(tags) => (
            <div className="mt-7 flex flex-col gap-4">
              {tags.map((tag) => (
                <TagCard key={tag._id} {...tag} compact showCount></TagCard>
              ))}
            </div>
          )}
        />
      </div>
    </section>
  );
};
export default RightSidebar;
