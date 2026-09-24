import { INTERNAL_ERROR } from "@/utils";
import { load, paginate, parseTiles, toSeriesCard } from "./helpers";

export async function getMovies(alph = "", page?: string) {
  try {
    let $ = await load("/tags.php?tag=Movie");
    let movies = parseTiles($).map(toSeriesCard);
    // "0" = titles starting with a digit or symbol, a letter = that letter, "" / "all" = everything
    if (alph && alph !== "all") {
      movies = movies.filter((movie) => {
        let first = movie.name.charAt(0).toUpperCase();
        return alph === "0" ? !/[A-Z]/.test(first) : first === alph.toUpperCase();
      });
    }
    let { results, hasNext } = paginate(movies, page);
    return { meta: { totalResults: results.length, hasNext }, results };
  } catch (e: any) {
    throw INTERNAL_ERROR;
  }
}
