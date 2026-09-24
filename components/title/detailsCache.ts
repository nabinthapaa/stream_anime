// Client-side cache for `/api/info?id=` (the existing endpoint, unchanged).
// Shared by the hover preview and the details modal: at most one request per title
// per page session, so a title that was hovered opens with real content immediately.
import type { TitleInfo } from "./data";

const pending = new Map<string, Promise<TitleInfo | null>>();
const settled = new Map<string, TitleInfo | null>();

function key(id: string) {
  try {
    return decodeURIComponent(id);
  } catch {
    return id;
  }
}

export function loadTitleDetails(id: string) {
  const k = key(id);
  let request = pending.get(k);
  if (!request) {
    request = fetch(`/api/info?id=${encodeURIComponent(k)}`)
      .then((res) => (res.ok ? (res.json() as Promise<TitleInfo>) : null))
      .catch(() => null)
      .then((data) => {
        settled.set(k, data);
        // Let a failed request be retried next time.
        if (!data) pending.delete(k);
        return data;
      });
    pending.set(k, request);
  }
  return request;
}

/** Synchronous read: the details if they've already arrived, `undefined` if not (yet). */
export function peekTitleDetails(id: string) {
  const value = settled.get(key(id));
  return value ?? undefined;
}
