import Link from "next/link";
import { ChevronRightIcon } from "./icons";
import { ROW_TITLE } from "./layout";

/**
 * Row heading with an "Explore all" link. The label slides out when the row
 * is hovered or the link is focused; the chevron stays visible for touch users.
 */
export function SectionHeader({ id, title, href }: { id: string; title: string; href?: string }) {
  return (
    <div className="mb-3.5 flex items-center gap-3 px-page">
      <h2 id={id} className={ROW_TITLE}>
        {title}
      </h2>
      {href && (
        <Link
          href={href}
          className="group/link -my-1.5 flex min-h-11 items-center gap-0.5 rounded-sm text-sm font-medium text-accent-text hover:text-white"
        >
          <span
            className={
              "overflow-hidden whitespace-nowrap transition-[max-width,opacity] duration-300 ease-cinematic " +
              "max-w-24 opacity-100 md:max-w-0 md:opacity-0 " +
              "md:group-hover/row:max-w-24 md:group-hover/row:opacity-100 md:group-focus-visible/link:max-w-24 md:group-focus-visible/link:opacity-100"
            }
          >
            Explore all
            <span className="sr-only"> {title}</span>
          </span>
          <ChevronRightIcon className="size-4" />
        </Link>
      )}
    </div>
  );
}
