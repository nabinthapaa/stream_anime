import axios from "axios";
import * as cheerio from "cheerio";
import config from "@/utils/config";

export const http = axios.create({
  baseURL: config.website,
  timeout: 15000,
  headers: {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Accept-Language": "en-US,en;q=0.9",
  },
});

export async function load(path: string) {
  let { data } = await http.get(path);
  return cheerio.load(data);
}

// Relative "image.php?abc" -> "https://animeheaven.me/image.php?abc"
export function absolute(url: string | undefined) {
  if (!url) return undefined;
  return new URL(url, config.website).href;
}

// "anime.php?k1r85" / "anime.php?k1r85=" -> "k1r85"
export function animeIdFromHref(href: string | undefined) {
  return href?.match(/anime\.php\?([a-z0-9]+)/i)?.[1];
}

// Episode ids are "<anime id>-episode-<n>", e.g. "k1r85-episode-3"
export function toEpId(id: string, episode: number) {
  return `${id}-episode-${episode}`;
}

// "k1r85-episode-3" -> "k1r85"
export function toAnimeId(ep_id: string | undefined) {
  return ep_id?.replace(/-episode-\d+$/, "");
}

export function episodeNumber(ep_id: string | undefined) {
  let match = ep_id?.match(/-episode-(\d+)$/);
  return match ? Number(match[1]) : undefined;
}

// The video hosts reject cross-site requests, so the browser streams them through /api/video
export function proxiedVideo(src: string) {
  return `/api/video?src=${encodeURIComponent(src)}`;
}

export interface Chart {
  id: string;
  name: string;
  japaneseName?: string;
  episode?: number;
  img?: string;
}

// Listing pages (new.php, popular.php, season pages) render every title as a `.chart`
export function parseCharts($: cheerio.CheerioAPI) {
  let charts: Chart[] = [];
  $(".chart").each((_, el) => {
    let link = $(el).find(".charttitle a");
    let id = animeIdFromHref(link.attr("href"));
    if (!id) return;
    let episode = Number($(el).find(".chartepm").first().text().trim());
    charts.push({
      id,
      name: link.text().trim(),
      japaneseName: $(el).find(".charttitlejp").text().trim() || undefined,
      episode: Number.isFinite(episode) && episode > 0 ? episode : undefined,
      img: absolute($(el).find("img.coverimg").attr("src")),
    });
  });
  return charts;
}

// Search and tag pages render titles as `.similarimg` tiles
export function parseTiles($: cheerio.CheerioAPI) {
  let tiles: Chart[] = [];
  $(".similarimg").each((_, el) => {
    let link = $(el).find(".similarname a");
    let id = animeIdFromHref(link.attr("href"));
    if (!id) return;
    tiles.push({
      id,
      name: link.text().trim(),
      img: absolute($(el).find("img.coverimg").attr("src")),
    });
  });
  return tiles;
}

export const PAGE_SIZE = 20;

// animeheaven lists are not paginated, so page them here
export function paginate<T>(items: T[], page: string | number | undefined) {
  let start = (Math.max(Number(page) || 1, 1) - 1) * PAGE_SIZE;
  return {
    results: items.slice(start, start + PAGE_SIZE),
    hasNext: start + PAGE_SIZE < items.length,
  };
}

// Card shape the list pages expect
export function toSeriesCard(chart: Chart) {
  return {
    id: chart.id,
    name: chart.name.replace("(Dub)", "").trim(),
    date: "",
    img: chart.img,
    isDub: chart.name.includes("(Dub)"),
  };
}
