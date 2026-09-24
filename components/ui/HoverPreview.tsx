"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, type FocusEvent, type PointerEvent, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { cn } from "./cn";
import { formatFormat, imageSrc, infoHref, ratingLabel } from "./format";
import { ChevronDownIcon, PlayIcon } from "./icons";
import { PREVIEW_SIZES } from "./layout";
import { loadTitleDetails } from "../title/detailsCache";
import { setPreviewOwner } from "../title/morph";

export interface PreviewData {
  /** Title id, used for `/info/<id>` and the lazy details fetch */
  id: string;
  title: string;
  image?: string;
  /** Direct episode link when the list item already has one (recent releases) */
  playHref?: string;
  meta?: string;
  genres?: string[];
  isDub?: boolean;
}

/** The subset of `/api/info` the preview uses. */
interface Details {
  bannerImage?: string;
  averageScore?: number;
  score?: string;
  format?: string;
  seasonYear?: number;
  episodes?: number;
  totalEpisodes?: number;
  genres?: string[];
  availableEpisodes?: { number: number; ep_id: string }[];
}

interface Position {
  left: number;
  top: number;
  width: number;
  origin: "left" | "center" | "right";
}

const OPEN_DELAY = 450;
const FOCUS_DELAY = 150;
const CLOSE_GRACE = 80;
const SCALE = 1.5;

/**
 * Netflix-style delayed hover preview. After a short hover, a 1.5x card grows out of
 * the poster (edge cards anchor left/right). It lives in a portal, so it never clips
 * inside the row and never shifts neighbouring cards. On open it lazily loads the
 * title's details (banner, score, genres) and enriches itself in place.
 * Mouse only: touch keeps the plain poster; keyboard focus shows the preview as a
 * visual aid while the card link itself stays the accessible control.
 */
export function HoverPreview({ preview, children }: { preview: PreviewData; children: ReactNode }) {
  const anchorRef = useRef<HTMLDivElement>(null);
  const openTimer = useRef<number | undefined>(undefined);
  const closeTimer = useRef<number | undefined>(undefined);
  const [position, setPosition] = useState<Position | null>(null);
  const [details, setDetails] = useState<Details | null | undefined>(undefined);

  const clearTimers = () => {
    window.clearTimeout(openTimer.current);
    window.clearTimeout(closeTimer.current);
  };

  const measure = (): Position | null => {
    const el = anchorRef.current;
    if (!el) return null;
    const rect = el.getBoundingClientRect();
    const viewport = document.documentElement.clientWidth;
    const width = rect.width * SCALE;
    let left = rect.left + rect.width / 2 - width / 2;
    let origin: Position["origin"] = "center";
    if (left < 4) {
      left = rect.left;
      origin = "left";
    } else if (left + width > viewport - 4) {
      left = rect.right - width;
      origin = "right";
    }
    return {
      left: left + window.scrollX,
      top: rect.top + rect.height / 2 + window.scrollY,
      width,
      origin,
    };
  };

  const open = () => {
    setPosition(measure());
    if (details === undefined) loadTitleDetails(preview.id).then(setDetails);
  };

  const openAfter = (delay: number) => {
    clearTimers();
    openTimer.current = window.setTimeout(open, delay);
  };

  const scheduleClose = () => {
    window.clearTimeout(openTimer.current);
    window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => setPosition(null), CLOSE_GRACE);
  };

  const onPointerEnter = (e: PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    if (position) {
      window.clearTimeout(closeTimer.current);
      return;
    }
    openAfter(OPEN_DELAY);
  };

  const onFocus = (e: FocusEvent) => {
    if (e.target instanceof HTMLElement && e.target.matches(":focus-visible")) openAfter(FOCUS_DELAY);
  };

  // A click inside the preview navigates (modal or watch). Hand focus back to the card
  // first, so the modal can return focus to it on close, then dismiss the preview.
  const onPreviewClick = () => {
    anchorRef.current?.querySelector<HTMLElement>("a")?.focus({ preventScroll: true });
    clearTimers();
    setPosition(null);
  };

  // While open: close on any scroll (row or page), resize or Escape.
  useEffect(() => {
    if (!position) return;
    const close = () => setPosition(null);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("scroll", close, { capture: true, passive: true });
    window.addEventListener("resize", close);
    window.addEventListener("keydown", onKey);
    window.addEventListener("details:open", close);
    return () => {
      window.removeEventListener("details:open", close);
      window.removeEventListener("scroll", close, { capture: true });
      window.removeEventListener("resize", close);
      window.removeEventListener("keydown", onKey);
    };
  }, [position]);

  useEffect(() => clearTimers, []);

  return (
    <div
      ref={anchorRef}
      onPointerEnter={onPointerEnter}
      onPointerLeave={scheduleClose}
      onFocus={onFocus}
      onBlur={scheduleClose}
    >
      {children}
      {position &&
        createPortal(
          <PreviewCard
            preview={preview}
            details={details}
            position={position}
            onPointerEnter={() => window.clearTimeout(closeTimer.current)}
            onPointerLeave={scheduleClose}
            onClick={onPreviewClick}
            owner={() => anchorRef.current?.querySelector<HTMLElement>("a")}
          />,
          document.body,
        )}
    </div>
  );
}

const ORIGIN = {
  left: "origin-left",
  center: "origin-center",
  right: "origin-right",
} as const;

function PreviewCard({
  preview,
  details,
  position,
  onPointerEnter,
  onPointerLeave,
  onClick,
  owner,
}: {
  preview: PreviewData;
  /** undefined: loading, null: unavailable */
  details: Details | null | undefined;
  position: Position;
  onPointerEnter: () => void;
  onPointerLeave: () => void;
  onClick: () => void;
  owner: () => HTMLElement | null | undefined;
}) {
  const [bannerLoaded, setBannerLoaded] = useState(false);
  const poster = imageSrc(preview.image);
  const banner = imageSrc(details?.bannerImage);
  const detailsHref = infoHref(preview.id);
  const loading = details === undefined;

  const latest = details?.availableEpisodes?.[details.availableEpisodes.length - 1];
  const playHref = preview.playHref ?? (latest ? `/watch/${latest.ep_id}` : undefined);
  const playPending = !playHref && loading;

  const rating = ratingLabel(details?.averageScore, details?.score);
  const episodes = details?.episodes ?? (details?.totalEpisodes || undefined);
  const facts = [
    formatFormat(details?.format),
    details?.seasonYear ? String(details.seasonYear) : undefined,
    episodes ? (episodes === 1 ? "1 Episode" : `${episodes} Episodes`) : undefined,
  ].filter(Boolean) as string[];
  const genres = (details?.genres?.length ? details.genres : preview.genres)?.slice(0, 3);

  return (
    <div
      ref={(el) => {
        if (el) setPreviewOwner(el, owner());
      }}
      aria-hidden="true"
      data-morph-rect=""
      data-hover-preview=""
      data-details-id={preview.id}
      data-details-title={preview.title}
      data-details-image={banner && bannerLoaded ? banner : preview.image}
      className="absolute z-40 -translate-y-1/2 rounded-md"
      style={{ left: position.left, top: position.top, width: position.width }}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
      onClickCapture={onClick}
    >
      <div
        className={
          "overflow-hidden rounded-md bg-surface shadow-[0_3px_10px_rgb(0_0_0/0.75)] " +
          "scale-100 opacity-100 [transition:scale_250ms_var(--ease-pop),opacity_100ms_linear] " +
          "starting:scale-[0.667] starting:opacity-0 " +
          ORIGIN[position.origin]
        }
      >
        {/* Body click opens the details modal, like the card itself */}
        <Link href={detailsHref} scroll={false} tabIndex={-1} className="relative block aspect-video bg-surface-raised">
          {poster && (
            <Image src={poster} alt="" fill sizes={PREVIEW_SIZES} className="object-cover" />
          )}
          {banner && (
            <Image
              src={banner}
              alt=""
              fill
              sizes={PREVIEW_SIZES}
              onLoad={() => setBannerLoaded(true)}
              className={cn(
                "object-cover transition-opacity duration-300",
                bannerLoaded ? "opacity-100" : "opacity-0",
              )}
            />
          )}
          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-linear-to-t from-surface to-transparent" />
        </Link>
        {/* The whole info panel opens the details modal (DetailsHost); Play keeps its own link */}
        <div
          className="cursor-pointer space-y-2.5 p-4 pt-3"
        >
          <div className="flex items-center gap-2">
            {playHref ? (
              <Link
                href={playHref}
                tabIndex={-1}
                className="grid size-10 place-items-center rounded-full bg-white text-black transition-colors duration-150 hover:bg-white/80"
              >
                <PlayIcon className="size-5 translate-x-px" />
              </Link>
            ) : (
              <span
                className={cn(
                  "grid size-10 place-items-center rounded-full bg-white text-black",
                  playPending ? "animate-pulse opacity-60" : "opacity-40",
                )}
              >
                <PlayIcon className="size-5 translate-x-px" />
              </span>
            )}
            <Link
              href={detailsHref}
              scroll={false}
              tabIndex={-1}
              className="ml-auto grid size-10 place-items-center rounded-full text-white ring-2 ring-white/50 ring-inset transition-colors duration-150 hover:ring-white"
            >
              <ChevronDownIcon className="size-5" />
            </Link>
          </div>
          <p className="line-clamp-2 text-base leading-snug font-medium text-white">{preview.title}</p>
          <div className="flex h-5 items-center gap-2 text-sm whitespace-nowrap text-white/70">
            {rating ? <span className="font-medium text-positive">{rating}</span> : null}
            <span className="rounded-sm px-1.5 text-xs leading-5 font-medium text-white/90 uppercase ring-1 ring-white/40 ring-inset">
              {preview.isDub ? "Dub" : "Sub"}
            </span>
            {preview.meta && <span className="truncate">{preview.meta}</span>}
          </div>
          {/* Reserved lines: shimmer until details arrive, so nothing jumps */}
          <div className="h-5 text-sm text-white/70">
            {loading ? (
              <div className="skeleton mt-1 h-3 w-2/3 rounded-sm" />
            ) : (
              <p className="truncate">{facts.join(" • ")}</p>
            )}
          </div>
          <div className="h-5 text-sm text-white">
            {loading && !genres?.length ? (
              <div className="skeleton mt-1 h-3 w-1/2 rounded-sm" />
            ) : (
              <p className="truncate">{genres?.join(" • ")}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
