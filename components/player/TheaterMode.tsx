"use client";

import { useEffect } from "react";

/**
 * Marks the document while a theater route (/watch) is mounted: the player owns the
 * viewport, so the page itself doesn't scroll and the site nav, mobile tab bar and footer
 * are hidden (see `html[data-theater]` in global.css).
 */
export function TheaterMode() {
  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theater = "";
    return () => {
      delete root.dataset.theater;
    };
  }, []);
  return null;
}
