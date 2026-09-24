import { Player, type PlayerEpisode } from "@/components/player/Player";
import { ButtonLink } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  episodeFromId,
  imageSrc,
  infoHref,
  plainText,
  ratingLabel,
} from "@/components/ui/format";
import config from "@/utils/config";
import type { InfoData } from "@/utils/interface";
import axios from "axios";
import type { Metadata } from "next";
import { getImageProps } from "next/image";
import { detailsFallbackHref } from "@/components/navigation/history";
import { cache } from "react";

type Info = InfoData & {
  score?: string;
  availableEpisodes?: { number: number; ep_id: string }[];
};
type WatchData = {
  alias_name?: string;
  sources?: string[];
  links?: Record<string, string | undefined>;
};

const toAnimeId = (ep_id: string) => ep_id.replace(/-episode-\d+$/, "");

const getWatch = cache(async (id: string) => {
  const { data } = await axios.get(`${config.hostname}/api/watch?ep_id=${id}`);
  return data as WatchData;
});

const getInfo = cache(async (animeId: string) => {
  const { data } = await axios.get(`${config.hostname}/api/info?id=${animeId}`);
  return data as Info;
});

export async function generateMetadata(props: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await props.params;
  const episode = episodeFromId(id);
  const info = await getInfo(toAnimeId(id)).catch(() => undefined);
  const name = info?.title?.english || info?.name || "Watch";
  return { title: `${name}${episode ? ` · Episode ${episode}` : ""}` };
}

export default async function Watch(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;
  const animeId = toAnimeId(id);
  const current = episodeFromId(id);

  const [watch, info] = await Promise.all([
    getWatch(id).catch(() => undefined),
    getInfo(animeId).catch(() => undefined),
  ]);

  const name = info?.title?.english || info?.name || animeId;
  const sources = watch?.sources?.length
    ? watch.sources
    : (Object.values(watch?.links ?? {}).filter(Boolean) as string[]);

  const episodes: PlayerEpisode[] = (info?.availableEpisodes ?? []).map(
    (ep) => ({
      number: ep.number,
      href: `/watch/${ep.ep_id}`,
      current: ep.number === current,
      progressKey: `resume:${ep.ep_id}`,
    }),
  );
  const index = episodes.findIndex((ep) => ep.current);
  const prev = index > 0 ? episodes[index - 1] : undefined;
  const next =
    index >= 0 && index < episodes.length - 1 ? episodes[index + 1] : undefined;

  const art = imageSrc(info?.bannerImage) ?? imageSrc(info?.poster);
  const poster = art
    ? getImageProps({ src: art, alt: "", width: 1280, height: 720 }).props.src
    : undefined;
  const details = infoHref(animeId);
  const synopsis = plainText(info?.plot) || undefined;
  const advisory = [
    "Sub",
    info?.seasonYear ?? info?.startDate?.year ?? info?.releasedOn,
    ratingLabel(info?.averageScore, info?.score),
    ...(info?.genres?.slice(0, 2) ?? []),
  ]
    .filter(Boolean)
    .join(" \u00b7 ");

  return (
    <>
      <section aria-label="Player" className="relative z-[55] bg-black">
        {sources.length ? (
          <Player
            sources={sources}
            title={name}
            episodeLabel={current !== undefined ? `E${current}` : undefined}
            // ← returns to where the user came from (home with the details modal open, a
            // grid page...). With no in-app entry it opens home with this title's details.
            backHref={detailsFallbackHref(animeId)}
            nextEpisode={
              next
                ? { href: next.href, label: `E${next.number}`, image: art }
                : undefined
            }
            prevEpisode={
              prev ? { href: prev.href, label: `E${prev.number}` } : undefined
            }
            episodes={episodes.length > 1 ? episodes : undefined}
            storageKey={`resume:${id}`}
            poster={poster}
            synopsis={synopsis}
            advisory={advisory}
            artwork={art}
            sourcesHref={details}
          />
        ) : (
          <div className="grid aspect-video place-items-center px-page md:aspect-auto md:h-svh">
            <EmptyState
              tone="error"
              title="This episode isn't available"
              message={
                watch
                  ? "No video sources were found for this episode. Try another episode."
                  : "We couldn't load this episode. It may not exist, or the source is unavailable right now."
              }
            >
              <ButtonLink href={detailsFallbackHref(animeId)}>
                Series details
              </ButtonLink>
              <ButtonLink href="/" variant="secondary">
                Back to Home
              </ButtonLink>
            </EmptyState>
          </div>
        )}
      </section>
    </>
  );
}
