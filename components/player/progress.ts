// Resume storage: `{ t, d }` (seconds watched, duration). Older entries stored just `t`.

export interface SavedProgress {
  t: number;
  d?: number;
}

export function readProgress(key: string): SavedProgress | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    if (typeof parsed === "number") return Number.isFinite(parsed) ? { t: parsed } : null; // legacy format
    if (parsed && typeof parsed === "object" && typeof (parsed as SavedProgress).t === "number") {
      const p = parsed as SavedProgress;
      return { t: p.t, d: typeof p.d === "number" && Number.isFinite(p.d) ? p.d : undefined };
    }
  } catch {
    /* unavailable or malformed */
  }
  return null;
}

export function writeProgress(key: string, t: number, d: number) {
  try {
    localStorage.setItem(key, JSON.stringify({ t: Math.floor(t), d: Math.floor(d) }));
  } catch {
    /* storage unavailable */
  }
}

/** 0..1 watched fraction, or null when unknown */
export function progressFraction(key: string | undefined) {
  if (!key) return null;
  const p = readProgress(key);
  if (!p?.d) return null;
  return Math.min(1, Math.max(0, p.t / p.d));
}
