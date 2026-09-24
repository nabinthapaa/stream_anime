import Image from "next/image";
import Link from "next/link";
import { cn } from "./cn";
import { imageSrc } from "./format";

export { GRID_SIZES } from "./layout";

export interface PosterCardProps {
  href: string;
  title: string;
  /** 16:9 listing art (480x270 from the source) */
  image?: string;
  /** Secondary line: episode, release date, genres... */
  meta?: string;
  /** Small label, e.g. "Dub" (top-right) */
  badge?: string;
  /** Accent label, e.g. "EP 12" (top-left, clear of the title) */
  edgeBadge?: string;
  /** Kept for API compatibility; the card body always opens its href */
  action?: "play" | "info";
  sizes: string;
  /**
   * `row`: Netflix boxart, title on the art; the hover preview supplies the details.
   * `grid`: same tile plus a meta line in the scrim and a subtle hover lift.
   */
  variant?: "grid" | "row";
}

/**
 * Netflix-style 16:9 card. The art carries no title logo, so the title sits on a bottom
 * scrim (2 lines max). Hover effects use transforms only, so neighbours never shift.
 */
export function PosterCard({ href, title, image, meta, badge, edgeBadge, sizes, variant = "grid" }: PosterCardProps) {
  const src = imageSrc(image);
  const detailsId = href.startsWith("/info/") ? decodeURIComponent(href.slice("/info/".length)) : undefined;
  const isGrid = variant === "grid";
  const label = [title, meta].filter(Boolean).join(", ");

  return (
    <Link
      href={href}
      // Without JS (before hydration) this is a plain link to the full details page.
      scroll={detailsId ? false : undefined}
      aria-label={label}
      className="group/card block rounded-xl"
      // Cards that open the details modal (handled by DetailsHost)
      data-details-id={detailsId}
      data-details-title={detailsId ? title : undefined}
      data-details-image={detailsId ? image : undefined}
    >
      <div
        data-morph-rect=""
        className={cn(
          "relative aspect-video overflow-hidden rounded-xl bg-surface-raised",
          isGrid &&
            "ring-1 ring-white/5 transition-[scale,box-shadow] duration-300 ease-cinematic will-change-transform " +
              "group-hover/card:z-10 group-hover/card:scale-[1.04] group-hover/card:shadow-card group-hover/card:ring-white/20 " +
              "group-focus-visible/card:scale-[1.04] group-focus-visible/card:shadow-card",
        )}
      >
        {src ? (
          <Image src={src} alt="" fill sizes={sizes} className="object-cover" />
        ) : (
          <div className="absolute inset-0 bg-linear-to-br from-surface-overlay to-surface" />
        )}

        {/* Title scrim */}
        <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-3/4 bg-linear-to-t from-black/90 via-black/45 to-transparent" />
        <div aria-hidden="true" className="absolute inset-x-0 bottom-0 px-3 pb-2.5 sm:px-3.5 sm:pb-3">
          <p className="line-clamp-2 text-sm leading-tight font-semibold text-white drop-shadow-sm sm:text-[0.9375rem]">
            {title}
          </p>
          {isGrid && meta && <p className="mt-0.5 truncate text-xs text-white/70">{meta}</p>}
        </div>

        {edgeBadge && (
          <span className="absolute top-2 left-2 rounded-sm bg-accent-strong px-1.5 py-0.5 text-[0.6875rem] leading-4 font-semibold tracking-wide whitespace-nowrap text-white uppercase shadow-sm">
            {edgeBadge}
          </span>
        )}
        {badge && (
          <span className="absolute top-2 right-2 rounded-sm bg-black/70 px-1.5 py-0.5 text-[0.6875rem] font-medium tracking-wide text-white uppercase ring-1 ring-white/20">
            {badge}
          </span>
        )}
      </div>
    </Link>
  );
}
