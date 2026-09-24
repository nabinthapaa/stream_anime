// Helpers for the "morph out of the card and back into it" transition.

/** Hover-preview popups live in a portal; map each popup to the card link that owns it. */
const previewOwners = new WeakMap<Element, HTMLElement>();
export function setPreviewOwner(popup: Element, card: HTMLElement | null | undefined) {
  if (card) previewOwners.set(popup, card);
}
export function getPreviewOwner(popup: Element) {
  return previewOwners.get(popup);
}

export function normalizeId(id: string) {
  try {
    return decodeURIComponent(id);
  } catch {
    return id;
  }
}

function inView(el: Element) {
  const r = el.getBoundingClientRect();
  return r.width > 0 && r.bottom > 0 && r.right > 0 && r.top < window.innerHeight && r.left < window.innerWidth;
}

/** Poster (or billboard) rect element for a trigger. */
export function morphRectOf(el: HTMLElement) {
  return (
    el.closest<HTMLElement>("[data-morph-rect]") ?? el.querySelector<HTMLElement>("[data-morph-rect]") ?? el
  );
}

/**
 * Where to shrink back into: the first candidate still mounted and on screen,
 * else any visible card for this title. Null means "fade out in place".
 */
export function findMorphTarget(id: string, candidates: (HTMLElement | null | undefined)[]) {
  for (const el of candidates) {
    if (el?.isConnected && inView(el)) return el;
  }
  const k = normalizeId(id);
  for (const el of document.querySelectorAll<HTMLElement>("[data-details-id]")) {
    if (normalizeId(el.dataset.detailsId ?? "") !== k || el.closest("[data-hover-preview]")) continue;
    const target = morphRectOf(el);
    if (inView(target)) return target;
  }
  return null;
}
