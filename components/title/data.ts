import config from "@/utils/config";
import type { InfoData } from "@/utils/interface";
import axios from "axios";
import { cache } from "react";

export type TitleInfo = InfoData & {
  type?: string;
  alias_name?: string;
  /** Source rating, e.g. "8.2/10" (used when AniList has no averageScore) */
  score?: string;
  latestEpisode?: number;
  availableEpisodes?: { number: number; ep_id: string }[];
};

/**
 * The existing `/api/info?id=` request, memoised per server render so
 * `generateMetadata` and the page (or modal) share one call.
 */
export const getTitleInfo = cache(async (id: string) => {
  const url = `${config.hostname}/api/info?id=${id}`;
  const { data } = await axios.get(url);
  return data as TitleInfo;
});
