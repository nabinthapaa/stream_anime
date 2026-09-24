// Display helpers: turn raw API values into human-friendly labels.

const STATUS: Record<string, string> = {
  RELEASING: "Airing",
  FINISHED: "Finished",
  ENDED: "Finished",
  NOT_YET_RELEASED: "Upcoming",
  CANCELLED: "Cancelled",
  HIATUS: "On hiatus",
};

const FORMAT: Record<string, string> = {
  TV: "TV",
  TV_SHORT: "TV Short",
  MOVIE: "Movie",
  SPECIAL: "Special",
  OVA: "OVA",
  ONA: "ONA",
  MUSIC: "Music",
};

export function formatStatus(status?: string) {
  if (!status) return undefined;
  return STATUS[status] ?? status;
}

export function formatFormat(format?: string) {
  if (!format) return undefined;
  return FORMAT[format] ?? titleCase(format.toLowerCase());
}

export function formatSeason(season?: string, year?: number) {
  if (!season && !year) return undefined;
  return [season && titleCase(season.toLowerCase()), year].filter(Boolean).join(" ");
}

export function titleCase(value: string) {
  return value.replace(/(^|[\s-])(\w)/g, (_, sep: string, ch: string) => sep + ch.toUpperCase());
}

/** "hd-1" -> "HD 1", "gogo-player" -> "Gogo Player" */
export function formatServer(name: string) {
  return name
    .split(/[-_\s]+/)
    .map((part) => (part.length <= 2 ? part.toUpperCase() : titleCase(part)))
    .join(" ");
}

/** AniList descriptions contain light HTML; the hero needs plain text for line clamping. */
export function plainText(html?: string) {
  if (!html) return "";
  return html
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<[^>]*>/g, "")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;|&apos;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&mdash;/g, "—")
    .replace(/\s+/g, " ")
    .trim();
}

/** Only absolute or root-relative URLs are valid `next/image` sources. */
export function imageSrc(src?: string) {
  if (!src) return undefined;
  return /^(https?:)?\/\//.test(src) || src.startsWith("/") ? src : undefined;
}

/** "one-piece-episode-12" -> 12 */
export function episodeFromId(ep_id: string) {
  const match = ep_id.match(/\b\d+\b/g) || [];
  const n = Number(match[match.length - 1]);
  return Number.isFinite(n) ? n : undefined;
}

/** "one-piece-episode-12" -> "One Piece" */
export function nameFromSlug(slug: string) {
  return titleCase(decodeURIComponentSafe(slug).replace(/-episode-\d+$/, "").replace(/-/g, " "));
}

function decodeURIComponentSafe(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

/**
 * Canonical `/info/<id>` href. Ids can contain non-ASCII characters ("precure♪", "※");
 * the router keys segments by their encoded form, so always link with the encoded id
 * (decoding first makes this safe for ids that arrive already encoded, e.g. from params).
 */
export function infoHref(id: string) {
  return `/info/${encodeURIComponent(decodeURIComponentSafe(id))}`;
}

/** Rating label: AniList's averageScore ("82% rated"), else the source's score ("8.2/10"). */
export function ratingLabel(averageScore?: number, score?: string) {
  if (averageScore) return `${averageScore}% rated`;
  const s = score?.trim();
  if (!s) return undefined;
  return /\/\s*10$/.test(s) ? s.replace(/\s+/g, "") : `${s}/10`;
}
