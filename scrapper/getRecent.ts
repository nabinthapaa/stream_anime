import axios from "axios";
import * as cheerio from "cheerio";
import { scrapeCard } from "./scrapeCard";
import config from "@/utils/config";

interface Recent {
  [key: string]: string | undefined;
}

export async function getRecent(page: string, type: number) {
  try {
    let url = `${config.gogoCDN}/page-recent-release.html?page=${page}&type=${type}`;
    let { data } = await axios.get(url);
    let $ = cheerio.load(data);
    //@ts-ignore
    let all_recent_episodes = scrapeCard($(".last_episodes").html());
    let meta = {
      totalResults: all_recent_episodes.length,
      hasNext: $(".pagination-list .selected").next().length ? true : false,
    };

    return { meta, results: all_recent_episodes };
  } catch (e: any) {
    return { message: e.message };
  }
}
