"use client";

import { useEffect, useRef, type PointerEvent, type RefObject } from "react";
import { formatTime } from "./time";

/**
 * Netflix timeline: 22u hit area, 4px bar centred in it, buffered range (white/30),
 * played range (accent) and an always-visible 15u accent knob. The time remaining sits
 * in its own column to the right ("44:36"), aligned with the fullscreen button.
 * Painted imperatively from a rAF loop via CSS variables, so playback never re-renders React.
 * Click/drag seeks with mouse, pen or touch (preview follows the pointer; seek on release).
 */
export function ProgressBar({
  videoRef,
  sourceKey,
  onScrub,
}: {
  videoRef: RefObject<HTMLVideoElement | null>;
  /** Changes when the <video> element is replaced (source switch) */
  sourceKey: string;
  onScrub?: (active: boolean) => void;
}) {
  const barRef = useRef<HTMLDivElement>(null);
  const remainingRef = useRef<HTMLSpanElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ fraction: number } | null>(null);

  useEffect(() => {
    let frame = 0;
    let lastSecond = -1;
    let lastAria = 0;
    const paint = () => {
      frame = requestAnimationFrame(paint);
      const video = videoRef.current;
      const bar = barRef.current;
      if (!video || !bar) return;
      const duration = Number.isFinite(video.duration) ? video.duration : 0;
      const current = dragRef.current ? dragRef.current.fraction * duration : video.currentTime;
      let bufferedEnd = 0;
      for (let i = 0; i < video.buffered.length; i++) {
        if (video.buffered.start(i) <= video.currentTime + 0.5) bufferedEnd = Math.max(bufferedEnd, video.buffered.end(i));
      }
      bar.style.setProperty("--played", String(duration ? current / duration : 0));
      bar.style.setProperty("--buffered", String(duration ? Math.min(1, bufferedEnd / duration) : 0));
      const second = Math.floor(duration - current);
      if (second !== lastSecond && remainingRef.current) {
        lastSecond = second;
        remainingRef.current.textContent = duration ? formatTime(Math.max(0, duration - current)) : "--:--";
      }
      const now = performance.now();
      if (now - lastAria > 1000) {
        lastAria = now;
        bar.setAttribute("aria-valuemax", String(Math.round(duration)));
        bar.setAttribute("aria-valuenow", String(Math.round(current)));
        bar.setAttribute("aria-valuetext", `${formatTime(current)} of ${formatTime(duration)}`);
      }
    };
    frame = requestAnimationFrame(paint);
    return () => cancelAnimationFrame(frame);
  }, [videoRef, sourceKey]);

  const fractionAt = (clientX: number) => {
    const rect = barRef.current!.getBoundingClientRect();
    return Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
  };

  const showTooltip = (clientX: number) => {
    const video = videoRef.current;
    const tip = tooltipRef.current;
    const bar = barRef.current;
    if (!video || !tip || !bar || !Number.isFinite(video.duration)) return;
    const f = fractionAt(clientX);
    tip.textContent = formatTime(f * video.duration);
    bar.style.setProperty("--hover", String(f));
    tip.style.opacity = "1";
  };

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = { fraction: fractionAt(e.clientX) };
    showTooltip(e.clientX);
    onScrub?.(true);
  };
  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (dragRef.current) dragRef.current.fraction = fractionAt(e.clientX);
    if (e.pointerType === "mouse" || dragRef.current) showTooltip(e.clientX);
  };
  const endDrag = (e: PointerEvent<HTMLDivElement>, commit: boolean) => {
    const drag = dragRef.current;
    if (!drag) return;
    dragRef.current = null;
    const video = videoRef.current;
    if (commit && video && Number.isFinite(video.duration)) video.currentTime = drag.fraction * video.duration;
    if (e.pointerType !== "mouse" && tooltipRef.current) tooltipRef.current.style.opacity = "0";
    onScrub?.(false);
  };

  return (
    <div className="flex items-center gap-[calc(18*var(--pu))]">
      <div
        ref={barRef}
        role="slider"
        tabIndex={0}
        aria-label="Seek"
        aria-valuemin={0}
        aria-valuenow={0}
        className="group/progress relative flex h-[max(20px,calc(22*var(--pu)))] flex-1 cursor-pointer touch-none items-center"
        style={{ ["--played" as string]: 0, ["--buffered" as string]: 0, ["--hover" as string]: 0 }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={(e) => endDrag(e, true)}
        onPointerCancel={(e) => endDrag(e, false)}
        onPointerLeave={() => {
          if (!dragRef.current && tooltipRef.current) tooltipRef.current.style.opacity = "0";
        }}
      >
        {/* 4px bar */}
        <div className="relative h-1 w-full overflow-hidden bg-white/25">
          <div className="absolute inset-0 origin-left scale-x-[var(--buffered)] bg-white/35" />
          <div className="absolute inset-0 origin-left scale-x-[var(--played)] bg-accent" />
        </div>
        {/* Knob: always visible while the controls show; grows on hover/drag */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-[calc(var(--played)*100%)] size-[max(12px,calc(15*var(--pu)))] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent transition-transform duration-150 group-hover/progress:scale-125 group-focus-visible/progress:scale-125 group-active/progress:scale-125"
        />
        <div
          ref={tooltipRef}
          aria-hidden="true"
          className="pointer-events-none absolute bottom-full left-[clamp(1.75rem,calc(var(--hover)*100%),calc(100%_-_1.75rem))] mb-2 -translate-x-1/2 rounded-sm bg-black/85 px-2 py-1 text-xs font-medium text-white tabular-nums opacity-0 ring-1 ring-white/15 transition-opacity duration-100"
        />
      </div>
      {/* Same column as the fullscreen button */}
      <span
        ref={remainingRef}
        aria-hidden="true"
        className="w-[var(--btn)] shrink-0 text-[max(13px,calc(16*var(--pu)))] font-normal text-white tabular-nums"
      >
        --:--
      </span>
    </div>
  );
}
