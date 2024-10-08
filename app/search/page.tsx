import NextPreviousButton from "@/components/NextButton";
import CardSkeleton from "@/skeleton/Card";
import config from "@/utils/config";
import axios from "axios";
import Image from "next/image";
import React, { Suspense } from "react";

export default function page({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const q = searchParams?.q || "naruto";
  const page = Number(searchParams.page) || 1;

  return (
    <>
      <div className="container mx-auto mt-10 flex flex-wrap gap-4 last:self-start">
        <Suspense fallback={<Skeleton />}>
          <Results term={q as string} page={page} />
        </Suspense>
      </div>
    </>
  );
}

function Skeleton() {
  return Array.from({ length: 20 }).map((_, index: number) => (
    <CardSkeleton key={index} />
  ));
}

async function Results({ term, page }: { term: string; page: number }) {
  if (!config.hostname) return null;
  const { data } = await axios.get(`${config.hostname}/api/search?q=${term}`);
  return (
    <>
      {data?.results.map((element: any, _: any) => (
        <a
          href={`/info/${element.id}`}
          aria-label={"Info " + element.name}
          key={element.id}
          className="rounded-md p-4  w-fit space-y-1"
        >
          <div className="relative h-48 w-32 md:h-64 md:w-48 rounded-xl overflow-hidden">
            <Image
              src={element.img}
              alt={element.name}
              width={500}
              height={500}
            />
            {element.isDub ? (
              <span className="absolute  text-md font-bold px-4 py-1 bg-red-800 top-0 right-0">
                Dub
              </span>
            ) : null}
          </div>
          <div>
            <div
              title={element.name}
              className="w-32 md:w-48 line-clamp-1 overflow-hidden overflow-ellipsis"
            >
              <h3 className="font-md text-lg">{element.name}</h3>
            </div>
            <div className="h-4 w-full rounded-full max-w-sm">
              <p className="font-light text-sm">Released: {element.date} </p>
            </div>
          </div>
        </a>
      ))}
      <NextPreviousButton page={page} q={term} hasNext={data.meta.hasNext} />
    </>
  );
}
