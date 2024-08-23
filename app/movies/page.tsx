import NextPreviousButton from "@/components/NextButton";
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
  let page = Number(searchParams.page) || 1;
  let aph = searchParams.aph || "";
  let letterArray = [];
  for (let i = "A".charCodeAt(0); i <= "Z".charCodeAt(0); i++) {
    letterArray.push(String.fromCharCode(i));
  }
  return (
    <>
      <div className="container flex flex-wrap gap-2 mt-3 mx-auto">
        <a
          className={`${
            aph === "all" ? "bg-green-300" : "border-green-300"
          } border-2 font-bold text-md px-4 py-2 rounded-lg`}
          href={`?page=${page}&aph=all`}
        >
          ALL
        </a>
        <a
          className={`${
            aph === "0" ? "bg-green-300" : "border-green-300"
          } border-2 font-bold text-md px-4 py-2 rounded-lg`}
          href={`?page=${page}&aph=0`}
        >
          #
        </a>
        {letterArray.map((l, i) => (
          <a
            key={i + l}
            className={`${
              aph === l ? "bg-green-300" : "border-green-300"
            } border-2 font-bold text-sm px-4 py-2 rounded-lg`}
            href={`?page=${page}&aph=${l}`}
          >
            {l}
          </a>
        ))}
      </div>
      <div className="container mx-auto flex flex-wrap gap-4 last:self-start">
        <Suspense fallback={<Skeleton />}>
          <Movies page={page} aph={aph} />
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

async function Movies({ page, aph }: { page: number; aph: string | string[] }) {
  try {
    if (!config.hostname) return null;
    const { data } = await axios.post(`${config.hostname}/api/movies`, {
      page,
      aph,
    });
    return (
      <>
        {" "}
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
              <div className="h-4 w-1/2 rounded-full max-w-sm">
                <p className="font-light text-sm">Released: {element.date}</p>
              </div>
            </div>
          </a>
        ))}
        <NextPreviousButton page={page} aph={aph} hasNext={data.meta.hasNext} />
      </>
    );
  } catch (e: any) {
    return <span>{e.message}</span>;
  }
}
