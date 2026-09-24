"use client";

import { cn } from "../ui/cn";
import { CheckIcon, PlusIcon } from "../ui/icons";
import { useInMyList } from "./hooks";
import { toggleMyList, type ListEntry } from "./library";

/**
 * Netflix's circular add control: "+" becomes "✓" once the title is in My List.
 * A real <button> with state in its accessible name, so it works from the keyboard.
 */
export function ListButton({
  entry,
  size = "md",
  className,
  tabIndex,
}: {
  entry: Omit<ListEntry, "at">;
  size?: "sm" | "md";
  className?: string;
  /** -1 inside the hover preview, which is aria-hidden and not keyboard reachable */
  tabIndex?: number;
}) {
  const inList = useInMyList(entry.id);
  const Icon = inList ? CheckIcon : PlusIcon;
  return (
    <button
      type="button"
      tabIndex={tabIndex}
      // Never treated as "open the details modal" by DetailsHost's delegated click handler.
      data-details-ignore=""
      aria-pressed={inList}
      aria-label={inList ? `Remove ${entry.title} from My List` : `Add ${entry.title} to My List`}
      onClick={(e) => {
        // Inside the details modal / hover preview: don't let the card's own click handler
        // or a wrapping link take over.
        e.preventDefault();
        e.stopPropagation();
        toggleMyList(entry);
      }}
      className={cn(
        "grid shrink-0 place-items-center rounded-full text-white ring-2 ring-white/50 ring-inset transition-colors duration-150 hover:ring-white",
        size === "sm" ? "size-10 [&>svg]:size-5" : "size-11 [&>svg]:size-6 sm:size-12",
        className,
      )}
    >
      <Icon />
    </button>
  );
}
