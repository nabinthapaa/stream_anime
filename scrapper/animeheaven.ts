import * as cheerio from "cheerio";
import axios from "axios";

// AnimeHeaven.Me scraper. Every episode has a short-lived "gate key": the
// anime page tags each episode link with its key, and setting the `key`
// cookie before visiting gate.php serves the <video>/<source> embed for it.

const BASE_URL = "https://animeheaven.me";

const http = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Accept-Language": "en-US,en;q=0.9",
  },
});

export interface AHEpisode {
  number: number;
  key: string;
}

export interface AHAnime {
  id: string;
  title: string;
  japaneseTitle?: string;
  episodes: AHEpisode[];
}

export interface AHVideos {
  key: string;
  sources: string[];
}

export async function getAHAnime(id: string): Promise<AHAnime> {
  let { data } = await http.get(`/anime.php?${encodeURIComponent(id)}=`);
  let $ = cheerio.load(data);

  let episodes: AHEpisode[] = [];
  $('a[href="gate.php"]').each((_, el) => {
    let $el = $(el);
    let key = $el.attr("id")?.trim();
    let number = Number($el.find(".watch2").text().trim());
    if (key && Number.isFinite(number)) episodes.push({ number, key });
  });

  return {
    id,
    title: $(".infotitle").first().text().trim(),
    japaneseTitle: $(".infotitlejp").first().text().trim() || undefined,
    episodes,
  };
}

export async function getAHVideos(key: string): Promise<AHVideos> {
  let { data } = await http.get("/gate.php", {
    headers: { Cookie: `key=${key}` },
  });
  let $ = cheerio.load(data);
  let sources = $("source")
    .map((_, el) => $(el).attr("src")?.trim())
    .get()
    .filter(Boolean) as string[];
  return { key, sources: [...new Set(sources)] };
}