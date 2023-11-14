import InfoSekeleton from "@/skeleton/Info";
import axios from "axios";
import Image from "next/image";
import { RedirectType, redirect } from "next/navigation";
import { Suspense } from "react";
import { Plot } from "./Plot";

export default function Page({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const { id } = params;
  const start = Number(searchParams.start || 1);
  const end = Number(searchParams.end || 99);
  console.log({ start, end });
  return (
    <div className="grid place-content-center container mx-auto py-4">
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
    const url = `http://localhost:3000/api/info?id=${id}`;
    const { data } = await axios.get(url);
    if (data.totalEpisodes < end) {
      end = data.totalEpisodes;
    }
    return (
      <div
        id={data.id}
        className="shadow min-w-[300px] max-w-[960px] h-fit rounded-md p-4"
      >
        <div className="flex gap-10 flex-wrap">
          <div className="h-64 w-48 border-red-100 border-2 object-cover  rounded-lg overflow-hidden ">
            <Image
              src={data.poster}
              height={500}
              width={500}
              className="object-cover"
              alt={data.name}
            />
          </div>
          <div className="space-y-6 w-[600px]">
            <div className="w-full  rounded-full ">
              <h1 className="font-bold text-2xl">{data.name}</h1>
            </div>
            <div className="space-y-3">
              <Plot data={data.plot} />
            </div>
            <div className="space-y-2">
              <p className="  rounded-full text-md font-bold">
                Type:<span className="font-normal">{" " + data.type}</span>
              </p>
              <p className="  rounded-full text-md font-bold">
                Status:<span className="font-normal">{" " + data.status}</span>
              </p>
              <p className="  rounded-full text-md font-bold">
                Aired on:
                <span className="font-normal">{" " + data.releasedOn}</span>
              </p>
            </div>
          </div>
        </div>
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
              href={`/watch/${id}-episode-${start + i}`}
              key={i}
              className="w-20 h-8 border-2 border-green-200 text-center align-middle  ml-2 rounded-md hover:boder-green-100 hover:bg-blue-300 hover:text-white  "
            >
              {start + i}
            </a>
          ))}
        </div>
      </div>
    );
  } catch (e: any) {
    redirect("/not-found");
  }
}

function Episodes({ totalEp }: { totalEp: number }) {
  let r_ep = totalEp % 100;
  let q_ep = Math.floor(totalEp / 100);
  let e_ep = totalEp - r_ep * q_ep;
  let Arr = Array.from({ length: q_ep });
  if (e_ep > 0) {
    Arr = Array.from({ length: q_ep + 1 });
  }
  let start = 1;
  return Arr.map((_, i) => {
    let temp = start;
    let end = i < q_ep ? temp + 99 : r_ep < 99 ? start + r_ep - 1 : temp + 99;
    start = end + 1;
    return (
      <a
        href={`?start=${temp}&end=${end}`}
        key={i}
        className="underline underline-offset-2 rounded-md"
      >
        {temp}-{end}
      </a>
    );
  });
}
