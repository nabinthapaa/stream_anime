import NextPreviousButton from "@/components/NextButton";
import CardSkeleton from "@/skeleton/Card";
import config from "@/utils/config";
import axios from "axios";
import Image from "next/image";
import { Suspense } from "react";
// TODO: Tabs for ongoing-popular and popular
export default function Page({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  let page = Number(searchParams?.page) || 1;
  let type = searchParams.type || "";
  const _ = ["bg-green-300", "border-green-300"];
  return (
    <>
      <div className="container space-x-4 mt-3 mx-auto">
        <a
          className={`${
            type === "og" ? "bg-green-300" : "border-green-300"
          } border-2 font-bold text-md px-4 py-2 rounded-lg`}
          href={`?page=${page}&type=og`}
        >
          Ongoing
        </a>
        <a
          className={`${
            type !== "og" ? "bg-green-300" : "border-green-300"
          } border-2 font-bold text-md px-4 py-2 rounded-lg`}
          href={`?page=${page}`}
        >
          All Time
        </a>
      </div>
      <div className="container mx-auto flex flex-wrap gap-4 last:self-start">
        <Suspense fallback={<Skeleton />}>
          <Popular page={page} type={type} />
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

interface Element {
  id: string;
  name: string;
  date?: string;
  img: string;
  isDub?: boolean;
  genres?: string[];
  recent_ep_id?: string;
}

interface Data {
  meta: {
    totalResult: number;
    hasNext: true;
  };
  results: Element[];
}

async function Popular({
  page,
  type,
}: {
  page: number;
  type?: string | string[];
}) {
  if (!config.hostname) return null;
  let data: Data | any = {};
  if (type === "og") {
    const res = await axios.get(
      `${config.hostname}/api/ongoing-popular?page=${page}`,
    );
    data = res.data;
  } else {
    const res = await axios.get(`${config.hostname}/api/popular?page=${page}`);
    data = res.data;
  }
  return data?.results.map((element: Element, _: number) => (
    <a
      href={`/info/${element.id}`}
      aria-label={"Info " + element.name}
      key={element.id}
      className="rounded-md p-4  w-fit space-y-1"
    >
      <div className="relative h-48 w-32 md:h-64 md:w-48 rounded-xl overflow-hidden">
        <Image src={element.img} alt={element.name} width={500} height={500} />
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
        <div className="h-4 w-32 md:w-48 rounded-full mt-1 max-w-sm">
          <p className="font-light text-sm">
            {element.date
              ? `Released ${element.date}`
              : element.genres
                ? element.genres.map((e, i) => {
                    if (i > 1) return null;
                    return <Genres key={e} genre={e} i={i} />;
                  })
                : "( Sub )"}
          </p>
        </div>
      </div>
    </a>
  ));
}

function titleCase(word: string) {
  return word.charAt(0).toUpperCase() + word.substring(1);
}

function Genres({ genre, i }: { genre: string; i: number }) {
  return (
    <span
      className={`${i !== 0 ? "ml-2" : ""} text-xs px-2 bg-purple-500 py-1 rounded-lg`}
    >
      {titleCase(genre)}
    </span>
  );
}
