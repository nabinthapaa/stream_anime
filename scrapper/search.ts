import { NOT_FOUND_ERROR } from "@/utils";
import { load, paginate, parseTiles, toSeriesCard } from "./helpers";

export async function search(key: string, page?: number) {
  try {
    let $ = await load(`/search.php?s=${encodeURIComponent(key)}`);
    let { results, hasNext } = paginate(parseTiles($).map(toSeriesCard), page);
    return { meta: { totalResults: results.length, hasNext }, results };
  } catch (e: any) {
    throw NOT_FOUND_ERROR;
  }
}
