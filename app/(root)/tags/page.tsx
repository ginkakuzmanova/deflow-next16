import React from "react";
import { getTags } from "@/lib/actions/tag.action";
import LocalSearch from "@/components/search/LocalSearch";
import ROUTES from "@/constants/routes";
import DataRenderer from "@/components/DataRenderer";
import { EMPTY_TAGS } from "@/constants/states";
import TagCard from "@/components/cards/TagCard";

const Tags = async ({ searchParams }: RouteParams) => {
  const { page, pageSize, query, filter } = await searchParams;
  const { success, data, error } = await getTags({
    page: Number(page) || 1,
    pageSize: Number(pageSize) || 10,
    query,
    filter,
  });

  const { tags } = data || {};

  return (
    <>
      <h1 className={"h1-bold text-dark100_light900 text-3xl"}>Tags</h1>
      <section className={"mt-11"}>
        <LocalSearch
          route={ROUTES.TAGS}
          imgSrc={"/icons/search.svg"}
          placeholder={"Search by tag name..."}
          iconPosition={"left"}
          otherClasses={"flex-1"}
        />

        <DataRenderer
          success={success}
          error={error}
          empty={EMPTY_TAGS}
          data={tags}
          render={(tags) => (
            <div className={"mt-10 flex w-full flex-wrap gap-4"}>
              {tags.map((tag) => (
                <TagCard key={tag._id} {...tag} />
              ))}
            </div>
          )}
        />
      </section>
    </>
  );
};
export default Tags;
