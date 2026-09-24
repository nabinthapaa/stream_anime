"use client";

import { usePathname } from "next/navigation";
import { useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent, type MouseEvent } from "react";
import { DOC_ID, recordDetailsPath, type DetailsEntryState } from "../navigation/history";
import { ButtonLink } from "../ui/Button";
import { EmptyState } from "../ui/EmptyState";
import { infoHref } from "../ui/format";
import { CloseIcon } from "../ui/icons";
import { DETAILS_HEADING_ID, DETAILS_PANEL } from "../ui/layout";
import type { TitleInfo } from "./data";
import { loadTitleDetails, peekTitleDetails } from "./detailsCache";
import { findMorphTarget, getPreviewOwner, morphRectOf, normalizeId } from "./morph";
import { TitleDetails } from "./TitleDetails";
import { TitleDetailsSkeleton } from "./TitleDetailsSkeleton";

// Motion
const OPEN_MS = 360;
const CLOSE_MS = 260;
const SHEET_OPEN_MS = 320;
const SHEET_CLOSE_MS = 250;
const REDUCED_MS = 150;
const EASE_OPEN = "cubic-bezier(0.32, 0.94, 0.6, 1)";
const EASE_CLOSE = "cubic-bezier(0.4, 0, 1, 1)";
const PANEL_RADIUS = 8;
/** Finish a close even if the animation never runs (hidden/throttled tab). */
const CLOSE_FALLBACK_SLACK = 150;

const FOCUSABLE =
  'a[href], button:not([disabled]), select:not([disabled]), input:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

type Rect = { left: number; top: number; width: number; height: number };

interface Session {
  key: number;
  id: string;
  title?: string;
  image?: string;
  /** Gets focus back after close */
  trigger: HTMLElement | null;
  /** Element the panel grew out of (preview popup, poster, billboard) */
  source: HTMLElement | null;
  sourceRect: Rect | null;
  sourceRadius: number;
  /** Page scroll position to hold while open and restore on close */
  scrollY: number;
  /** Exact `/_next/image` URL the source card already decoded (instant first frame) */
  firstFrame?: string;
  /**
   * How the modal was opened, which decides how it closes:
   * `push` (card click, pushState) and `restore` (history traversal onto a details entry)
   * close with history.back(); `param` (/?details=<id>) closes by stripping the param.
   */
  mode: "push" | "restore" | "param";
  /** Path + search of the page underneath (closing returns here) */
  basePath?: string;
  /** Details were not cached at open: fade them in when they arrive */
  loadedLate: boolean;
}

/** Transform + clip that make the panel (laid out at `panel`) cover exactly `source`. */
function flipFrame(panel: Rect, source: Rect, sourceRadius: number): Keyframe {
  const scale = source.width / panel.width;
  const visible = source.height / scale; // panel-space height that maps onto the source
  return {
    transform: `translate(${source.left - panel.left}px, ${source.top - panel.top}px) scale(${scale})`,
    clipPath: `inset(0px 0px calc(100% - ${visible}px) 0px round ${sourceRadius / scale}px)`,
  };
}
const IDENTITY: Keyframe = {
  transform: "translate(0px, 0px) scale(1)",
  clipPath: `inset(0px 0px 0px 0px round ${PANEL_RADIUS}px)`,
};

/** Freeze in-flight animations at their current value so a reverse starts from there. */
function freeze(elements: Element[]) {
  for (const el of elements) {
    for (const anim of el.getAnimations()) {
      try {
        anim.commitStyles();
      } catch {
        /* not rendered */
      }
      anim.cancel();
    }
  }
}

function untransformedRect(el: HTMLElement): Rect {
  const previous = el.style.transform;
  el.style.transform = "none";
  const r = el.getBoundingClientRect();
  el.style.transform = previous;
  return { left: r.left, top: r.top, width: r.width, height: r.height };
}

function scrollPageTo(y: number) {
  if (Math.abs(window.scrollY - y) > 1) window.scrollTo({ top: y, left: window.scrollX, behavior: "instant" });
}

/**
 * The URL the source card is currently showing, already decoded and in the memory cache.
 * Prefers the top-most visible loaded image (e.g. the hover preview's banner over its base art).
 * Only same-origin (`/_next/image`) URLs qualify: the raw artwork host refuses cross-site loads.
 */
function decodedImageUrl(root: HTMLElement) {
  const images = Array.from(root.querySelectorAll("img")).reverse();
  for (const img of images) {
    if (!img.complete || !img.naturalWidth || !img.currentSrc) continue;
    if (parseFloat(getComputedStyle(img).opacity) < 0.5) continue;
    try {
      const url = new URL(img.currentSrc);
      if (url.origin === window.location.origin && url.pathname.startsWith("/_next/image")) return url.href;
    } catch {
      /* ignore */
    }
  }
  return undefined;
}

const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const isSheet = () => window.innerWidth < 640;

/**
 * Owns the title-details modal (Netflix "More Info"). Mounted once in the root layout.
 *
 * Clicks on anything marked `data-details-id` (cards, the hover preview, the billboard's
 * More Info) are handled here: the panel mounts in the same frame, morphs out of the
 * source rect, loads details through the shared client cache, and the URL becomes
 * /info/<id> via history.pushState (no RSC request; the page underneath is untouched).
 * A refresh or direct load of that URL renders the full server page instead.
 */
export function DetailsHost() {
  const [session, setSession] = useState<Session | null>(null);
  const [data, setData] = useState<TitleInfo | null | undefined>(undefined);
  const sessionRef = useRef<Session | null>(null);
  const phaseRef = useRef<"idle" | "open" | "closing">("idle");
  /** A popstate we caused ourselves (history.back() after an animated close) */
  const expectPopRef = useRef(false);
  const overlayRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const fadeTargets = () => Array.from(panelRef.current?.querySelectorAll<HTMLElement>("[data-morph-fade]") ?? []);

  function open(next: Omit<Session, "key" | "loadedLate">) {
    const cached = peekTitleDetails(next.id);
    const s: Session = { ...next, key: Date.now(), loadedLate: cached === undefined };
    sessionRef.current = s;
    phaseRef.current = "open";
    setSession(s);
    setData(cached);
    if (cached === undefined) {
      loadTitleDetails(next.id).then((d) => {
        if (sessionRef.current?.key === s.key) setData(d);
      });
    }
    if (next.mode === "push") {
      s.basePath = window.location.pathname + window.location.search;
      const entry: DetailsEntryState = {
        __detailsBase: s.basePath,
        __details: next.id,
        __detailsScroll: next.scrollY,
        __detailsTitle: next.title,
        __detailsImage: next.image,
        __docId: DOC_ID,
      };
      window.history.pushState(entry, "", infoHref(next.id));
      recordDetailsPath(infoHref(next.id));
    }
    // Dismiss any hover preview.
    window.dispatchEvent(new Event("details:open"));
  }

  /** Remove the modal and put page scroll + focus back exactly where they were. */
  function unmount(s: Session, restore: boolean) {
    sessionRef.current = null;
    phaseRef.current = "idle";
    setSession(null);
    setData(undefined);
    if (!restore) return;
    const settle = () => {
      scrollPageTo(s.scrollY);
      const t = s.trigger;
      if (t?.isConnected && document.activeElement !== t) t.focus({ preventScroll: true });
    };
    requestAnimationFrame(settle);
    window.setTimeout(settle, 60);
    window.setTimeout(settle, 180);
  }

  /** Animated close. `viaHistory`: the URL already went back (browser Back). */
  function close(viaHistory: boolean) {
    const s = sessionRef.current;
    if (!s || phaseRef.current !== "open") return;
    phaseRef.current = "closing";
    const panel = panelRef.current;
    const overlay = overlayRef.current;

    let done = false;
    let fallback = 0;
    const finish = () => {
      if (done) return;
      done = true;
      window.clearTimeout(fallback);
      if (!viaHistory) {
        if (s.mode === "param") {
          // Opened from /?details=<id>: drop the param in place so Back doesn't reopen it.
          const url = new URL(window.location.href);
          url.searchParams.delete("details");
          window.history.replaceState(window.history.state, "", url.pathname + url.search + url.hash);
        } else {
          expectPopRef.current = true;
          window.history.back();
        }
      }
      unmount(s, true);
    };
    if (!panel || !overlay) return finish();

    freeze([overlay, panel, ...fadeTargets()]);
    overlay.style.pointerEvents = "none";
    scrollPageTo(s.scrollY);

    let animation: Animation;
    let duration: number;
    if (reducedMotion()) {
      duration = REDUCED_MS;
      animation = overlay.animate({ opacity: 0 }, { duration, fill: "forwards" });
    } else if (isSheet()) {
      duration = SHEET_CLOSE_MS;
      overlay.animate({ backgroundColor: "rgb(0 0 0 / 0)" }, { duration, fill: "forwards" });
      animation = panel.animate({ transform: "translateY(100%)" }, { duration, easing: EASE_CLOSE, fill: "forwards" });
    } else {
      duration = CLOSE_MS;
      const options = { duration, easing: EASE_CLOSE, fill: "forwards" as const };
      overlay.animate({ backgroundColor: "rgb(0 0 0 / 0)" }, { duration, fill: "forwards" });
      for (const el of fadeTargets()) el.animate([{ opacity: 0, offset: 0.4 }, { opacity: 0 }], options);
      const target = findMorphTarget(s.id, [s.source, s.trigger ? morphRectOf(s.trigger) : null]);
      if (target) {
        // Shrink into the card's CURRENT rect.
        const r = target.getBoundingClientRect();
        const radius = parseFloat(getComputedStyle(target).borderTopLeftRadius) || 0;
        panel.style.transformOrigin = "0 0";
        animation = panel.animate([flipFrame(untransformedRect(panel), r, radius)], options);
      } else {
        panel.style.transformOrigin = "50% 12.5%";
        animation = panel.animate({ transform: "scale(0.94)", opacity: 0 }, options);
      }
    }
    animation.finished.then(finish, finish);
    fallback = window.setTimeout(finish, duration + CLOSE_FALLBACK_SLACK);
  }

  // Latest handlers for the global listeners below.
  /** Leave without animation or scroll/focus restore (navigating elsewhere). */
  function leave() {
    const s = sessionRef.current;
    if (s && phaseRef.current !== "idle") unmount(s, false);
  }

  const handlers = useRef({ open, close, leave });
  useEffect(() => {
    handlers.current = { open, close, leave };
  });

  // Global listeners: card clicks (delegated, capture phase) and browser Back/Forward.
  useEffect(() => {
    const onClick = (e: globalThis.MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const target = e.target;
      if (!(target instanceof Element) || overlayRef.current?.contains(target)) return;
      // Links elsewhere (e.g. the preview's Play button) keep their own behaviour.
      const anchor = target.closest<HTMLElement>("a[href]");
      if (anchor && !(anchor.getAttribute("href") ?? "").startsWith("/info/")) return;
      // Controls inside a trigger (e.g. the My List toggle) keep their own behaviour.
      if (target.closest("[data-details-ignore]")) return;
      const source = target.closest<HTMLElement>("[data-details-id]");
      if (!source?.dataset.detailsId) return;

      // Ours: stop the <Link> navigation and React handlers.
      e.preventDefault();
      e.stopPropagation();
      if (phaseRef.current !== "idle") return;

      const rectEl = morphRectOf(source);
      const owner = getPreviewOwner(rectEl) ?? getPreviewOwner(source);
      const r = rectEl.getBoundingClientRect();
      handlers.current.open(
        {
          id: normalizeId(source.dataset.detailsId),
          title: source.dataset.detailsTitle,
          image: source.dataset.detailsImage,
          firstFrame: decodedImageUrl(rectEl),
          trigger: owner ?? anchor ?? source,
          source: rectEl,
          sourceRect: { left: r.left, top: r.top, width: r.width, height: r.height },
          sourceRadius: parseFloat(getComputedStyle(rectEl).borderTopLeftRadius) || 0,
          scrollY: window.scrollY,
          mode: "push",
        },
      );
    };

    const onPopState = (e: PopStateEvent) => {
      if (expectPopRef.current) {
        expectPopRef.current = false;
        return;
      }
      const current = sessionRef.current;
      if (current) {
        if (window.location.pathname.startsWith("/info/")) return;
        const destination = window.location.pathname + window.location.search;
        // Back to the page the modal was opened over: animated exit + scroll restore.
        // Anywhere else (e.g. Forward to the player): leave instantly and don't touch scroll.
        if (!current.basePath || destination === current.basePath) handlers.current.close(true);
        else handlers.current.leave();
        return;
      }
      const entry = (e.state ?? {}) as DetailsEntryState;
      // Back/Forward onto a details entry of this document (e.g. from the player): Next
      // restores the page underneath from its back/forward cache; reopen the modal over it
      // and hold the scroll position it had.
      if (entry.__details && entry.__docId === DOC_ID) {
        handlers.current.open({
          id: entry.__details,
          title: entry.__detailsTitle,
          image: entry.__detailsImage,
          trigger: null,
          source: null,
          sourceRect: null,
          sourceRadius: 0,
          scrollY: entry.__detailsScroll ?? window.scrollY,
          mode: "restore",
          basePath: entry.__detailsBase,
        });
      }
    };

    window.addEventListener("click", onClick, { capture: true });
    window.addEventListener("popstate", onPopState);
    return () => {
      window.removeEventListener("click", onClick, { capture: true });
      window.removeEventListener("popstate", onPopState);
    };
  }, []);

  // `/?details=<id>` (Netflix `jbv`): home with the modal open, e.g. the player's back
  // fallback or a shared link. Closing strips the param with replaceState.
  const pathname = usePathname();
  useEffect(() => {
    // Defensive: any route other than this modal's own URL (or home, for ?details) closes it
    // instantly. Back/Forward onto a details entry lands on /info/<id>, so restores survive.
    const open = sessionRef.current;
    if (open && phaseRef.current === "open") {
      const own = pathname.startsWith("/info/") && normalizeId(pathname.slice("/info/".length)) === open.id;
      const home = open.mode === "param" && pathname === "/";
      if (!own && !home) {
        const frame = requestAnimationFrame(() => {
          if (sessionRef.current === open && phaseRef.current === "open") unmount(open, false);
        });
        return () => cancelAnimationFrame(frame);
      }
      return;
    }
    if (pathname !== "/") return;
    const id = new URLSearchParams(window.location.search).get("details");
    if (!id || sessionRef.current) return;
    const frame = requestAnimationFrame(() =>
      handlers.current.open({
        id,
        trigger: null,
        source: null,
        sourceRect: null,
        sourceRadius: 0,
        scrollY: window.scrollY,
        mode: "param",
        basePath: "/",
      }),
    );
    return () => cancelAnimationFrame(frame);
  }, [pathname]);

  // Open animation, before first paint.
  useLayoutEffect(() => {
    const panel = panelRef.current;
    const overlay = overlayRef.current;
    if (!session || !panel || !overlay) return;

    if (reducedMotion()) {
      overlay.animate([{ opacity: 0 }, { opacity: 1 }], { duration: REDUCED_MS, easing: "linear" });
      return;
    }
    const sheet = isSheet();
    overlay.animate([{ backgroundColor: "rgb(0 0 0 / 0)" }, { backgroundColor: "rgb(0 0 0 / 0.7)" }], {
      duration: sheet ? SHEET_OPEN_MS : OPEN_MS,
      easing: "linear",
    });
    if (sheet) {
      panel.animate([{ transform: "translateY(100%)" }, { transform: "translateY(0)" }], {
        duration: SHEET_OPEN_MS,
        easing: EASE_OPEN,
      });
      return;
    }
    if (session.sourceRect) {
      const final = panel.getBoundingClientRect();
      panel.style.transformOrigin = "0 0";
      panel.animate([flipFrame(final, session.sourceRect, session.sourceRadius), IDENTITY], {
        duration: OPEN_MS,
        easing: EASE_OPEN,
      });
      // The artwork scales with the box; text and episodes fade in once it has mostly grown.
      for (const el of Array.from(panel.querySelectorAll<HTMLElement>("[data-morph-fade]"))) {
        el.animate([{ opacity: 0 }, { opacity: 0, offset: 0.55 }, { opacity: 1 }], { duration: OPEN_MS, easing: "linear" });
      }
      return;
    }
    panel.style.transformOrigin = "50% 12.5%";
    panel.animate(
      [
        { transform: "scale(0.95)", opacity: 0 },
        { transform: "scale(1)", opacity: 1 },
      ],
      { duration: 250, easing: EASE_OPEN },
    );
  }, [session]);

  // While open: lock + pin page scroll, move focus into the dialog.
  useEffect(() => {
    if (!session) return;
    const root = document.documentElement;
    const previousOverflow = root.style.overflow;
    root.style.overflow = "hidden";
    const pin = () => scrollPageTo(session.scrollY);
    window.addEventListener("scroll", pin);
    panelRef.current?.focus({ preventScroll: true });
    // A restored page renders a moment after popstate: keep re-applying the saved scroll
    // for a short while so it lands once the content is tall enough.
    let frame = 0;
    const until = performance.now() + 2500;
    const hold = () => {
      pin();
      if (performance.now() < until) frame = requestAnimationFrame(hold);
    };
    frame = requestAnimationFrame(hold);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", pin);
      root.style.overflow = previousOverflow;
    };
  }, [session]);

  if (!session) return null;

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Escape") {
      e.stopPropagation();
      close(false);
      return;
    }
    if (e.key !== "Tab" || !panelRef.current) return;
    const items = Array.from(panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
      (el) => el.offsetParent !== null || el === document.activeElement,
    );
    if (!items.length) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (e.shiftKey && (document.activeElement === first || document.activeElement === panelRef.current)) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  const onOverlayClick = (e: MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      close(false);
      return;
    }
    // Following a link out of the dialog (Play, Latest, an episode): <Link> has already
    // started the client navigation (and called preventDefault, so don't test for it).
    // Leave at once: no exit animation, no history.back(), and release the scroll lock/pin
    // before the router scrolls the new page to the top. The /info/<id> entry keeps its
    // state, so Back from the new page still restores the modal.
    const link = (e.target as Element).closest<HTMLAnchorElement>("a[href]");
    const plainClick = e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey;
    const leaves = link && plainClick && link.target !== "_blank" && !link.getAttribute("href")?.startsWith("#");
    if (leaves && phaseRef.current === "open" && sessionRef.current) {
      unmount(sessionRef.current, false);
    }
  };

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[60] overflow-y-auto overscroll-contain bg-black/70 sm:px-4 sm:py-8"
      onClick={onOverlayClick}
      onKeyDown={onKeyDown}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={DETAILS_HEADING_ID}
        tabIndex={-1}
        className={DETAILS_PANEL + " min-h-full shadow-[0_3px_10px_rgb(0_0_0/0.75)] outline-hidden sm:min-h-0"}
      >
        <div className="sticky top-0 z-10 flex h-0 justify-end" data-morph-fade="">
          <button
            type="button"
            onClick={() => close(false)}
            aria-label="Close"
            className="mt-3 mr-3 grid size-11 place-items-center rounded-full bg-surface/90 text-white ring-1 ring-white/10 transition-colors hover:bg-surface-hover sm:mt-4 sm:mr-4 sm:size-10"
          >
            <CloseIcon className="size-5" />
          </button>
        </div>
        {data ? (
          <div className={session.loadedLate ? "animate-fade-in" : undefined}>
            <TitleDetails id={session.id} data={data} headingLevel={2} wideImage={session.image} placeholderSrc={session.firstFrame} />
          </div>
        ) : data === null ? (
          <div className="px-5 pt-14 pb-6">
            <EmptyState
              tone="error"
              title={session.title ? `We couldn’t load ${session.title}` : "We couldn’t load this title"}
              message="The source may be slow or unavailable right now."
            >
              <ButtonLink href={infoHref(session.id)} prefetch={false}>
                Open full page
              </ButtonLink>
            </EmptyState>
            <span id={DETAILS_HEADING_ID} className="sr-only">
              {session.title ?? "Title unavailable"}
            </span>
          </div>
        ) : (
          <TitleDetailsSkeleton
            title={session.title}
            image={session.image}
            headingId={DETAILS_HEADING_ID}
            placeholderSrc={session.firstFrame}
          />
        )}
      </div>
    </div>
  );
}
