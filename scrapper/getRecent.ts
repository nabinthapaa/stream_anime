import { load, paginate, parseCharts, toEpId } from "./helpers";

export async function getRecent(page: string, type: number) {
  try {
    // animeheaven only carries subbed episodes, so DUB and CHINESE are empty
    if (type !== 1) return { meta: { totalResults: 0, hasNext: false }, results: [] };
    let $ = await load("/new.php");
    let episodes = parseCharts($)
      .filter((chart) => chart.episode)
      .map((chart) => ({
        id: chart.id,
        ep_id: toEpId(chart.id, chart.episode as number),
        name: chart.name,
        episode: `Episode ${chart.episode}`,
        img: chart.img,
      }));
    let { results, hasNext } = paginate(episodes, page);
    return { meta: { totalResults: results.length, hasNext }, results };
  } catch (e: any) {
    return { message: e.message };
  }
}
