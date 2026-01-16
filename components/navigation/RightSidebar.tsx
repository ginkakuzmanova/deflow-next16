import React from "react";
import Link from "next/link";
import ROUTES from "@/constants/routes";
import Image from "next/image";
import TagCard from "@/components/cards/TagCard";

const hotQuestions = [
  { _id: "1", title: "What is your name?" },
  { _id: "2", title: "How can I use?" },
];

const RightSidebar = async () => {
  return (
    <section className="custom-scrollbar background-light900_dark200 light-border shadow-light-300 sticky top-0 right-0 flex h-screen w-[350px] flex-col gap-6 overflow-y-auto border-l p-6 pt-36 max-xl:hidden dark:shadow-none">
      <div>
        <h3 className="h3-bold text-dark200_light900">Top Questions</h3>

        <div className="mt-7 flex w-full flex-col gap-[30px]">
          {hotQuestions.map(({ _id, title }) => (
            <Link href={ROUTES.QUESTION(_id)} className={"flex cursor-pointer items-center justify-between gap-7"}>
              <p className="body-medium text-dark500_light700">{title}</p>
              <Image src="/icons/chevron-right.svg" alt="Chevron" width={20} height={20} className="invert-colors" />
            </Link>
          ))}
        </div>
      </div>

      <div className="mt-16">
        <h3 className={"h3-bold text-dark200_light900"}>Popular Tags</h3>
        <div className="mt-7 flex flex-col gap-4">
          <TagCard _id={"1"} name={"typescript"} questions={5} compact></TagCard>
        </div>
      </div>
    </section>
  );
};
export default RightSidebar;
