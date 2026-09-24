import config from "@/utils/config";
import type { InfoData } from "@/utils/interface";
import axios from "axios";
import { Fragment } from "react";
import { getHomeList } from "./HomeSection";
import { Backdrop } from "./ui/Backdrop";
import { ButtonLink } from "./ui/Button";
import { formatFormat, formatStatus, infoHref, plainText, ratingLabel } from "./ui/format";
import { InfoIcon, PlayIcon } from "./ui/icons";
import { HERO_FRAME, PAGE_TOP } from "./ui/layout";

type Info = InfoData & { score?: string; availableEpisodes?: { number: number; ep_id: string }[] };

/**
 * Billboard for the #1 title on the Popular list. Uses only existing endpoints:
 * `/api/popular` (shared with the row) and `/api/info` for banner, synopsis and genres.
 */
export async function Hero() {
  let id: string | undefined;
  let data: Info | undefined;
  let listArt: string | undefined; // 16:9 listing art, handed to the details sheet
  try {
    if (config.hostname) {
      const popular = await getHomeList("popular");
      id = popular?.results?.[0]?.id;
      listArt = popular?.results?.[0]?.img;
      if (id) {
        const response = await axios.get(`${config.hostname}/api/info?id=${id}`);
        data = response.data;
      }
    }
  } catch {
    data = undefined;
  }

  // No featured title: keep the rows clear of the fixed navbar.
  if (!id || !data) return <div className={PAGE_TOP} />;

  const title = data.title?.english || data.name || data.title?.romaji || "";
  const synopsis = plainText(data.plot);
  const first = data.availableEpisodes?.[0];
  const playHref = first
    ? `/watch/${first.ep_id}`
    : data.totalEpisodes && data.ep_id
      ? `/watch/${data.ep_id}-episode-1`
      : undefined;
  const rating = ratingLabel(data.averageScore, data.score);
  const year = data.seasonYear ?? data.startDate?.year ?? data.releasedOn;
  const episodes = data.episodes ?? data.totalEpisodes;

  // "TV • Action • Comedy • 2025 • 12 Episodes • Airing"
  const meta = [
    formatFormat(data.format),
    ...(data.genres?.slice(0, 2) ?? []),
    year ? String(year) : undefined,
    episodes ? (episodes === 1 ? "1 Episode" : `${episodes} Episodes`) : undefined,
    formatStatus(data.status),
  ].filter(Boolean) as string[];

  return (
    <section aria-labelledby="hero-title" className={HERO_FRAME} data-morph-rect="">
      <Backdrop banner={data.bannerImage} cover={data.poster} highPriority variant="card" />
      <div className="w-full max-w-3xl animate-fade-up p-5 pb-6 sm:p-8 lg:p-[3.125rem]">
        <p className="text-xs font-medium tracking-[0.2em] text-accent-text uppercase md:text-sm">#1 in Popular</p>
        <h2
          id="hero-title"
          className="mt-2 line-clamp-3 text-[clamp(2.25rem,5vw,5rem)] leading-[1.02] font-bold tracking-tight text-balance text-white md:line-clamp-2"
        >
          {title}
        </h2>
        {meta.length > 0 && (
          <p className="mt-3 flex flex-wrap items-center gap-x-2 text-base font-medium text-white md:mt-4 md:text-lg">
            {rating ? <span className="mr-1 text-positive">{rating}</span> : null}
            {meta.map((item, i) => (
              <Fragment key={item + i}>
                {i > 0 && (
                  <span aria-hidden="true" className="text-white/60">
                    &bull;
                  </span>
                )}
                <span>{item}</span>
              </Fragment>
            ))}
          </p>
        )}
        {synopsis && (
          <p className="mt-3 line-clamp-3 max-w-[35rem] text-base leading-[1.4] text-white/85 md:mt-4 md:text-xl">
            {synopsis}
          </p>
        )}
        <div className="mt-5 flex flex-wrap gap-3 md:mt-6">
          {playHref && (
            <ButtonLink href={playHref} size="lg" pill icon={<PlayIcon className="size-6" />}>
              Play
            </ButtonLink>
          )}
          <ButtonLink
            href={infoHref(id)}
            scroll={false}
            data-details-id={id}
            data-details-title={title}
            data-details-image={data.bannerImage || listArt || data.poster}
            variant="secondary" size="lg" pill icon={<InfoIcon className="size-6" />}>
            More Info
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
