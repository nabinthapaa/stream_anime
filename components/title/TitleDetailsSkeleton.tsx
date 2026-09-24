import { HeroImage } from "./HeroImage";
import { imageSrc } from "../ui/format";

/**
 * Mirrors TitleDetails: 16:9 hero, meta + synopsis / facts columns, episode rows.
 * When opened from a card it already shows what the card knows (artwork + title).
 */
export function TitleDetailsSkeleton({
  title,
  image,
  headingId,
  placeholderSrc,
}: {
  title?: string;
  image?: string;
  /** id for the title heading, so the dialog stays labelled while loading */
  headingId?: string;
  /** The card's already-loaded `/_next/image` URL, painted first during the morph */
  placeholderSrc?: string;
}) {
  const src = imageSrc(image);
  return (
    <div role="status" aria-label={title ? `Loading ${title}` : "Loading title"}>
      <div className="relative aspect-[4/3] w-full bg-surface-raised sm:aspect-video">
        {src || placeholderSrc ? (
          <HeroImage src={src} placeholder={placeholderSrc} sizes="(min-width: 1800px) 1100px, (min-width: 640px) 850px, 100vw" className="object-cover" />
        ) : (
          <div className="skeleton absolute inset-0 opacity-60" />
        )}
        <div className="absolute inset-0 bg-linear-to-t from-surface via-surface/30 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 space-y-4 px-5 pb-5 sm:space-y-6 sm:px-12 sm:pb-10" data-morph-fade="">
          {title ? (
            <h2
              id={headingId}
              className="line-clamp-3 max-w-[90%] text-3xl leading-[1.05] font-bold tracking-tight text-balance text-white drop-shadow-lg sm:text-4xl lg:text-5xl"
            >
              {title}
            </h2>
          ) : (
            <div className="skeleton h-9 w-2/3 rounded-md sm:h-12" />
          )}
          <div className="flex gap-3">
            <div className="skeleton h-12 w-36 rounded-md" />
            <div className="skeleton h-12 w-40 rounded-md" />
          </div>
        </div>
      </div>
      <div className="grid gap-6 px-5 pt-2 pb-8 sm:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] sm:gap-8 sm:px-12" data-morph-fade="">
        <div className="space-y-4">
          <div className="skeleton h-5 w-2/3 rounded-sm" />
          <div className="space-y-2">
            <div className="skeleton h-4 w-full rounded-sm" />
            <div className="skeleton h-4 w-full rounded-sm" />
            <div className="skeleton h-4 w-11/12 rounded-sm" />
            <div className="skeleton h-4 w-3/5 rounded-sm" />
          </div>
        </div>
        <div className="space-y-3">
          <div className="skeleton h-4 w-5/6 rounded-sm" />
          <div className="skeleton h-4 w-1/2 rounded-sm" />
          <div className="skeleton h-4 w-2/3 rounded-sm" />
        </div>
      </div>
      <div className="px-5 pb-10 sm:px-12 sm:pb-12" data-morph-fade="">
        <div className="skeleton h-7 w-32 rounded-md" />
        <div className="mt-4 border-t border-line">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 border-b border-line px-1 py-4 sm:gap-5 sm:px-4">
              <div className="skeleton h-6 w-9 rounded-sm sm:w-12" />
              <div className="skeleton aspect-video w-28 rounded-sm sm:w-[8.125rem]" />
              <div className="flex-1 space-y-2">
                <div className="skeleton h-4 w-1/3 rounded-sm" />
                <div className="skeleton h-3 w-1/2 rounded-sm" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
