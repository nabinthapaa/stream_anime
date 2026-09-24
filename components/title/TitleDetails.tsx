import { Plot } from "@/app/info/[id]/Components/Plot";
import { Fragment } from "react";
import { ListButton } from "../storage/ListButton";
import { ButtonLink } from "../ui/Button";
import { formatFormat, formatSeason, formatStatus, imageSrc, ratingLabel } from "../ui/format";
import { DETAILS_HEADING_ID } from "../ui/layout";
import { PlayIcon } from "../ui/icons";
import type { TitleInfo } from "./data";
import { EpisodeList, type EpisodeRow } from "./EpisodeList";
import { HeroImage } from "./HeroImage";



/**
 * The "More Info" sheet. Rendered inside the intercepted modal and on the
 * full /info/[id] page, so both look identical.
 */
export function TitleDetails({
  id,
  data,
  headingLevel = 1,
  wideImage,
  placeholderSrc,
}: {
  id: string;
  data: TitleInfo;
  headingLevel?: 1 | 2;
  /** 16:9 listing art from the card that opened the sheet (used when there's no banner) */
  wideImage?: string;
  /** The card's already-loaded `/_next/image` URL, painted first during the morph */
  placeholderSrc?: string;
}) {
  const Heading = headingLevel === 1 ? "h1" : "h2";
  const title = data.title?.english || data.name || data.title?.romaji || id;
  const banner = imageSrc(data.bannerImage);
  const poster = imageSrc(data.poster);
  const wide = banner || imageSrc(wideImage);
  const hero = wide || poster;

  // Only link to episodes the source actually hosts; fall back to 1..totalEpisodes.
  const episodes: EpisodeRow[] = data.availableEpisodes?.length
    ? data.availableEpisodes.map((ep) => ({ number: ep.number, href: `/watch/${ep.ep_id}` }))
    : Array.from({ length: data.totalEpisodes || 0 }, (_, i) => ({
        number: i + 1,
        href: `/watch/${data.ep_id}-episode-${i + 1}`,
      }));
  const first = episodes[0];
  const latest = episodes[episodes.length - 1];
  const partial = data.availableEpisodes?.length && first && first.number > 1;

  const rating = ratingLabel(data.averageScore, data.score);
  const year = data.seasonYear ?? data.startDate?.year ?? data.releasedOn;
  const episodeCount = data.episodes ?? (data.totalEpisodes || undefined);
  const otherNames = [data.title?.romaji, data.title?.native, ...(data.otherNames ?? []), data.name]
    .filter((n): n is string => Boolean(n) && n !== title)
    .filter((n, i, all) => all.indexOf(n) === i);

  const facts: [string, string | undefined][] = [
    ["Genres", data.genres?.join(", ")],
    ["Status", formatStatus(data.status)],
    ["Format", formatFormat(data.format) ?? (data.type && data.type !== "ANIME" ? data.type : undefined)],
    ["Season", formatSeason(data.season, data.seasonYear) ?? (data.releasedOn ? String(data.releasedOn) : undefined)],
    ["Other names", otherNames.join(", ")],
  ];

  return (
    <article>
      {/* 16:9 hero with a gradient into the panel */}
      <div className="relative aspect-[4/3] w-full bg-surface-raised sm:aspect-video">
        <HeroImage
          src={hero}
          placeholder={placeholderSrc}
          preload
          sizes="(min-width: 1800px) 1100px, (min-width: 640px) 850px, 100vw"
          className={wide ? "object-cover" : "object-cover object-[center_25%]"}
        />
        <div className="absolute inset-0 bg-linear-to-t from-surface via-surface/30 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 px-5 pb-5 sm:px-12 sm:pb-10" data-morph-fade="">
          <Heading
            id={DETAILS_HEADING_ID}
            className="line-clamp-3 max-w-[90%] text-3xl leading-[1.05] font-bold tracking-tight text-balance text-white drop-shadow-lg sm:text-4xl lg:text-5xl"
          >
            {title}
          </Heading>
          {first && (
            <div className="mt-4 flex flex-wrap gap-3 sm:mt-6">
              <ButtonLink href={first.href} size="lg" icon={<PlayIcon className="size-6" />} className="px-6 sm:px-8">
                {episodes.length > 1 ? `Play E${first.number}` : "Play"}
              </ButtonLink>
              <ListButton entry={{ id, title, image: wide ?? poster }} />
              {episodes.length > 1 && (
                <ButtonLink href={latest.href} variant="secondary" size="lg" className="px-5">
                  Latest &middot; E{latest.number}
                </ButtonLink>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-6 px-5 pt-2 pb-8 sm:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] sm:gap-8 sm:px-12" data-morph-fade="">
        <div className="min-w-0 space-y-4">
          <p className="flex flex-wrap items-center gap-x-2.5 gap-y-2 text-base text-white/70">
            {rating ? <span className="font-medium text-positive">{rating}</span> : null}
            {year && <span>{year}</span>}
            {episodeCount ? <span>{episodeCount === 1 ? "1 Episode" : `${episodeCount} Episodes`}</span> : null}
            {data.duration ? <span>{data.duration}m</span> : null}
            {[formatFormat(data.format), data.isDubbed ? "Dub" : "Sub"].filter(Boolean).map((badge) => (
              <span
                key={badge}
                className="rounded-sm px-1.5 text-xs leading-5 font-medium text-white/90 uppercase ring-1 ring-white/40 ring-inset"
              >
                {badge}
              </span>
            ))}
          </p>
          {data.plot ? <Plot data={data.plot} /> : <p className="text-sm text-neutral-400">No synopsis available.</p>}
        </div>
        <dl className="space-y-3 text-sm">
          {facts
            .filter(([, v]) => v)
            .map(([label, value]) => (
              <Fragment key={label}>
                <div>
                  <dt className="inline text-white/50">{label}: </dt>
                  <dd className="inline break-words text-white">{value}</dd>
                </div>
              </Fragment>
            ))}
        </dl>
      </div>

      <div className="px-5 pb-10 sm:px-12 sm:pb-12" data-morph-fade="">
        <EpisodeList
          episodes={episodes}
          thumbnail={hero}
          seriesName={title}
          duration={data.duration}
          latest={episodes.length > 1 ? latest?.number : undefined}
          note={partial ? `Our source currently hosts episodes ${first.number}–${latest.number}.` : undefined}
        />
      </div>
    </article>
  );
}
