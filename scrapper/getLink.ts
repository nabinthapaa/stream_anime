import { NOT_FOUND_ERROR } from "@/utils";
import { getAHAnime, getAHVideos } from "./animeheaven";
import { episodeNumber, proxiedVideo, toAnimeId } from "./helpers";

export async function getLink(ep_id: string) {
  try {
    let id = toAnimeId(ep_id);
    let number = episodeNumber(ep_id);
    if (!id || !number) throw NOT_FOUND_ERROR;
    // Gate keys rotate, so look up the current key for this episode every time
    let anime = await getAHAnime(id);
    let episode = anime.episodes.find((e) => e.number === number);
    if (!episode) throw NOT_FOUND_ERROR;
    let videos = await getAHVideos(episode.key);
    let sources = videos.sources.map(proxiedVideo);
    if (!sources.length) throw NOT_FOUND_ERROR;
    return {
      movie_id: id,
      alias_name: id,
      // Mirrors of the same MP4, in the order the site prefers them
      links: Object.fromEntries(sources.map((src, i) => [`mirror-${i + 1}`, src])),
      sources,
    };
  } catch (e: any) {
    throw NOT_FOUND_ERROR;
  }
}
