import React from "react";

export default function SimpleStatus({ data }: any) {
  return (
    <>
      <div className="space-x-1">
        <p className="font-bold text-md inline-block">Status: </p>
        <p className="inline-block">{data.status}</p>
      </div>
      <div className="space-x-1">
        <p className="font-bold text-md inline-block">Airing On: </p>
        <p className="inline-block">{data.releasedOn}</p>
      </div>
      <div className="space-x-1">
        <p className="font-bold text-md inline-block">Type: </p>
        <p className="inline-block">{data.type}</p>
      </div>
    </>
  );
}
