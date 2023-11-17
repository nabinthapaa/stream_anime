import React from "react";

export default function Aside({ data }: any) {
  console.log(data);
  return (
    <div className="shadow dark:bg-gray-800 dark:text-white border-2 border-gray-200 rounded-lg h-fit  p-4 space-y-5">
      <div className="space-y-1 ">
        <p className="font-bold text-md">Romaji</p>
        <p>{data.title.romaji}</p>
      </div>
      <div className="space-y-1">
        <p className="font-bold text-md">English</p>
        <p>{data.title.english}</p>
      </div>
      <div className="space-y-1">
        <p className="font-bold text-md">Native</p>
        <p>{data.title.native}</p>
      </div>
      <div className="space-y-1">
        <p className="font-bold text-md">Format</p>
        <p>{data.format}</p>
      </div>
      <div className="space-y-1">
        <p className="font-bold text-md">Episodes</p>
        <p>{data.episodes}</p>
      </div>
      <div className="space-y-1">
        <p className="font-bold text-md">Episode duration</p>
        <p>{data.duration + " min/Episode"}</p>
      </div>
      <div className="space-y-1">
        <p className="font-bold text-md">Status</p>
        <p>{data.status}</p>
      </div>
      <div className="space-y-1">
        <p className="font-bold text-md">Genres</p>
        <p>{data.genres.join(", ")}</p>
      </div>
    </div>
  );
}
