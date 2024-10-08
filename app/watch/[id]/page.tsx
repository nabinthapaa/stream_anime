import VideoPlayer from "@/components/VideoPlayer";
import axios from "axios";
import { Suspense } from "react";
import GotoForm from "./gotoEp";
import { redirect } from "next/navigation";
import config from "@/utils/config";

export default async function Watch({ params }: { params: { id: string } }) {
  let { id } = params;
  let data;
  try{
    let response = await axios.get( `${config.hostname}/api/watch?ep_id=${id}`)
    data = response.data
  }catch(err){
    redirect("/not-found")
  }
  return (
    <>
      <div className="px-10 h-fit w-full bg-black">
        <div className="container mx-auto h-[75vh] max-h-[75vh]">
          <VideoPlayer source={...data} />
        </div>
      </div>
      <Suspense>
        <Controls ep_id={id} id={data.alias_name} />
      </Suspense>
    </>
  );
}

async function Controls({ id, ep_id }: { [key: string]: string }) {
  if (!config.hostname) return null;
  let { data } = await axios.get(`${config.hostname}/api/info?id=${id}`);
  let episode = ep_id.match(/\b\d+\b/g) || [];
  let current_episode_number = Number(episode[episode.length - 1]);
  let hasNext = data.totalEpisodes > current_episode_number;
  let hasPrev = current_episode_number > 1;
  return (
    <div className="flex justify-between px-3 w-full bg-gray-400 py-2">
      {hasPrev && (
        <a
          href={`/watch/${ep_id.replace(/-episode-\d+$/, "")}-episode-${
            current_episode_number - 1
          }`}
          className="font-semibiold bg-green-300 self-end justify-end px-4 py-2 rounded-lg"
        >
          Previous Episode
        </a>
      )}
      <GotoForm id={id} />
      {hasNext && (
        <a
          href={`/watch/${ep_id.replace(/-episode-\d+$/, "")}-episode-${
            current_episode_number + 1
          }`}
          className="font-semibiold bg-green-300 self-end justify-end px-4 py-2 rounded-lg"
        >
          Next Episode
        </a>
      )}
    </div>
  );
}
