/**
 * Local library: "Continue Watching" and "My List".
 *
 * localStorage (not sessionStorage): Continue Watching is only useful if it survives
 * closing the tab. There is no backend, so the title and artwork are stored alongside the
 * ids and the home rows render with no network call.
 *
 * Keys
 *   cw:<animeId>  ContinueEntry  one record per SERIES (advances as episodes finish)
 *   wl:<animeId>  ListEntry      My List
 * The per-episode `resume:<ep_id>` keys (see player/progress.ts) are unrelated and stay.
 *
 * Every access is guarded: localStorage throws in private modes and when the quota is full.
 */

export interface ContinueEntry {
  /** Anime id, e.g. "k1r85" */
  id: string;
  title: string;
  /** Wide art for the row card */
  image?: string;
  /** Episode id to resume, e.g. "k1r85-episode-3" */
  epId: string;
  epNumber?: number;
  /** Seconds watched */
  t: number;
  /** Episode duration in seconds (0 when not known yet) */
  d: number;
  /** Last updated (ms) — rows are newest first */
  at: number;
}

export interface ListEntry {
  id: string;
  title: string;
  image?: string;
  at: number;
}

const CW = "cw:";
const WL = "wl:";

const listeners = new Set<() => void>();
let continueCache: ContinueEntry[] | null = null;
let listCache: ListEntry[] | null = null;

function storage() {
  try {
    return typeof window === "undefined" ? null : window.localStorage;
  } catch {
    return null;
  }
}

/** Invalidate the cached snapshots and wake up subscribed components. */
function changed() {
  continueCache = null;
  listCache = null;
  for (const fn of listeners) fn();
}

function readAll<T>(prefix: string, valid: (value: unknown) => boolean): T[] {
  const store = storage();
  if (!store) return [];
  const out: T[] = [];
  try {
    for (let i = 0; i < store.length; i++) {
      const key = store.key(i);
      if (!key?.startsWith(prefix)) continue;
      try {
        const parsed = JSON.parse(store.getItem(key) ?? "null");
        if (valid(parsed)) out.push(parsed as T);
      } catch {
        /* skip malformed entries */
      }
    }
  } catch {
    return [];
  }
  return out;
}

function write(key: string, value: unknown) {
  const store = storage();
  if (!store) return;
  try {
    store.setItem(key, JSON.stringify(value));
  } catch {
    /* quota or private mode */
  }
  changed();
}

function drop(key: string) {
  const store = storage();
  if (!store) return;
  try {
    store.removeItem(key);
  } catch {
    /* ignore */
  }
  changed();
}

const isContinue = (v: unknown): v is ContinueEntry =>
  typeof v === "object" && v !== null && typeof (v as ContinueEntry).id === "string" && typeof (v as ContinueEntry).epId === "string";

const isList = (v: unknown): v is ListEntry =>
  typeof v === "object" && v !== null && typeof (v as ListEntry).id === "string";

/** Newest first. Cached, so `useSyncExternalStore` gets a stable snapshot. */
export function getContinueWatching(): ContinueEntry[] {
  if (!continueCache) {
    continueCache = readAll<ContinueEntry>(CW, isContinue).sort((a, b) => (b.at ?? 0) - (a.at ?? 0));
  }
  return continueCache;
}

/** Newest first. */
export function getMyList(): ListEntry[] {
  if (!listCache) {
    listCache = readAll<ListEntry>(WL, isList).sort((a, b) => (b.at ?? 0) - (a.at ?? 0));
  }
  return listCache;
}

/** Stable empty snapshot for server rendering and hydration. */
export const EMPTY: never[] = [];

export function saveContinueWatching(entry: Omit<ContinueEntry, "at">) {
  if (!entry.id || !entry.epId) return;
  write(CW + entry.id, { ...entry, at: Date.now() } satisfies ContinueEntry);
}

export function removeContinueWatching(id: string) {
  drop(CW + id);
}

export function isInMyList(id: string) {
  const store = storage();
  if (!store) return false;
  try {
    return store.getItem(WL + id) !== null;
  } catch {
    return false;
  }
}

export function addToMyList(entry: Omit<ListEntry, "at">) {
  if (!entry.id) return;
  write(WL + entry.id, { ...entry, at: Date.now() } satisfies ListEntry);
}

export function removeFromMyList(id: string) {
  drop(WL + id);
}

/** Returns the new state (true = now in the list). */
export function toggleMyList(entry: Omit<ListEntry, "at">) {
  const next = !isInMyList(entry.id);
  if (next) addToMyList(entry);
  else removeFromMyList(entry.id);
  return next;
}

let storageBound = false;
/** One window listener for the app's lifetime, so other tabs' writes are picked up too. */
function bindStorage() {
  if (storageBound || typeof window === "undefined") return;
  storageBound = true;
  window.addEventListener("storage", (e) => {
    if (e.key === null || e.key.startsWith(CW) || e.key.startsWith(WL)) changed();
  });
}

/** Subscribe to library changes: this tab's writes plus `storage` events from other tabs. */
export function subscribe(onChange: () => void) {
  bindStorage();
  listeners.add(onChange);
  return () => {
    listeners.delete(onChange);
  };
}
