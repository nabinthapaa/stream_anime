import axios from "axios";
import * as cheerio from "cheerio";
import { scrapeCard } from "./scrapeCard";


export async function getMovies(alph = "", page?: string) {
    let url = `https://gogoanimehd.io/anime-movies.html?aph=${alph}&page=${page}`;
    let response = await axios.get(url);
    let data = response.data;
    const $ = cheerio.load(data);
    //@ts-ignore
    let results = scrapeCard($('.last_episodes').html(), true);
    let meta = {
        totalResults: results.length,
        hasNext: $(".pagination .selected").next().length ? true : false,
    };
    return { meta, results };
}