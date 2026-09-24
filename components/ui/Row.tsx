import type { ReactNode } from "react";
import { ROW_ITEM } from "./layout";
import { RowScroller } from "./RowScroller";
import { SectionHeader } from "./SectionHeader";

/** Titled row section. Put a <RowTrack> (or its skeleton) inside. */
export function RowSection({
  id,
  title,
  href,
  children,
}: {
  id: string;
  title: string;
  href?: string;
  children: ReactNode;
}) {
  return (
    <section aria-labelledby={id} className="group/row relative">
      <SectionHeader id={id} title={title} href={href} />
      {children}
    </section>
  );
}

/** Horizontally scrolling track; each child becomes a snap-aligned list item. */
export function RowTrack({ label, children }: { label: string; children: ReactNode[] }) {
  return (
    <RowScroller label={label}>
      {children.map((child, i) => (
        <li key={i} className={ROW_ITEM}>
          {child}
        </li>
      ))}
    </RowScroller>
  );
}
