// Player icon set: 24px grid, white, decorative (buttons carry the aria-labels).
import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement>;

const base = {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 24 24",
  "aria-hidden": true,
  focusable: false,
} as const;

const stroke = { fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" } as const;

export const PlayGlyph = (p: P) => (
  <svg {...base} fill="currentColor" {...p}>
    <path d="M7 4.5v15a1 1 0 0 0 1.52.85l12-7.5a1 1 0 0 0 0-1.7l-12-7.5A1 1 0 0 0 7 4.5Z" />
  </svg>
);

export const PauseGlyph = (p: P) => (
  <svg {...base} fill="currentColor" {...p}>
    <rect x="5.5" y="4" width="4.5" height="16" rx="1" />
    <rect x="14" y="4" width="4.5" height="16" rx="1" />
  </svg>
);

/** Circular arrow with "10"; `dir` -1 = back, 1 = forward */
export const Skip10Glyph = ({ dir, ...p }: P & { dir: -1 | 1 }) => (
  <svg {...base} {...p}>
    <g {...stroke} transform={dir === 1 ? "translate(24 0) scale(-1 1)" : undefined}>
      <path d="M4.5 12a7.5 7.5 0 1 0 2.2-5.3" />
      <path d="M4 3.5v4h4" />
    </g>
    <text x="12" y="15.6" textAnchor="middle" fontSize="7.5" fontWeight="700" fill="currentColor" fontFamily="inherit">
      10
    </text>
  </svg>
);

export const VolumeGlyph = ({ level, ...p }: P & { level: "muted" | "low" | "high" }) => (
  <svg {...base} {...p}>
    <g {...stroke}>
      <path d="M11 5 6.5 9H3v6h3.5L11 19V5Z" fill="currentColor" />
      {level === "muted" ? (
        <path d="m16 9.5 5 5m0-5-5 5" />
      ) : (
        <>
          <path d="M15.5 9a4.5 4.5 0 0 1 0 6" />
          {level === "high" && <path d="M18.5 6a8.5 8.5 0 0 1 0 12" />}
        </>
      )}
    </g>
  </svg>
);

export const NextEpisodeGlyph = (p: P) => (
  <svg {...base} fill="currentColor" {...p}>
    <path d="M5 4.8v14.4a.8.8 0 0 0 1.22.68l11.2-7.2a.8.8 0 0 0 0-1.36L6.22 4.12A.8.8 0 0 0 5 4.8Z" />
    <rect x="18" y="4" width="2.5" height="16" rx="1" />
  </svg>
);

export const EpisodesGlyph = (p: P) => (
  <svg {...base} {...p}>
    <g {...stroke}>
      <rect x="3" y="7" width="14" height="12" rx="1.5" />
      <path d="M6 4h14.5a.5.5 0 0 1 .5.5V15" />
    </g>
  </svg>
);

export const SpeedGlyph = (p: P) => (
  <svg {...base} {...p}>
    <g {...stroke}>
      <path d="M4.2 17a9 9 0 1 1 15.6 0" />
      <path d="m12 13 4.5-4.5" />
      <circle cx="12" cy="13" r="1.2" fill="currentColor" />
    </g>
  </svg>
);

export const FullscreenGlyph = ({ exit, ...p }: P & { exit?: boolean }) => (
  <svg {...base} {...p}>
    <g {...stroke}>
      {exit ? (
        <path d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5" />
      ) : (
        <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />
      )}
    </g>
  </svg>
);

export const BackArrowGlyph = (p: P) => (
  <svg {...base} {...p}>
    <path {...stroke} d="M20 12H5m6-7-7 7 7 7" />
  </svg>
);

export const CheckGlyph = (p: P) => (
  <svg {...base} {...p}>
    <path {...stroke} d="m5 12.5 4.5 4.5L19 7.5" />
  </svg>
);

export const CloseGlyph = (p: P) => (
  <svg {...base} {...p}>
    <path {...stroke} d="M18 6 6 18M6 6l12 12" />
  </svg>
);

export const ServerGlyph = (p: P) => (
  <svg {...base} {...p}>
    <g {...stroke}>
      <rect x="3.5" y="4" width="17" height="6.5" rx="1.5" />
      <rect x="3.5" y="13.5" width="17" height="6.5" rx="1.5" />
      <path d="M7 7.25h.01M7 16.75h.01" />
    </g>
  </svg>
);

export const MoreGlyph = (p: P) => (
  <svg {...base} fill="currentColor" {...p}>
    <circle cx="12" cy="5" r="1.8" />
    <circle cx="12" cy="12" r="1.8" />
    <circle cx="12" cy="19" r="1.8" />
  </svg>
);
