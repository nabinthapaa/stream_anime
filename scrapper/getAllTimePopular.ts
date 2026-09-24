import { INTERNAL_ERROR } from "@/utils";
import { load, paginate, parseCharts, toSeriesCard } from "./helpers";

export async function getAllTimePopular(page?: string) {
  try {
    let $ = await load("/popular.php");
    let { results, hasNext } = paginate(parseCharts($).map(toSeriesCard), page);
    return { meta: { totalResults: results.length, hasNext }, results };
  } catch (e: any) {
    throw INTERNAL_ERROR;
  }
}
