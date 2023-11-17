import InfoSekeleton from "@/skeleton/Info";
import axios from "axios";
import { Metadata } from "next";
import Image from "next/image";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import Aside from "./Components/Aside";
import { Plot } from "./Components/Plot";
import SimpleStatus from "./Components/SimpleStatus";

export const metadata: Metadata = {
  title: `Anime 101 - INFO`,
};

const TOTAL_EPISODES = 49;

export default function Page({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const { id } = params;
  const start = Number(searchParams.start || 1);
  const end = Number(searchParams.end || TOTAL_EPISODES);
  console.log({ start, end });
  return (
    <div className="">
      <Suspense fallback={<InfoSekeleton />}>
        <Info id={id} start={start} end={end} />
      </Suspense>
    </div>
  );
}

async function Info({
  id,
  start,
  end,
}: {
  id: string;
  start: number;
  end: number;
}) {
  try {
    const url = `${process.env.HOSTNAME}/api/info?id=${id}`;
    const { data } = await axios.get(url);
    if (data.totalEpisodes < end) {
      end = data.totalEpisodes;
    }
    metadata.title = `${data.name}`;
    metadata.description = `${data.plot}`;
    return (
      <div id={data.id} className="shadow h-fit rounded-md relative">
        <div className="w-full relative md:h-[30vh] h-[30vh]">
          <Image
            src={data?.bannerImage || data.poster}
            alt={data.name}
            fill
            className="w-full object-cover"
          />
          <div className="absolute h-[100%] bg-gradient-to-t bottom-0 left-0 right-0 from-black"></div>
        </div>
        <div className="sm:static absolute top-[100px] container max-w-[1400px] mx-auto p-4">
          <div className="flex gap-10 flex-wrap w-full">
            <div className="relative h-64 w-48 ">
              <div className="overflow-hidden rounded-lg border-2 border-red-100 absolute md:top-[-100px]">
                <Image
                  src={data.poster}
                  height={500}
                  width={500}
                  className="object-cover"
                  alt={data.name}
                />
              </div>
            </div>
            <div className="space-y-6 min-w-[300px] flex-1">
              <div className="w-full  rounded-full ">
                <h1 className="font-bold text-2xl">{data.name}</h1>
              </div>
              <div>
                <Plot data={data.plot} />
              </div>
              {!data.title && <SimpleStatus data={data} />}
            </div>
          </div>
          <div
            className={`container ${
              data.title ? "grid grid-cols-[0.2fr,1fr] gap-6" : ""
            }`}
          >
            {data.title && <Aside data={data} />}
            {data.totalEpisodes && (
              <div className="episodes">
                <hr className="md:hidden border-b-2 mt-2 rounded-full" />
                <h2 className="font-bold text-xl underline underline-offset-1">
                  Episodes:
                </h2>
                <div className="tabs flex flex-wrap gap-4 ml-2 mt-1">
                  <Episodes totalEp={data.totalEpisodes} />
                </div>
                <hr className="border-b-2 mt-2 rounded-full" />
                <div className="mt-2 w-full flex flex-wrap gap-4 content-start">
                  {Array.from({ length: end - start + 1 }).map((_, i) => (
                    <a
                      href={`/watch/${data.ep_id}-episode-${start + i}`}
                      key={i}
                      title={`${data.name}  Episode  ${Math.floor(start + i)}`}
                      className=" text-center align-middle  ml-2 rounded-md hover:bg-gray-900 hover:text-white hover:outline hover:outline-4 hover:border-outline-400"
                    >
                      <div className="w-64 aspect-video object-cover relative rounded-xl overflow-hidden">
                        <Image
                          src={data.poster}
                          alt="Thumbnail"
                          fill
                          className="object-cover"
                        />
                        <p className="absolute z-[10] font-bold bottom-0 right-0 px-4 text-white bg-gray-500 ">
                          {(data.duration || 24) + ":00"}
                        </p>
                      </div>
                      <div className="w-64 p-2">
                        <p className="font-bold text-md truncate">
                          {"Episode " +
                            Math.floor(start + i) +
                            " : " +
                            data.name}
                        </p>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  } catch (e: any) {
    console.log(e);
    redirect("/not-found");
  }
}

interface Episode {
  totalEp: number;
  name?: string;
  thumbnail?: string;
  time?: number;
}

function Episodes({ totalEp, name, thumbnail, time }: Episode) {
  let r_ep = totalEp % (TOTAL_EPISODES + 1);
  let q_ep = Math.floor(totalEp / (TOTAL_EPISODES + 1));
  let e_ep = totalEp - r_ep * q_ep;
  let Arr = Array.from({ length: q_ep });
  if (e_ep > 0) {
    Arr = Array.from({ length: q_ep + 1 });
  }
  let start = 1;
  return Arr.map((_, i) => {
    let temp = start;
    let end =
      i < q_ep
        ? temp + TOTAL_EPISODES
        : r_ep < TOTAL_EPISODES
        ? start + r_ep - 1
        : temp + TOTAL_EPISODES;
    start = end + 1;
    return (
      <a
        href={`?start=${temp}&end=${end}`}
        key={i}
        className="underline px-1 underline-offset-2 rounded-md hover:outline hover:outline-offset-2 hover:outline-green-300 hover:outline-2"
      >
        {temp}-{end}
      </a>
    );
  });
}
