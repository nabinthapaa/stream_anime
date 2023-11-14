import { NOT_FOUND_ERROR } from "@/utils";
import axios from "axios";
import * as cheerio from "cheerio";

export async function GetInfo(id: string) {
  try {
    let url = `https://gogoanimehd.io/category/${id}`;
    let response = await axios.get(url);
    let html = response.data;

    let $ = cheerio.load(html);
    let anime_details = $(".anime_info_body_bg");
    let movie_id = $("#movie_id").attr("value");
    let alias_name = $("#alias_name");
    let name = anime_details.find("h1").text();
    let isDubbed = name.includes("(Dub)");
    let genre: string[] = [];
    let plot = anime_details
      .find("p:nth-child(5)")
      .text()
      .replace(/^Plot Summary:\s*/gm, "");
    let otherNames = anime_details
      .find("p:nth-child(9)")
      .text()
      .replace(/^Other name:\s*/gm, "");
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
        genre.push($(el).text().replace(/,\s*/g, ""));
      });
    let type = anime_details.find("[href^='/sub-category/']").text().trim();
        let totalEpisodes = Number(
      $("#episode_page li").last().find("a").attr("ep_end")
    );
    let poster = anime_details.find("img").attr("src");


    let ep_url = `https://ajax.gogo-load.com/ajax/load-list-episode?ep_start=0&ep_end=1&id=${movie_id}&default_ep=0&alias=${alias_name}`
    let {data} = await axios.get(ep_url);
    let $_ = cheerio.load(data);
    let ep_id = $_('#episode_related > li:nth-child(1) > a').attr('href')?.replace(/.*\//,"").replace(/-episode-\d+$/, "");

    return {
      movie_id,
      id,
      name: name.replace("(Dub)", "").trim(),
      isDubbed,
      genre,
      type,
      totalEpisodes,
      status,
      releasedOn,
      otherNames: !isDubbed ? otherNames.split(";") : otherNames.split(","),
      poster,
      plot,
      ep_id
    };
  } catch (e: any) {
    throw NOT_FOUND_ERROR;
  }
}


