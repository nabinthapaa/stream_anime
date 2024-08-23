import { INTERNAL_ERROR } from "@/utils";
import config from "@/utils/config";
import axios from "axios";
import * as cheerio from "cheerio";
import { scrapeCard } from "./scrapeCard";

export async function getAllTimePopular(page?: string) {
  try {
    let url = `${config.website}/popular.html?page=${page}`;
    let { data } = await axios.get(url);
    let $ = cheerio.load(data);
    //@ts-ignore
    let results = scrapeCard($(".last_episodes").html(), true);
    let meta = {
      totalResults: results.length,
      hasNext: $(".pagination .selected").next().length ? true : false,
    };
    return { meta, results };
  } catch (e: any) {
    throw INTERNAL_ERROR;
  }
}
