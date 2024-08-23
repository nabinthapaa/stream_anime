import { NOT_FOUND_ERROR } from "@/utils";
import axios from "axios";
import * as cheerio from "cheerio";
import config from "@/utils/config";

export async function GetInfo(id: string) {
  try {
    let url = `${config.website}/category/${id}`;
    let response = await axios.get(url);
    let html = response.data;

    let $ = cheerio.load(html);
    let anime_details = $(".anime_info_body_bg");
    let movie_id = $("#movie_id").attr("value");
    let alias_name = $("#alias_anime").attr("value");
    let name = anime_details.find("h1").text();
    let isDubbed = name.includes("(Dub)");
    let genres: string[] = [];
    let plot = anime_details
      .find("p:nth-child(5)")
      .text()
      .replace(/^Plot Summary:\s*/gm, "");

    let status = anime_details
      .find("p:nth-child(8)")
      .text()
      .replace(/^Status:\s*/gm, "")
      .replace(/\n/, "")
      .trim();
    let releasedOn = anime_details
      .find("p:nth-child(7)")
      .text()
      .replace(/^Released:\s*/gm, "");
    anime_details
      .find('[href^="https://gogoanimehd.io/genre/"]')
      .each((_, el) => {
        genres.push($(el).text().replace(/,\s*/g, ""));
      });
    let type = anime_details.find("[href^='/sub-category/']").text().trim();
    let totalEpisodes = Number(
      $("#episode_page li").last().find("a").attr("ep_end"),
    );
    let poster = anime_details.find("img").attr("src");

    let ep_url = `${config.gogoCDN}/load-list-episode?ep_start=0&ep_end=1&id=${movie_id}&default_ep=0&alias=${alias_name}`;
    let { data } = await axios.get(ep_url);
    let $_ = cheerio.load(data);
    let ep_id = $_("#episode_related > li:nth-child(1) > a")
      .attr("href")
      ?.replace(/.*\//, "")
      .replace(/-episode-\d+$/, "");
    return {
      movie_id,
      gogo_id: id,
      name: name.replace("(Dub)", "").trim(),
      isDubbed,
      alias_name,
      genres,
      type,
      totalEpisodes,
      status,
      releasedOn,
      poster,
      plot,
      ep_id,
    };
  } catch (e: any) {
    throw NOT_FOUND_ERROR;
  }
}
