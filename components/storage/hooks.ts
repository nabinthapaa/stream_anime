"use client";

import { useSyncExternalStore } from "react";
import { EMPTY, getContinueWatching, getMyList, isInMyList, subscribe, type ContinueEntry, type ListEntry } from "./library";

/**
 * True once the component has mounted. The library only exists in the browser, so anything
 * that depends on it must render nothing on the server and on the hydration pass.
 */
const noopSubscribe = () => () => {};
export function useMounted() {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
}

export function useContinueWatching(): ContinueEntry[] {
  return useSyncExternalStore(subscribe, getContinueWatching, () => EMPTY);
}

export function useMyList(): ListEntry[] {
  return useSyncExternalStore(subscribe, getMyList, () => EMPTY);
}

/** Whether `id` is in My List. Always false during server render / hydration. */
export function useInMyList(id: string) {
  return useSyncExternalStore(
    subscribe,
    () => isInMyList(id),
    () => false,
  );
}
