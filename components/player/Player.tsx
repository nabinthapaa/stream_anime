"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import { BackLink } from "../navigation/BackLink";
import { cn } from "../ui/cn";
import { imageSrc } from "../ui/format";
import {
  BackArrowGlyph,
  CheckGlyph,
  CloseGlyph,
  EpisodesGlyph,
  FullscreenGlyph,
  MoreGlyph,
  NextEpisodeGlyph,
  PauseGlyph,
  PlayGlyph,
  ServerGlyph,
  SpeedGlyph,
  Skip10Glyph,
  VolumeGlyph,
} from "./icons";
import { ProgressBar } from "./ProgressBar";
import { removeContinueWatching, saveContinueWatching } from "../storage/library";
import { progressFraction, readProgress, writeProgress } from "./progress";
import { formatTime } from "./time";

export interface PlayerEpisode {
  number: number;
  href: string;
  current?: boolean;
  /** localStorage key of this episode's resume position (for the progress bar) */
  progressKey?: string;
}

export interface PlayerProps {
  /** Playable URLs (already proxied), in order of preference; offered as "Server 1..n" */
  sources: string[];
  /** Series name (bold in the control bar) */
  title: string;
  /** e.g. "E3" */
  episodeLabel?: string;
  /**
   * Where ← goes when there's no in-app entry to return to (direct load, refresh, new tab).
   * With one, ← behaves like the browser Back button (e.g. home with the details modal open).
   */
  backHref: string;
  nextEpisode?: { href: string; label: string; image?: string };
  prevEpisode?: { href: string; label: string };
  episodes?: PlayerEpisode[];
  /** localStorage key for resume position */
  storageKey: string;
  poster?: string;
  /** Series synopsis: pause screen and the current row of the Episodes panel */
  synopsis?: string;
  /** Start advisory chip, e.g. "SUB · 2016 · 8.2/10" */
  advisory?: string;
  /** Wide series art for episode thumbnails (raw URL; goes through the image optimizer) */
  artwork?: string;
  /**
   * Series identity for the home page's "Continue Watching" row (localStorage).
   * Omit to leave no trace. The record is per series and advances when an episode ends.
   */
  continueWatching?: {
    /** Anime id */
    id: string;
    title: string;
    /** Wide art for the row card */
    image?: string;
    /** Episode id being watched, e.g. "k1r85-episode-3" */
    epId: string;
    epNumber?: number;
    /** Where the record moves when this episode finishes; omitted = last episode */
    nextEpId?: string;
    nextEpNumber?: number;
  };
}

const HIDE_AFTER_MS = 3000;
const SKIP_SECONDS = 10;
const SAVE_EVERY_MS = 5000;
const UP_NEXT_WINDOW = 20;
const UP_NEXT_COUNTDOWN = 10;
const DOUBLE_TAP_MS = 300;
const PAUSE_SCREEN_MS = 5000;
const ADVISORY_MS = 5000;
const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5];

type Panel = null | "episodes" | "speed" | "server" | "more";

/**
 * Geometry. Netflix sizes its controls with the viewport; measurements were taken at
 * 2342px wide. `--pu` is one of those px, scaled by the viewport width and clamped, so
 * every measured value is `calc(N * var(--pu))`. Hit areas never drop below 44px.
 * Button spacing (82u centre-to-centre, 112u between the right sub-groups) is set per
 * breakpoint in GAPS: phones get a compact row.
 */
const GEOMETRY = {
  "--pu": "clamp(0.8px, 0.0427vw, 1.2px)",
  "--btn": "max(44px, calc(44 * var(--pu)))", // 44x44 hit areas
  "--inset": "max(12px, calc(20 * var(--pu)))",
  "--icon": "max(26px, calc(34 * var(--pu)))",
} as CSSProperties;

const GAPS =
  "[--gap:6px] [--gap-wide:10px] " +
  "sm:[--gap:max(4px,calc(82*var(--pu)_-_var(--btn)))] sm:[--gap-wide:max(12px,calc(112*var(--pu)_-_var(--btn)))]";

/**
 * Netflix-style player around a native <video>: auto-hiding chrome, keyboard shortcuts,
 * resume, up-next, pause screen, start advisory, server switcher and touch gestures.
 * Progress is painted imperatively (see ProgressBar), so time updates never re-render this tree.
 */
export function Player({
  sources,
  title,
  episodeLabel,
  backHref,
  nextEpisode,
  prevEpisode,
  episodes,
  storageKey,
  poster,
  synopsis,
  advisory,
  artwork,
  continueWatching,
}: PlayerProps) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const [sourceIndex, setSourceIndex] = useState(0);
  const [reloadKey, setReloadKey] = useState(0);
  const [paused, setPaused] = useState(true);
  const [started, setStarted] = useState(false);
  const [waiting, setWaiting] = useState(false);
  const [failed, setFailed] = useState(false);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [rate, setRate] = useState(1);
  const [fullscreen, setFullscreen] = useState(false);
  const [chromeVisible, setChromeVisible] = useState(true);
  const [panel, setPanel] = useState<Panel>(null);
  const [flash, setFlash] = useState<{ kind: "play" | "pause"; key: number } | null>(null);
  const [ripple, setRipple] = useState<{ dir: -1 | 1; key: number } | null>(null);
  const [toast, setToast] = useState<{ text: string; key: number } | null>(null);
  const [upNext, setUpNext] = useState<{ remaining: number } | null>(null);
  const [pauseScreen, setPauseScreen] = useState(false);
  const [advisoryVisible, setAdvisoryVisible] = useState(false);

  const hideTimer = useRef<number | undefined>(undefined);
  const toastTimer = useRef<number | undefined>(undefined);
  const pauseTimer = useRef<number | undefined>(undefined);
  const advisoryTimer = useRef<number | undefined>(undefined);
  const overControls = useRef(false);
  const panelRef = useRef<Panel>(null);
  const resumeTime = useRef<number | null>(null); // time to restore after a source switch
  const resumeChecked = useRef(false);
  const wasPlaying = useRef(false);
  const lastSave = useRef(0);
  const upNextCancelled = useRef(false);
  const advisoryShown = useRef(false);
  const wasStarted = useRef(false);
  /** The episode list is centred on the current episode once per opening, not per render. */
  const centered = useRef(false);
  const cwRef = useRef(continueWatching);
  /** This episode reached the end: stop refreshing its Continue Watching record. */
  const finished = useRef(false);
  const tapState = useRef<{ time: number; zone: number; timer?: number }>({ time: 0, zone: -1 });

  const src = sources[sourceIndex];
  const visible = !pauseScreen && (chromeVisible || paused || panel !== null || failed || !started);

  const openPanel = (next: Panel) => {
    if (next !== "episodes") centered.current = false;
    panelRef.current = next;
    setPanel(next);
    if (next) {
      window.clearTimeout(pauseTimer.current);
      setPauseScreen(false);
    }
  };

  // ---------- helpers ----------
  const showToast = useCallback((text: string) => {
    window.clearTimeout(toastTimer.current);
    setToast({ text, key: Date.now() });
    toastTimer.current = window.setTimeout(() => setToast(null), text.startsWith("Resumed") ? 3000 : 1200);
  }, []);

  const scheduleHide = useCallback(() => {
    window.clearTimeout(hideTimer.current);
    hideTimer.current = window.setTimeout(() => {
      if (!overControls.current) setChromeVisible(false);
    }, HIDE_AFTER_MS);
  }, []);

  /** Pause screen after 5s paused with no activity (only once playback has started). */
  const schedulePauseScreen = useCallback(() => {
    window.clearTimeout(pauseTimer.current);
    pauseTimer.current = window.setTimeout(() => {
      const video = videoRef.current;
      if (video?.paused && !video.ended && panelRef.current === null) setPauseScreen(true);
    }, PAUSE_SCREEN_MS);
  }, []);

  const showChrome = useCallback(() => {
    setChromeVisible(true);
    scheduleHide();
    // Activity dismisses the pause screen and restarts its timer.
    setPauseScreen(false);
    const video = videoRef.current;
    if (video?.paused && wasStarted.current) schedulePauseScreen();
  }, [scheduleHide, schedulePauseScreen]);

  const save = useCallback(() => {
    const video = videoRef.current;
    if (!video || !Number.isFinite(video.duration) || video.currentTime < 1) return;
    // Near the end counts as watched (full progress bar, no resume prompt).
    const t = video.duration - video.currentTime < 30 ? video.duration : video.currentTime;
    writeProgress(storageKey, t, video.duration);
    const cw = cwRef.current;
    if (cw && !finished.current) {
      saveContinueWatching({ id: cw.id, title: cw.title, image: cw.image, epId: cw.epId, epNumber: cw.epNumber, t, d: video.duration });
    }
  }, [storageKey]);

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video || failed) return;
    if (video.paused || video.ended) {
      video.play().catch(() => undefined);
      setFlash({ kind: "play", key: Date.now() });
    } else {
      video.pause();
      setFlash({ kind: "pause", key: Date.now() });
    }
  }, [failed]);

  const skip = useCallback(
    (dir: -1 | 1) => {
      const video = videoRef.current;
      if (!video || !Number.isFinite(video.duration)) return;
      video.currentTime = Math.min(video.duration, Math.max(0, video.currentTime + dir * SKIP_SECONDS));
      setRipple({ dir, key: Date.now() });
      showChrome();
    },
    [showChrome],
  );

  const changeVolume = useCallback(
    (delta: number) => {
      const video = videoRef.current;
      if (!video) return;
      const next = Math.min(1, Math.max(0, Math.round((video.volume + delta) * 10) / 10));
      video.volume = next;
      video.muted = next === 0;
      showToast(`Volume ${Math.round(next * 100)}%`);
    },
    [showToast],
  );

  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    if (!video.muted && video.volume === 0) video.volume = 0.5;
    showToast(video.muted ? "Muted" : `Volume ${Math.round(video.volume * 100)}%`);
  }, [showToast]);

  const toggleFullscreen = useCallback(() => {
    const container = containerRef.current;
    const video = videoRef.current as (HTMLVideoElement & { webkitEnterFullscreen?: () => void }) | null;
    if (!container) return;
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => undefined);
      return;
    }
    if (container.requestFullscreen) {
      container
        .requestFullscreen()
        .then(() => {
          // Phones: prefer landscape while fullscreen (ignored where unsupported).
          const orientation = screen.orientation as ScreenOrientation & { lock?: (o: string) => Promise<void> };
          orientation?.lock?.("landscape").catch(() => undefined);
        })
        .catch(() => video?.webkitEnterFullscreen?.());
    } else {
      video?.webkitEnterFullscreen?.(); // iOS Safari
    }
  }, []);

  const navigating = useRef(false);
  const goNext = useCallback(() => {
    if (!nextEpisode || navigating.current) return;
    navigating.current = true;
    save();
    router.push(nextEpisode.href);
  }, [nextEpisode, router, save]);

  const cancelUpNext = () => {
    upNextCancelled.current = true;
    setUpNext(null);
  };

  /** Switch mirror, keeping the current time and play state. */
  const switchSource = (index: number) => {
    const video = videoRef.current;
    openPanel(null);
    if (index === sourceIndex && !failed) return;
    resumeTime.current = video && video.currentTime > 0 ? video.currentTime : resumeTime.current;
    wasPlaying.current = Boolean(video && !video.paused);
    setFailed(false);
    setWaiting(true);
    setSourceIndex(index);
    setReloadKey((k) => k + 1);
  };

  // ---------- video events ----------
  const onLoadedMetadata = () => {
    const video = videoRef.current;
    if (!video) return;
    if (resumeTime.current !== null) {
      // Source switch / fallback: continue where the previous source stopped.
      video.currentTime = resumeTime.current;
      resumeTime.current = null;
      if (wasPlaying.current) video.play().catch(() => undefined);
      return;
    }
    if (resumeChecked.current) return;
    resumeChecked.current = true;
    const saved = readProgress(storageKey)?.t ?? 0;
    if (saved > 10 && saved < video.duration - 30) {
      video.currentTime = saved;
      showToast(`Resumed from ${formatTime(saved)}`);
    }
  };

  const onTimeUpdate = () => {
    const video = videoRef.current;
    if (!video) return;
    const now = performance.now();
    if (now - lastSave.current > SAVE_EVERY_MS) {
      lastSave.current = now;
      save();
    }
    if (!nextEpisode || upNextCancelled.current || !Number.isFinite(video.duration)) return;
    const inWindow = video.duration - video.currentTime <= UP_NEXT_WINDOW;
    // Only state flips cause renders (not every tick).
    if (inWindow && !upNext) setUpNext({ remaining: UP_NEXT_COUNTDOWN });
    else if (!inWindow && upNext && !video.ended) setUpNext(null);
  };

  const onError = () => {
    const video = videoRef.current;
    if (sourceIndex < sources.length - 1) {
      resumeTime.current = video && video.currentTime > 0 ? video.currentTime : resumeTime.current;
      wasPlaying.current = wasPlaying.current || Boolean(video && !video.paused);
      setSourceIndex((i) => i + 1);
      return;
    }
    setFailed(true);
    setWaiting(false);
  };

  const retry = () => {
    const video = videoRef.current;
    resumeTime.current = video && video.currentTime > 0 ? video.currentTime : resumeTime.current;
    setFailed(false);
    setSourceIndex(0);
    setReloadKey((k) => k + 1);
  };

  // ---------- effects ----------
  const counting = upNext !== null;
  useEffect(() => {
    if (!counting) return;
    const id = window.setInterval(() => {
      setUpNext((u) => (u ? { remaining: u.remaining - 1 } : u));
    }, 1000);
    return () => window.clearInterval(id);
  }, [counting]);
  useEffect(() => {
    if (upNext && upNext.remaining <= 0) goNext();
  }, [upNext, goNext]);

  useEffect(() => {
    cwRef.current = continueWatching;
  }, [continueWatching]);

  useEffect(() => {
    const onChange = () => setFullscreen(document.fullscreenElement === containerRef.current);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  useEffect(() => {
    window.addEventListener("pagehide", save);
    window.addEventListener("beforeunload", save);
    return () => {
      save();
      window.removeEventListener("pagehide", save);
      window.removeEventListener("beforeunload", save);
    };
  }, [save]);

  useEffect(
    () => () => {
      window.clearTimeout(hideTimer.current);
      window.clearTimeout(toastTimer.current);
      window.clearTimeout(pauseTimer.current);
      window.clearTimeout(advisoryTimer.current);
      window.clearTimeout(tapState.current.timer);
    },
    [],
  );

  // Keyboard shortcuts.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey) return;
      const target = e.target as HTMLElement | null;
      if (target?.closest("input, textarea, select, [contenteditable='true']")) return;
      // Space/Enter on a focused button or link activates that control instead.
      if ((e.key === " " || e.key === "Enter") && target?.closest("button, a")) return;
      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      switch (key) {
        case " ":
        case "k":
          togglePlay();
          break;
        case "ArrowLeft":
        case "j":
          skip(-1);
          break;
        case "ArrowRight":
        case "l":
          skip(1);
          break;
        case "ArrowUp":
          changeVolume(0.1);
          break;
        case "ArrowDown":
          changeVolume(-0.1);
          break;
        case "m":
          toggleMute();
          break;
        case "f":
          toggleFullscreen();
          break;
        case "n":
          if (!nextEpisode) return;
          goNext();
          break;
        case "Escape":
          if (panelRef.current) openPanel(null);
          else if (document.fullscreenElement) document.exitFullscreen().catch(() => undefined);
          else return;
          break;
        default:
          showChrome(); // any other key still dismisses the pause screen
          return;
      }
      e.preventDefault();
      showChrome();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [togglePlay, skip, changeVolume, toggleMute, toggleFullscreen, goNext, nextEpisode, showChrome]);

  // ---------- gestures on the video surface ----------
  const onSurfacePointerUp = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "mouse") {
      if (panelRef.current) openPanel(null);
      else togglePlay();
      showChrome();
      return;
    }
    // Touch: double-tap left/right third skips; single tap toggles the chrome.
    const rect = e.currentTarget.getBoundingClientRect();
    const zone = Math.floor(((e.clientX - rect.left) / rect.width) * 3); // 0,1,2
    const now = performance.now();
    const t = tapState.current;
    if (now - t.time < DOUBLE_TAP_MS && zone === t.zone && zone !== 1) {
      window.clearTimeout(t.timer);
      t.time = 0;
      skip(zone === 0 ? -1 : 1);
      return;
    }
    t.time = now;
    t.zone = zone;
    window.clearTimeout(t.timer);
    t.timer = window.setTimeout(() => {
      if (panelRef.current) openPanel(null);
      else if (visible && !paused) {
        window.clearTimeout(hideTimer.current);
        setChromeVisible(false);
      } else showChrome();
    }, DOUBLE_TAP_MS);
  };

  const volumeLevel = muted || volume === 0 ? "muted" : volume < 0.5 ? "low" : "high";
  const iconButton =
    "grid size-[var(--btn)] shrink-0 place-items-center rounded-full text-white transition-transform duration-150 hover:scale-110 " +
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent [&>svg]:size-[var(--icon)]";
  const card = "rounded-md bg-surface/95 shadow-card ring-1 ring-white/10 backdrop-blur-md";
  const nextArt = imageSrc(nextEpisode?.image);
  const thumb = imageSrc(artwork);
  const hasEpisodes = Boolean(episodes && episodes.length > 1);

  return (
    <div
      ref={containerRef}
      style={GEOMETRY}
      className={cn(
        "group/player relative isolate w-full overflow-hidden bg-black text-white select-none",
        GAPS,
        // Theater: the player owns the viewport (dvh so mobile browser chrome is excluded).
        fullscreen ? "h-full" : "h-dvh",
        !visible && "cursor-none",
      )}
      onPointerMove={(e) => e.pointerType === "mouse" && showChrome()}
      onFocusCapture={() => showChrome()}
    >
      <video
        key={`${src}#${reloadKey}`}
        ref={videoRef}
        src={src}
        poster={poster}
        preload="metadata"
        playsInline
        className="absolute inset-0 h-full w-full bg-black object-contain"
        onPlay={() => {
          setPaused(false);
          setStarted(true);
          wasStarted.current = true;
          wasPlaying.current = true;
          window.clearTimeout(pauseTimer.current);
          setPauseScreen(false);
          scheduleHide();
          if (advisory && !advisoryShown.current) {
            advisoryShown.current = true;
            setAdvisoryVisible(true);
            advisoryTimer.current = window.setTimeout(() => setAdvisoryVisible(false), ADVISORY_MS);
          }
        }}
        onPause={() => {
          setPaused(true);
          wasPlaying.current = false;
          save();
          schedulePauseScreen();
        }}
        onWaiting={() => setWaiting(true)}
        onStalled={() => setWaiting(true)}
        onPlaying={() => setWaiting(false)}
        onCanPlay={() => setWaiting(false)}
        onSeeked={() => setWaiting(false)}
        onVolumeChange={(e) => {
          setVolume(e.currentTarget.volume);
          setMuted(e.currentTarget.muted);
        }}
        onRateChange={(e) => setRate(e.currentTarget.playbackRate)}
        onLoadedMetadata={onLoadedMetadata}
        onTimeUpdate={onTimeUpdate}
        onEnded={() => {
          const video = videoRef.current;
          if (video && Number.isFinite(video.duration)) writeProgress(storageKey, video.duration, video.duration);
          finished.current = true;
          const cw = cwRef.current;
          if (cw) {
            // Move the series on to the next episode, or drop it from the row entirely.
            if (cw.nextEpId) {
              saveContinueWatching({
                id: cw.id,
                title: cw.title,
                image: cw.image,
                epId: cw.nextEpId,
                epNumber: cw.nextEpNumber,
                t: 0,
                d: 0,
              });
            } else {
              removeContinueWatching(cw.id);
            }
          }
          if (nextEpisode && !upNextCancelled.current) setUpNext((u) => u ?? { remaining: UP_NEXT_COUNTDOWN });
        }}
        onError={onError}
      />

      {/* Gesture surface (under the controls) */}
      <div className="absolute inset-0" onPointerUp={onSurfacePointerUp} aria-hidden="true" />

      {/* Center feedback */}
      <div className="pointer-events-none absolute inset-0 grid place-items-center" aria-hidden="true">
        {flash && (
          <span key={flash.key} className="grid size-24 animate-player-flash place-items-center rounded-full bg-black/40">
            {flash.kind === "play" ? <PlayGlyph className="size-12 translate-x-0.5" /> : <PauseGlyph className="size-12" />}
          </span>
        )}
        {waiting && !failed && (
          <span className="absolute size-16 animate-spin rounded-full border-4 border-white/20 border-t-accent" />
        )}
      </div>
      {ripple && (
        <div
          key={ripple.key}
          aria-hidden="true"
          className={cn("pointer-events-none absolute inset-y-0 grid w-1/3 place-items-center", ripple.dir === -1 ? "left-0" : "right-0")}
        >
          <span className="grid size-24 animate-player-ripple place-items-center rounded-full bg-white/15 text-2xl font-bold backdrop-blur-sm">
            {ripple.dir === -1 ? "−10" : "+10"}
          </span>
        </div>
      )}

      {/* Big play button before the first play */}
      {!started && !failed && (
        <button
          type="button"
          onClick={togglePlay}
          aria-label="Play"
          className="absolute top-1/2 left-1/2 z-10 grid size-20 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-black shadow-[0_8px_30px_rgb(0_0_0/0.5)] transition-transform duration-150 hover:scale-110 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent sm:size-24"
        >
          <PlayGlyph className="size-10 translate-x-1 sm:size-12" />
        </button>
      )}

      {/* Toast (resume, volume) */}
      <div aria-live="polite" className="pointer-events-none absolute inset-x-0 top-16 z-20 flex justify-center sm:top-20">
        {toast && (
          <span key={toast.key} className="animate-fade-in rounded-full bg-black/75 px-4 py-2 text-sm font-medium ring-1 ring-white/15">
            {toast.text}
          </span>
        )}
      </div>

      {/* Start advisory: under the back button, fades out after ~5s */}
      {advisory && (
        <div
          aria-hidden={!advisoryVisible}
          className={cn(
            "pointer-events-none absolute top-[calc(30*var(--pu)_+_var(--btn)_+_16*var(--pu))] left-[calc(30*var(--pu))] z-10 flex items-stretch gap-[calc(10*var(--pu))] transition-opacity duration-700",
            advisoryVisible ? "opacity-100" : "opacity-0",
          )}
        >
          <span className="w-[max(3px,calc(4*var(--pu)))] rounded-full bg-accent" />
          <span className="py-1 text-[max(13px,calc(18*var(--pu)))] font-medium tracking-wide text-white uppercase drop-shadow">
            {advisory}
          </span>
        </div>
      )}

      {/* Pause screen */}
      <div
        aria-hidden={!pauseScreen}
        className={cn(
          "pointer-events-none absolute inset-0 z-[15] bg-linear-to-r from-black/85 via-black/55 to-black/10 transition-opacity duration-500",
          pauseScreen ? "opacity-100" : "opacity-0",
        )}
      >
        <div className="absolute top-[48%] left-[12%] max-w-[45vw] max-sm:top-auto max-sm:bottom-[18%] max-sm:max-w-[80vw]">
          <p className="text-[max(12px,calc(16*var(--pu)))] font-medium text-white/70">You&apos;re watching</p>
          <p className="mt-[calc(10*var(--pu))] text-[max(18px,calc(24*var(--pu)))] leading-tight font-medium text-white">{title}</p>
          {episodeLabel && (
            <p className="mt-[calc(18*var(--pu))] text-[max(18px,calc(24*var(--pu)))] leading-tight font-medium text-white">
              Episode {episodeLabel.replace(/^E/, "")}
            </p>
          )}
          {synopsis && (
            <p className="mt-[calc(16*var(--pu))] line-clamp-3 text-[max(14px,calc(18*var(--pu)))] leading-snug text-[#cccccc]">
              {synopsis}
            </p>
          )}
        </div>
      </div>

      {/* Chrome */}
      <div
        className={cn(
          "pointer-events-none absolute inset-0 z-10 transition-opacity duration-250",
          visible ? "opacity-100" : "opacity-0",
        )}
      >
        {/* Top: back (left), server (right) at a 30u inset */}
        <div className="absolute inset-x-0 top-0 flex items-start justify-between bg-linear-to-b from-black/60 to-transparent px-[calc(30*var(--pu))] pt-[calc(30*var(--pu))] pb-16">
          <BackLink
            href={backHref}
            replace
            aria-label="Back to Browse"
            className={cn(iconButton, visible ? "pointer-events-auto" : "pointer-events-none")}
            tabIndex={visible ? 0 : -1}
          >
            <BackArrowGlyph />
          </BackLink>
          {sources.length > 0 && (
            <div className={cn("relative", visible ? "pointer-events-auto" : "pointer-events-none")}>
              <button
                type="button"
                onClick={() => openPanel(panel === "server" ? null : "server")}
                aria-label={`Server ${sourceIndex + 1} of ${sources.length}`}
                aria-expanded={panel === "server"}
                tabIndex={visible ? 0 : -1}
                className={iconButton}
              >
                <ServerGlyph />
              </button>
              {panel === "server" && (
                <Popover onClose={() => openPanel(null)} className={cn(card, "top-full right-0 mt-2 w-52 py-2")}>
                  <p className="px-4 pt-1 pb-2 text-xs font-medium tracking-wide text-white/60 uppercase">Server</p>
                  <ul role="list">
                    {sources.map((_, i) => (
                      <li key={i}>
                        <button
                          type="button"
                          aria-pressed={i === sourceIndex}
                          onClick={() => switchSource(i)}
                          className="flex h-11 w-full items-center gap-3 px-4 text-left text-sm hover:bg-white/10 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent"
                        >
                          <span className="grid size-4 place-items-center text-accent">
                            {i === sourceIndex && <CheckGlyph className="size-4" />}
                          </span>
                          Server {i + 1}
                          {i === 0 && <span className="ml-auto text-xs text-white/50">Default</span>}
                        </button>
                      </li>
                    ))}
                  </ul>
                </Popover>
              )}
            </div>
          )}
        </div>

        {/* Bottom: timeline + button row */}
        <div
          className={cn(
            "absolute inset-x-0 bottom-0 bg-linear-to-t from-black/75 via-black/40 to-transparent px-[var(--inset)] pt-[calc(80*var(--pu))] pb-[max(8px,calc(38*var(--pu)))]",
            visible ? "pointer-events-auto" : "pointer-events-none",
          )}
          onPointerEnter={() => (overControls.current = true)}
          onPointerLeave={() => {
            overControls.current = false;
            scheduleHide();
          }}
        >
          <ProgressBar videoRef={videoRef} sourceKey={`${src}#${reloadKey}`} onScrub={(active) => active && showChrome()} />

          <div className="relative mt-[calc(8*var(--pu))] flex items-center">
            {/* Left group: play, -10, +10, volume (82u apart) */}
            <div className="flex items-center gap-[var(--gap)]">
              <button type="button" onClick={togglePlay} aria-label={paused ? "Play" : "Pause"} className={iconButton}>
                {paused ? <PlayGlyph /> : <PauseGlyph />}
              </button>
              <button type="button" onClick={() => skip(-1)} aria-label="Seek back 10 seconds" className={iconButton}>
                <Skip10Glyph dir={-1} />
              </button>
              <button type="button" onClick={() => skip(1)} aria-label="Seek forward 10 seconds" className={iconButton}>
                <Skip10Glyph dir={1} />
              </button>
              {/* Volume: vertical slider in a popover above the icon */}
              <div className="group/volume relative hidden sm:block">
                <button
                  type="button"
                  onClick={toggleMute}
                  aria-label={muted ? "Unmute" : "Mute"}
                  aria-pressed={muted}
                  className={iconButton}
                >
                  <VolumeGlyph level={volumeLevel} />
                </button>
                <div
                  className={cn(
                    card,
                    "invisible absolute bottom-full left-1/2 mb-1 flex h-36 w-12 -translate-x-1/2 items-center justify-center pt-3 pb-3 opacity-0 transition-opacity duration-150",
                    "group-focus-within/volume:visible group-focus-within/volume:opacity-100 group-hover/volume:visible group-hover/volume:opacity-100",
                    // Bridge the gap so the pointer can travel from the icon to the slider.
                    "after:absolute after:inset-x-0 after:top-full after:h-2",
                  )}
                >
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={muted ? 0 : volume}
                    onChange={(e) => {
                      const video = videoRef.current;
                      if (!video) return;
                      video.volume = Number(e.target.value);
                      video.muted = video.volume === 0;
                    }}
                    aria-label="Volume"
                    aria-orientation="vertical"
                    className="h-full w-4 cursor-pointer accent-accent [direction:rtl] [writing-mode:vertical-lr]"
                  />
                </div>
              </div>
            </div>

            {/* Centre: bold series name + regular episode */}
            <p className="mx-[calc(24*var(--pu))] min-w-0 flex-1 truncate text-center text-[max(15px,calc(20*var(--pu)))] font-normal max-sm:hidden">
              <span className="font-bold">{title}</span>
              {episodeLabel && <span className="ml-[0.5em]">{episodeLabel}</span>}
            </p>
            <span className="flex-1 sm:hidden" />

            {/* Right: [next, episodes]  wide gap  [speed, fullscreen] */}
            <div className="flex items-center gap-[var(--gap-wide)]">
              <div className="flex items-center gap-[var(--gap)]">
                {nextEpisode && (
                  <div className="group/next relative">
                    <button type="button" onClick={goNext} aria-label={`Next episode, ${nextEpisode.label}`} className={iconButton}>
                      <NextEpisodeGlyph />
                    </button>
                    <div
                      className={cn(
                        card,
                        "pointer-events-none absolute right-0 bottom-full mb-3 w-[max(260px,calc(420*var(--pu)))] overflow-hidden opacity-0 transition-opacity duration-150 group-focus-within/next:opacity-100 group-hover/next:opacity-100 max-sm:hidden",
                      )}
                    >
                      <p className="px-4 pt-3 pb-2 text-[max(14px,calc(18*var(--pu)))] font-medium">Next Episode</p>
                      <div className="flex gap-3 px-4 pb-4">
                        <div className="relative aspect-video w-[45%] shrink-0 overflow-hidden rounded-sm bg-surface-raised">
                          {nextArt && <Image src={nextArt} alt="" fill sizes="200px" className="object-cover" />}
                          <span className="absolute inset-0 grid place-items-center">
                            <span className="grid size-9 place-items-center rounded-full bg-black/50 ring-1 ring-white/60">
                              <PlayGlyph className="size-4 translate-x-px" />
                            </span>
                          </span>
                        </div>
                        <div className="min-w-0 text-sm">
                          <p className="font-semibold">
                            {nextEpisode.label} <span className="font-normal text-white/70">Episode {nextEpisode.label.replace(/^E/, "")}</span>
                          </p>
                          {synopsis && <p className="mt-1 line-clamp-3 text-xs leading-snug text-white/70">{synopsis}</p>}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                {hasEpisodes && (
                  <button
                    type="button"
                    onClick={() => openPanel(panel === "episodes" ? null : "episodes")}
                    aria-label="Episodes"
                    aria-expanded={panel === "episodes"}
                    className={cn(iconButton, "max-sm:hidden")}
                  >
                    <EpisodesGlyph />
                  </button>
                )}
              </div>
              <div className="flex items-center gap-[var(--gap)]">
                <button
                  type="button"
                  onClick={() => openPanel(panel === "speed" ? null : "speed")}
                  aria-label={`Playback speed, ${rate === 1 ? "1x (Normal)" : `${rate}x`}`}
                  aria-expanded={panel === "speed"}
                  className={cn(iconButton, "max-sm:hidden")}
                >
                  <SpeedGlyph />
                </button>
                {/* Phones: Speed and Episodes move behind "more" */}
                <button
                  type="button"
                  onClick={() => openPanel(panel === "more" ? null : "more")}
                  aria-label="More options"
                  aria-expanded={panel === "more"}
                  className={cn(iconButton, "sm:hidden")}
                >
                  <MoreGlyph />
                </button>
                <button
                  type="button"
                  onClick={toggleFullscreen}
                  aria-label={fullscreen ? "Exit full screen" : "Full screen"}
                  className={iconButton}
                >
                  <FullscreenGlyph exit={fullscreen} />
                </button>
              </div>
            </div>

            {/* Popovers anchored to the right of the row */}
            {panel === "more" && (
              <Popover onClose={() => openPanel(null)} className={cn(card, "right-0 bottom-full mb-3 w-56 py-2")}>
                <button
                  type="button"
                  onClick={() => openPanel("speed")}
                  className="flex h-11 w-full items-center gap-3 px-4 text-left text-sm hover:bg-white/10"
                >
                  <SpeedGlyph className="size-5" /> Playback speed
                  <span className="ml-auto text-white/60">{rate === 1 ? "Normal" : `${rate}x`}</span>
                </button>
                {hasEpisodes && (
                  <button
                    type="button"
                    onClick={() => openPanel("episodes")}
                    className="flex h-11 w-full items-center gap-3 px-4 text-left text-sm hover:bg-white/10"
                  >
                    <EpisodesGlyph className="size-5" /> Episodes
                  </button>
                )}
              </Popover>
            )}
            {panel === "speed" && (
              <Popover
                onClose={() => openPanel(null)}
                className={cn(card, "right-0 bottom-full mb-3 w-[min(92vw,max(340px,calc(560*var(--pu))))] px-6 pt-5 pb-6")}
              >
                <p className="text-[max(18px,calc(24*var(--pu)))] font-medium">Playback Speed</p>
                <div className="relative mt-6" role="radiogroup" aria-label="Playback speed">
                  {/* Track through the stop centres */}
                  <span aria-hidden="true" className="absolute inset-x-[10%] top-[11px] h-0.5 bg-white/30" />
                  <ul role="list" className="relative grid grid-cols-5">
                    {SPEEDS.map((s) => {
                      const selected = rate === s;
                      return (
                        <li key={s} className="flex justify-center">
                          <button
                            type="button"
                            role="radio"
                            aria-checked={selected}
                            onClick={() => {
                              if (videoRef.current) videoRef.current.playbackRate = s;
                              openPanel(null);
                            }}
                            className="group/stop flex min-h-11 flex-col items-center gap-2 rounded-md px-1 focus-visible:outline-2 focus-visible:outline-accent"
                          >
                            <span className="grid size-6 place-items-center">
                              <span
                                className={cn(
                                  "rounded-full transition-all duration-150",
                                  selected
                                    ? "size-6 bg-accent ring-4 ring-accent/30"
                                    : "size-3 bg-white/70 group-hover/stop:size-4 group-hover/stop:bg-white",
                                )}
                              />
                            </span>
                            <span className={cn("text-xs whitespace-nowrap sm:text-sm", selected ? "font-semibold text-white" : "text-white/70")}>
                              {s === 1 ? "1x (Normal)" : `${s}x`}
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </Popover>
            )}
          </div>
        </div>
      </div>

      {/* Episodes panel: large card above the controls, bottom-right */}
      {panel === "episodes" && episodes && (
        <>
          <div className="absolute inset-0 z-20" onPointerUp={() => openPanel(null)} aria-hidden="true" />
          <aside
            aria-label="Episodes"
            className={cn(
              card,
              "absolute right-[var(--inset)] bottom-[calc(var(--btn)_+_max(8px,calc(38*var(--pu)))_+_var(--btn)_+_16px)] z-30 flex max-h-[min(70%,calc(900*var(--pu)))] w-[min(calc(100%_-_2*var(--inset)),max(360px,calc(760*var(--pu))))] animate-fade-in flex-col",
              "max-sm:inset-x-0 max-sm:top-0 max-sm:bottom-0 max-sm:max-h-none max-sm:w-full max-sm:rounded-none",
            )}
          >
            <div className="flex items-center justify-between px-5 pt-4 pb-3">
              <h2 className="text-[max(18px,calc(24*var(--pu)))] font-medium">
                {title} <span className="font-normal text-white/60">Episodes</span>
              </h2>
              <button type="button" onClick={() => openPanel(null)} aria-label="Close episodes" className={cn(iconButton, "[&>svg]:size-6")}>
                <CloseGlyph />
              </button>
            </div>
            <ol role="list" className="flex-1 overflow-y-auto px-2 pb-3">
              {episodes.map((ep) => {
                const watched = progressFraction(ep.progressKey);
                return (
                  <li key={ep.href} className="border-t border-white/10 first:border-t-0">
                    <Link
                      href={ep.href}
                      aria-current={ep.current ? "page" : undefined}
                      ref={
                        ep.current
                          ? (el) => {
                              // Centre the current episode inside the list (once per opening,
                              // so re-renders never yank a long list back), not the page.
                              if (centered.current) return;
                              const list = el?.closest("ol");
                              if (!el || !list) return;
                              centered.current = true;
                              list.scrollTop = el.offsetTop - list.clientHeight / 2;
                            }
                          : undefined
                      }
                      className={cn(
                        "flex items-center gap-4 rounded-md px-3 py-3 transition-colors",
                        ep.current ? "bg-surface-hover" : "hover:bg-white/10",
                      )}
                    >
                      <span className="w-8 shrink-0 text-center text-xl text-white/60 tabular-nums">{ep.number}</span>
                      <span className="relative aspect-video w-28 shrink-0 overflow-hidden rounded-sm bg-surface-raised">
                        {thumb && <Image src={thumb} alt="" fill sizes="112px" className="object-cover" />}
                        {watched !== null && (
                          <span className="absolute inset-x-0 bottom-0 h-1 bg-white/25">
                            <span className="block h-full origin-left bg-accent" style={{ transform: `scaleX(${watched})` }} />
                          </span>
                        )}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-2">
                          <span className="truncate font-medium">Episode {ep.number}</span>
                          {ep.current && <span className="text-xs font-medium text-accent-text uppercase">Playing</span>}
                        </span>
                        {ep.current && synopsis && <span className="mt-1 line-clamp-2 block text-sm text-white/70">{synopsis}</span>}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ol>
          </aside>
        </>
      )}

      {/* Up next */}
      {upNext && nextEpisode && (
        <div role="status" className={cn(card, "absolute right-3 bottom-28 z-20 w-72 animate-fade-up p-4 sm:right-6 sm:bottom-32")}>
          <p className="text-xs font-medium tracking-wide text-white/60 uppercase">Up next</p>
          <p className="mt-1 text-base font-semibold">
            {nextEpisode.label} <span className="font-normal text-white/70">in {Math.max(0, upNext.remaining)}&hellip;</span>
          </p>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={goNext}
              className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-md bg-white text-sm font-medium text-black hover:bg-white/80"
            >
              <PlayGlyph className="size-4" /> Play Now
            </button>
            <button
              type="button"
              onClick={cancelUpNext}
              className="inline-flex h-10 flex-1 items-center justify-center rounded-md bg-white/15 text-sm font-medium hover:bg-white/25"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Error */}
      {failed && (
        <div role="alert" className="absolute inset-0 z-20 grid place-items-center bg-black/80 p-6 text-center">
          <div className="max-w-sm">
            <p className="text-lg font-semibold">This episode can&apos;t be played right now</p>
            <p className="mt-2 text-sm text-white/70">
              {sources.length > 1 ? `All ${sources.length} servers failed to load.` : "The video source failed to load."}
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-3">
              <button
                type="button"
                onClick={retry}
                className="inline-flex h-11 items-center rounded-md bg-white px-5 text-sm font-medium text-black hover:bg-white/80"
              >
                Retry
              </button>
              <BackLink
                href={backHref}
                replace
                className="inline-flex h-11 items-center rounded-md bg-white/15 px-5 text-sm font-medium hover:bg-white/25"
              >
                Series details
              </BackLink>
              {prevEpisode && (
                <Link href={prevEpisode.href} className="inline-flex h-11 items-center rounded-md px-3 text-sm text-white/70 hover:text-white">
                  {prevEpisode.label}
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/** Small popover that closes on Escape (handled globally) or an outside click. */
function Popover({ children, onClose, className }: { children: ReactNode; onClose: () => void; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const onDown = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node) && !(e.target as Element).closest("[aria-expanded]")) onClose();
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [onClose]);
  return (
    <div ref={ref} className={cn("absolute z-30 animate-fade-in", className)}>
      {children}
    </div>
  );
}
