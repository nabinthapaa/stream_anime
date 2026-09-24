import Link from "next/link";
import { buttonClass } from "./ui/Button";
import { ChevronLeftIcon, ChevronRightIcon } from "./ui/icons";

/** Previous / next page controls for the grid pages. Keeps the current filters in the URL. */
export default function NextPreviousButton({
  page,
  type,
  hasNext = true,
  q,
  aph,
}: {
  page: number;
  type?: string | string[];
  hasNext?: boolean;
  q?: string | string[];
  aph?: string | string[];
}) {
  const hasPrev = page > 1;
  if (!hasPrev && !hasNext) return null;

  const href = (target: number) => {
    const params = new URLSearchParams({ page: String(target) });
    if (type) params.set("type", String(type));
    if (q) params.set("q", String(q));
    if (aph) params.set("aph", String(aph));
    return `?${params.toString()}`;
  };

  const control = buttonClass("secondary", "md", "min-w-11 px-3 sm:px-5");

  return (
    <nav aria-label="Pagination" className="mt-12 flex items-center justify-center gap-3">
      {hasPrev ? (
        <Link href={href(page - 1)} className={control} rel="prev">
          <ChevronLeftIcon className="size-5" />
          <span>Previous</span>
        </Link>
      ) : (
        <span className={control} aria-disabled="true">
          <ChevronLeftIcon className="size-5" />
          <span>Previous</span>
        </span>
      )}
      <span className="min-w-20 text-center text-sm font-medium text-neutral-400 tabular-nums" aria-current="page">
        Page <span className="text-white">{page}</span>
      </span>
      {hasNext ? (
        <Link href={href(page + 1)} className={control} rel="next">
          <span>Next</span>
          <ChevronRightIcon className="size-5" />
        </Link>
      ) : (
        <span className={control} aria-disabled="true">
          <span>Next</span>
          <ChevronRightIcon className="size-5" />
        </span>
      )}
    </nav>
  );
}
