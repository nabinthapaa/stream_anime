"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { recordRoute } from "./history";

/** Feeds route changes into the in-app history bookkeeping (see history.ts). */
export function NavigationTracker() {
  const pathname = usePathname();
  useEffect(() => {
    recordRoute(pathname);
  }, [pathname]);
  return null;
}
