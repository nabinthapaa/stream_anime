import { RowCardsSkeleton } from "@/skeleton/Card";
import config from "@/utils/config";
import axios from "axios";
import { cache, Suspense } from "react";
import { ButtonLink } from "./ui/Button";
import { HoverPreview } from "./ui/HoverPreview";
import { PosterCard } from "./ui/PosterCard";
import { RowSection, RowTrack } from "./ui/Row";
import { titleCase, infoHref } from "./ui/format";
import { AlertIcon, TvOffIcon } from "./ui/icons";
import { ROW_SIZES } from "./ui/layout";

interface HomeSectionProps {
  title: string;
  /** API list name (`/api/<link>`), also the default "Explore all" page */
  link: string;
  /** Override for the "Explore all" destination */
  href?: string;
}

interface HomeItem {
  id: string;
  name: string;
  img?: string;
  ep_id?: string;
  episode?: string;
  date?: string;
  genres?: string[];
  isDub?: boolean;
}

/**
 * Same request as before (`/api/<link>`), memoised per render so the hero and
 * the row can share one call for the same list.
 */
export const getHomeList = cache(async (link: string) => {
  const url = `${config.hostname}/api/${link}`;
  const { data } = await axios.get(url);
  return data as { results?: HomeItem[] };
});

export function HomeSection({ title, link, href }: HomeSectionProps) {
  return (
    <RowSection id={`row-${link}`} title={title} href={href ?? `/${link}`}>
      <Suspense fallback={<RowCardsSkeleton />}>
        <Cards link={link} title={title} />
      </Suspense>
    </RowSection>
  );
}

/** "Episode 1155" -> "EP 1155" */
function episodeBadge(episode?: string) {
  const n = episode?.match(/\d+/)?.[0];
  return n ? `EP ${n}` : undefined;
}

async function Cards({ link, title }: { link: string; title: string }) {
  if (!config.hostname) return null;
  let results: HomeItem[] | undefined;
  let failed = false;
  try {
    results = (await getHomeList(link))?.results;
  } catch {
    failed = true;
  }

  if (failed || !results?.length) {
    const Icon = failed ? AlertIcon : TvOffIcon;
    return (
      <div className="px-page py-1">
        <div
          role={failed ? "alert" : undefined}
          className="flex flex-col items-start gap-4 rounded-xl bg-surface p-5 ring-1 ring-line-subtle sm:flex-row sm:items-center"
        >
          <span
            className={
              "grid size-11 shrink-0 place-items-center rounded-full " +
              (failed ? "bg-danger/10 text-danger" : "bg-surface-overlay text-neutral-400")
            }
          >
            <Icon className="size-5" />
          </span>
          <div className="flex-1">
            <p className="font-medium text-white">
              {failed ? `${title} didn’t load` : `No ${title.toLowerCase()} yet`}
            </p>
            <p className="text-sm text-neutral-400">
              {failed ? "The source is slow or unavailable right now." : "Check back soon, new titles land daily."}
            </p>
          </div>
          {failed && (
            <ButtonLink href="/" prefetch={false} variant="secondary" size="sm" pill>
              Try again
            </ButtonLink>
          )}
        </div>
      </div>
    );
  }

  return (
    <RowTrack label={title}>
      {results.map((element) => {
        // Card body opens the details modal (/info/<id>, intercepted); the preview's Play goes to watch.
        const href = infoHref(element.id);
        const genres = element.genres?.slice(0, 3).map(titleCase);
        const meta = element.episode || (element.date ? `Released ${element.date}` : undefined);
        return (
          <HoverPreview
            key={element.ep_id ?? element.id}
            preview={{
              id: element.id,
              title: element.name,
              image: element.img,
              playHref: element.ep_id ? `/watch/${element.ep_id}` : undefined,
              meta,
              genres,
              isDub: element.isDub,
            }}
          >
            <PosterCard
              variant="row"
              href={href}
              title={element.name}
              image={element.img}
              badge={element.isDub ? "Dub" : undefined}
              edgeBadge={episodeBadge(element.episode)}
              meta={meta ?? genres?.join(", ")}
              sizes={ROW_SIZES}
            />
          </HoverPreview>
        );
      })}
    </RowTrack>
  );
}
