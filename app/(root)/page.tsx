import React from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import ROUTES from "@/constants/routes";
import LocalSearch from "@/components/search/LocalSearch";

const Page = async ({ searchParams }: RouteParams) => {
  const { query = "" } = await searchParams;
  return (
    <>
      <section className="flex w-full flex-col-reverse justify-between gap-4 sm:flex-row sm:items-center">
        <h1 className="h1-bold text-dark100_light900 font-space-grotesk">All Questions</h1>

        <Button className={"primary-gradient !text-light-900 min-h-[46px] px-4 py-3"} asChild>
          <Link href={ROUTES.ASK_QUESTION}>Ask a Question</Link>
        </Button>
      </section>
      <section className="mt-11">
        <LocalSearch
          route={ROUTES.HOME}
          imgSrc={"/icons/search.svg"}
          placeholder={"Search questions..."}
          iconPosition={"left"}
          otherClasses={"flex-1"}
        />
      </section>

      {/*  COMP HOME FILTER*/}

      <div className={"mt-10 flex w-full flex-col gap-6"}>
        <p>Question 1 card based on the filters</p>
        <p>Question 2 card</p>
        <p>Question 3 card</p>
      </div>
    </>
  );
};
export default Page;
