import type { ReactNode } from "react";
import { GRID } from "./layout";

/** Responsive poster grid: 2 / 3 / 4 / 5 / 6 columns. Each child becomes a list item. */
export function PosterGrid({ children, label }: { children: ReactNode[]; label?: string }) {
  return (
    <ul
      role="list"
      aria-label={label}
      className={GRID}
    >
      {children.map((child, i) => (
        <li key={i}>{child}</li>
      ))}
    </ul>
  );
}
