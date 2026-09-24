import { NOT_FOUND_ERROR } from "@/utils";
import { absolute, episodeNumber, load, toEpId } from "./helpers";

export async function GetInfo(id: string) {
  try {
    let $ = await load(`/anime.php?${encodeURIComponent(id)}=`);
    let name = $(".infotitle").first().text().trim();
    if (!name) throw NOT_FOUND_ERROR;

    // "Episodes: 12  Year: 2016  Score: 8.2/10"
    let stats = $(".infoyear .inline").map((_, el) => $(el).text().trim()).get();
    let declared = Number(stats[0]);
    let availableEpisodes = $('a[href="gate.php"]')
      .map((_, el) => Number($(el).find(".watch2").text().trim()))
      .get()
      .filter((n) => Number.isFinite(n) && n > 0)
      .sort((a, b) => a - b)
      .map((number) => ({ number, ep_id: toEpId(id, number) }));
    let latest = availableEpisodes[availableEpisodes.length - 1];
    // Airing shows carry a "next episode in 3 Days 23 Hours" countdown
    let airing = /\d+\s+Days?\s+\d+\s+Hours?/i.test($("body").text());

    return {
      movie_id: id,
      gogo_id: id,
      name: name.replace("(Dub)", "").trim(),
      isDubbed: name.includes("(Dub)"),
      alias_name: id,
      genres: $(".infotags .boxitem").map((_, el) => $(el).text().trim()).get(),
      type: "",
      totalEpisodes: Math.max(Number.isFinite(declared) ? declared : 0, latest?.number ?? 0),
      status: airing ? "Ongoing" : "Completed",
      releasedOn: stats[1] || "",
      score: stats[2] || "",
      otherNames: [$(".infotitlejp").first().text().trim()].filter(Boolean),
      poster: absolute($(".posterimg").attr("src")),
      plot: $(".infodes").first().text().trim(),
      ep_id: id,
      availableEpisodes,
      latestEpisode: episodeNumber(latest?.ep_id),
    };
  } catch (e: any) {
    throw NOT_FOUND_ERROR;
  }
}
