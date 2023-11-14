import VideoPlayer from "@/components/VideoPlayer";
import axios from "axios";
import { Suspense } from "react";
import GotoForm from "./gotoEp";

export default async function Watch({ params }: { params: { id: string } }) {
  let { id } = params;
  let { data } = await axios.get(`http://localhost:3000/api/watch?ep_id=${id}`);
  return (
    <>
      <div className="px-10 h-fit w-full bg-black">
        <div className="container mx-auto h-[75vh] max-h-[75vh]">
          <VideoPlayer source={...data} />
        </div>
      </div>
      <Suspense>
        <Controls id={id} />
      </Suspense>
    </>
  );
}

async function Controls({ id }: { id: string }) {
  let animeId = id.replace(/-episode-\d+$/, "");
  let { data } = await axios.get(
    `http://localhost:3000/api/info?id=${animeId}`
  );
  let episdode = id.match(/\b\d+\b/g) || [];
  let current_episode_number = Number(episdode[episdode.length - 1]);
  let hasNext = data.totalEpisodes > current_episode_number;
  let hasPrev = current_episode_number > 1;
  console.log({
    hasNext,
    hasPrev,
  });

  return (
    <div className="flex justify-between px-3 w-full bg-gray-400 py-2">
      {hasPrev && (
        <a
          href={`/watch/${animeId}-episode-${current_episode_number - 1}`}
          className="font-semibiold bg-green-300 self-end justify-end px-4 py-2 rounded-lg"
        >
          Previous Episode
        </a>
      )}
      <GotoForm id={animeId} />
      {hasNext && (
        <a
          href={`/watch/${animeId}-episode-${current_episode_number + 1}`}
          className="font-semibiold bg-green-300 self-end justify-end px-4 py-2 rounded-lg"
        >
          Next Episode
        </a>
      )}
    </div>
  );
}
