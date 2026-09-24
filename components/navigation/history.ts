// In-app history bookkeeping (client only).
//
// Every /watch entry gets stamped (in history.state) with this document's id, how many
// /watch entries are chained on top of each other, and where that chain started. That
// lets the player's back control return exactly where the user came from (home with the
// details modal open, a grid page, ...) and fall back to `/?details=<id>` when the
// previous entry isn't ours (direct load, refresh, new tab).

/** Changes on every full page load; entries stamped by an older document are not trusted. */
export const DOC_ID = typeof window === "undefined" ? "" : Math.random().toString(36).slice(2);

export interface WatchEntryState {
  __docId?: string;
  /** Consecutive /watch entries up to and including this one */
  __watchDepth?: number;
  /** The entry before the /watch chain belongs to this document */
  __backInApp?: boolean;
  /** Path of the entry before the chain (e.g. "/info/k1r85" for the details modal) */
  __backTo?: string | null;
}

/** Details-modal entries pushed by DetailsHost */
export interface DetailsEntryState {
  __details?: string;
  __detailsScroll?: number;
  __detailsTitle?: string;
  __detailsImage?: string;
  /** Path + search of the page the modal was opened over (where closing returns to) */
  __detailsBase?: string;
  __docId?: string;
}

let lastPath: string | null = null;
let lastWatch: Required<Pick<WatchEntryState, "__watchDepth" | "__backInApp">> & { __backTo: string | null } = {
  __watchDepth: 0,
  __backInApp: false,
  __backTo: null,
};

function currentState<T>(): T {
  return (window.history.state ?? {}) as T;
}

/** Called by NavigationTracker after every route change (the new entry already exists). */
export function recordRoute(pathname: string) {
  if (pathname.startsWith("/watch/")) {
    const state = currentState<WatchEntryState & Record<string, unknown>>();
    if (!(state.__docId === DOC_ID && state.__watchDepth)) {
      const chained = lastPath?.startsWith("/watch/") ?? false;
      const stamp: WatchEntryState = chained
        ? { __docId: DOC_ID, __watchDepth: lastWatch.__watchDepth + 1, __backInApp: lastWatch.__backInApp, __backTo: lastWatch.__backTo }
        : { __docId: DOC_ID, __watchDepth: 1, __backInApp: lastPath !== null, __backTo: lastPath };
      window.history.replaceState({ ...state, ...stamp }, "");
    }
    const stamped = currentState<WatchEntryState>();
    lastWatch = {
      __watchDepth: stamped.__watchDepth ?? 1,
      __backInApp: Boolean(stamped.__backInApp),
      __backTo: stamped.__backTo ?? null,
    };
  }
  lastPath = pathname;
}

/** Called by DetailsHost when it pushes /info/<id>, which doesn't change Next's route tree. */
export function recordDetailsPath(pathname: string) {
  lastPath = pathname;
}

/** How to leave the current /watch entry: `go` steps back in history, or null for a fallback. */
export function watchBackSteps(): number | null {
  const state = currentState<WatchEntryState>();
  if (state.__docId !== DOC_ID || !state.__backInApp) return null;
  return state.__watchDepth ?? 1;
}

/** Path of the entry the /watch chain came from (when it's in this document). */
export function watchBackTarget() {
  const state = currentState<WatchEntryState>();
  return state.__docId === DOC_ID && state.__backInApp ? (state.__backTo ?? null) : null;
}

/** `/?details=<id>`: home with the details modal open (Netflix `jbv`). */
export function detailsFallbackHref(id: string) {
  return `/?details=${encodeURIComponent(id)}`;
}
