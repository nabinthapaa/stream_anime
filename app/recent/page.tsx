import CardSkeleton from "@/skeleton/Card";
import axios from "axios";
import Image from "next/image";
import { Suspense } from "react";

export default function Page() {
  return (
    <div className="container mx-auto flex flex-wrap gap-4 last:self-start">
      <Suspense fallback={<Skeleton />}>
        <Recent />
      </Suspense>
    </div>
  );
}

function Skeleton() {
  return Array.from({ length: 20 }).map((_, index: number) => (
    <CardSkeleton key={index} />
  ));
}

async function Recent() {
  const { data } = await axios.get("http://localhost:3000/api/recent");
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
