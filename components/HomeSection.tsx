import CardSkeleton from "@/skeleton/Card";
import { HOSTNAME } from "@/utils";
import axios from "axios";
import Image from "next/image";
import React, { Suspense } from "react";

interface HomeSectionProps {
  title: string;
  link: string;
}

export const HomeSection: React.FC<HomeSectionProps> = async ({
  title,
  link,
}) => {
  return (
    <div className="container mx-auto my-6 space-y-4">
      <div className="flex justify-between px-4">
        <h2 className="font-bold text-2xl">{title}</h2>
        <div>
          <a
            className="font-bold text-sm hover:underline hover:underline-offset-4"
            aria-label={"View more " + link}
            href={`/${link}`}
          >
            View More &gt;
          </a>
        </div>
      </div>
      <div className="flex flex-wrap gap-2 justify-center xl:justify-between md:justify-start">
        <Suspense fallback={<Skeleton />}>
          <Card link={link} />
        </Suspense>
      </div>
    </div>
  );
};

const Skeleton = () => {
  return Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />);
};

const Card = async ({ link }: { link: string }) => {
  if (!HOSTNAME) return null;
  const url = `${HOSTNAME}/api/${link}`;
  const { data } = await axios.get(url);
  //@ts-ignore
  return (
    data?.results &&
    data?.results.map((element: any, index: number) => {
      if (index > 5) return;
      return (
        <a
          href={`/info/${element.id}`}
          aria-label={"Info " + element.name}
          key={element.id}
          className="rounded-md p-4  w-fit space-y-1"
        >
          <div className="h-48 w-32 md:h-64 md:w-48 rounded-xl overflow-hidden">
            <Image
              src={element.img}
              alt={element.name}
              width={500}
              height={500}
            />
          </div>
          <div>
            <div
              title={element.name}
              className="w-32 md:w-48 line-clamp-1 overflow-hidden overflow-ellipsis"
            >
              <h3 className="font-md text-lg">{element.name}</h3>
            </div>
            <div className="h-4 w-1/2 rounded-full max-w-sm">
              <p className="font-light text-sm">
                {element.date ? (
                  <>
                    <span className="hidden md:inline">Released:</span>{" "}
                    {element.date}
                  </>
                ) : (
                  element.episode
                )}
              </p>
            </div>
          </div>
        </a>
      );
    })
  );
};
