import { default as NextPreviousButton } from "@/components/NextButton";
import CardSkeleton from "@/skeleton/Card";
import config from "@/utils/config";
import axios from "axios";
import Image from "next/image";
import { Suspense } from "react";

export default function Page({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  let page = Number(searchParams?.page) || 1;
  let type = searchParams.type || "SUB";
  return (
    <>
      <div className="container space-x-4 mt-6 mx-auto">
        <a
          className={`${
            type === "SUB"
              ? "bg-green-300 dark:bg-green-600"
              : "border-green-300 dark:border-green-600"
          } border-2 font-bold text-md px-4 py-2 rounded-lg`}
          href={`?page=${page}&type=SUB`}
        >
          SUB
        </a>
        <a
          className={`${
            type === "DUB"
              ? "bg-green-300 dark:bg-green-600"
              : "border-green-300 dark:border-green-600"
          } border-2 font-bold text-md px-4 py-2 rounded-lg`}
          href={`?page=${page}&type=DUB`}
        >
          DUB
        </a>
        <a
          className={`${
            type === "CHINESE"
              ? "bg-green-300 dark:bg-green-600"
              : "border-green-300 dark:border-green-600"
          } border-2 font-bold text-md px-4 py-2 rounded-lg`}
          href={`?page=${page}&type=CHINESE`}
        >
          CHINESE
        </a>
      </div>
      <div className="container mx-auto mt-10 flex flex-wrap gap-4 last:self-start">
        <Suspense fallback={<Skeleton />}>
          <Recent page={page} type={type} />
        </Suspense>
      </div>
      <NextPreviousButton page={page} type={type} />
    </>
  );
}

function Skeleton() {
  return Array.from({ length: 20 }).map((_, index: number) => (
    <CardSkeleton key={index} />
  ));
}

async function Recent({
  page,
  type,
}: {
  page: number;
  type: string | string[];
}) {
  if (!config.hostname) return null;
  const { data } = await axios.get(
    `${config.hostname}/api/recent?page=${page}&type=${type}`,
  );
  return data?.results.map((element: any, _: any) => (
    <a
      href={`/watch/${element.ep_id}`}
      aria-label={"Info " + element.name}
      key={element.id}
      className="rounded-md p-4  w-fit space-y-1"
    >
      <div className="h-48 w-32 md:h-64 md:w-48 rounded-xl overflow-hidden">
        <Image src={element.img} alt={element.name} width={500} height={500} />
      </div>
      <div>
        <div
          title={element.name}
          className="w-32 md:w-48 line-clamp-1 overflow-hidden overflow-ellipsis"
        >
          <h3 className="font-md text-lg">{element.name}</h3>
        </div>
        <div className="h-4 w-1/2 rounded-full max-w-sm">
          <p className="font-light text-sm">{element.episode}</p>
        </div>
      </div>
    </a>
  ));
}
