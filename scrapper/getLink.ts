import { NOT_FOUND_ERROR } from "@/utils";
import axios from "axios";
import * as cheerio from "cheerio";
import config from "@/utils/config";

export async function getLink(ep_id: string) {
  try {
    let url_str = `${config.website}/${ep_id}`;
    let response = await axios.get(url_str);
    let $ = cheerio.load(response.data);
    let alias_name = $("#alias_anime").attr("value");
    let Links = new Map();
    $(".anime_muti_link ul li").each((_, el) => {
      let link1 = $(el).find("a");
      let server_name = $(el).attr("class");
      let server_link = link1.attr("data-video");
      Links.set(server_name, server_link);
    });
    let movie_id = $("#movie_id").attr("value");
    let links = Object.fromEntries(Links);
    return {
      movie_id,
      alias_name,
      links,
    };
  } catch (e: any) {
    throw NOT_FOUND_ERROR;
  }
}
