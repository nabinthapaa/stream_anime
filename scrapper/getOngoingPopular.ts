import { INTERNAL_ERROR } from "@/utils";
import config from "@/utils/config";
import axios from "axios";
import * as cheerio from "cheerio";

interface Ongoing {
  [key: string]: string | string[] | undefined | boolean;
}

function getImage(url: string | undefined) {
  if (!url) throw INTERNAL_ERROR;
  const urlMatch = /url\('([^']+)'\)/.exec(url);

  if (urlMatch && urlMatch.length > 1) {
    const url = urlMatch[1];
    return url;
  } else {
    return "No Image";
  }
}

export async function getOngoingPopular(page: string) {
  try {
    let url = `${config.gogoCDN}/page-recent-release-ongoing.html?page=${page}`;
    let { data } = await axios.get(url);
    let $ = cheerio.load(data);
    let all_ongoing: Ongoing[] = [];

    //Getting data
    $(".added_series_body ul li").each((_, el) => {
      let img = getImage($(el).find(".thumbnail-popular").css("background"));
      let recent_ep_id = $(el)
        .find("p:last-child a")
        .attr("href")
        ?.replace(/.*\//, "");
      let id = $(el).find("a:first-child").attr("href")?.replace(/.*\//, "");
      let name = $(el).find("a:nth-child(2)")?.attr("title");
      let isDub = name?.includes("(Dub)");
      let genres: string[] = [];
      $(el)
        .find(".genres a")
        .each((_, el) => {
          let genre = $(el).attr("href")?.replace(/.*\//, "") as string;
          genres.push(genre);
        });

      all_ongoing.push({ id, name, genres, recent_ep_id, img, isDub });
    });
    let meta = {
      totalResult: all_ongoing.length,
      hasNext: $(".pagination-list .selected").next().length ? true : false,
    };

    return { meta, results: all_ongoing };
  } catch (e: any) {
    return new Response(JSON.stringify({ message: e.message }), {
      status: 500,
    });
  }
}
