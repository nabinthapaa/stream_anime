import config from "@/utils/config";
import axios from "axios";
import * as cheerio from "cheerio";

export async function getAllGenres() {
  try {
    let url = config.website as string;
    let { data } = await axios.get(url);
    let $ = cheerio.load(data);
    let genres: { [key: string]: string | undefined }[] = [];
    $(".menu_series.genre ul li").each((_, el) => {
      let id = $(el).find("a").attr("href")?.replace("/genre/", "");
      let genre = $(el).find("a").attr("title");
      genres.push({ id, genre });
    });
    return { totalGenres: genres.length, genres };
  } catch (e: any) {
    return new Response(JSON.stringify({ message: e.message }), {
      status: 500,
    });
  }
}
