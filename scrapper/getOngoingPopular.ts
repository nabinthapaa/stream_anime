import { load, paginate, parseCharts, toEpId } from "./helpers";

export async function getOngoingPopular(page: string) {
  try {
    // The header links the current season page, e.g. "2025fall.php" titled "2025 Fall Shows"
    let $ = await load("/new.php");
    let season = $("a.headeritem2")
      .filter((_, el) => /\d{4} \w+ Shows/.test($(el).attr("title") || ""))
      .first()
      .attr("href");
    if (!season) throw new Error("Current season page not found");
    let charts = parseCharts(await load(`/${season}`));
    let ongoing = charts.map((chart) => ({
      id: chart.id,
      name: chart.name,
      genres: [] as string[],
      recent_ep_id: chart.episode ? toEpId(chart.id, chart.episode) : undefined,
      img: chart.img,
      isDub: chart.name.includes("(Dub)"),
    }));
    let { results, hasNext } = paginate(ongoing, page);
    return { meta: { totalResult: results.length, hasNext }, results };
  } catch (e: any) {
    return new Response(JSON.stringify({ message: e.message }), {
      status: 500,
    });
  }
}
