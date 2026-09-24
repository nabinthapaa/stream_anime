// Shared layout classes, used by both the real components and their skeletons
// so placeholders match final dimensions exactly.

/**
 * Width of one 16:9 card within a row (8px gaps). The divisor is how many cards are
 * visible in the gutter-to-gutter track, so the next card always peeks:
 *   <640  2.3  (390px phone: ~150px)       lg 1024  4.2 (~217px)
 *   sm/md 3.2  (768px: ~203px)             xl 1280+ 6.2 (1280: ~182px, 1440: ~207px)
 *   3xl 1800+ 6.7 (1920: ~262px)           4xl 2200+ 7.2 (2342: ~301px, Netflix ~308px)
 */
export const ROW_ITEM =
  "shrink-0 snap-start " +
  "w-[calc((100%_-_1rem)/2.3)] " +
  "sm:w-[calc((100%_-_1.5rem)/3.2)] " +
  "lg:w-[calc((100%_-_2rem)/4.2)] " +
  "xl:w-[calc((100%_-_3rem)/6.2)] " +
  "3xl:w-[calc((100%_-_3rem)/6.7)] " +
  "4xl:w-[calc((100%_-_3.5rem)/7.2)]";

/** `sizes` matching ROW_ITEM (the art is only 480px wide, so this never over-fetches). */
export const ROW_SIZES =
  "(min-width: 2200px) 13vw, (min-width: 1800px) 14vw, (min-width: 1280px) 15vw, (min-width: 1024px) 22vw, (min-width: 640px) 29vw, 42vw";

/** `sizes` for the hover preview (1.5x the row card). */
export const PREVIEW_SIZES =
  "(min-width: 2200px) 20vw, (min-width: 1800px) 21vw, (min-width: 1280px) 23vw, (min-width: 1024px) 33vw, 44vw";

/** Row track: horizontal padding = page gutter, 8px gaps. */
export const ROW_TRACK = "flex gap-2 px-page py-1";

/** Row heading: 24px/500 on desktop (the header sits 14px above the cards). */
export const ROW_TITLE = "text-lg leading-8 font-medium text-white md:text-xl xl:text-2xl";

/** Responsive 16:9 tile grid: 2 / 3 (sm) / 4 (lg) / 5 (xl) / 6 (3xl) columns, 8px gaps. */
export const GRID = "grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 3xl:grid-cols-6";

/** `sizes` matching GRID. */
export const GRID_SIZES =
  "(min-width: 1800px) 16vw, (min-width: 1280px) 19vw, (min-width: 1024px) 24vw, (min-width: 640px) 32vw, 48vw";

/** Top spacing for pages that don't start with a full-bleed image (clears the fixed navbar). */
export const PAGE_TOP = "pt-[calc(var(--spacing-nav)_+_1.5rem)] md:pt-[calc(var(--spacing-nav)_+_2.5rem)]";

/**
 * Billboard: an inset rounded card aligned to the page gutter, starting under the navbar,
 * ~75vh tall. Shared by the hero and its skeleton.
 */
export const HERO_FRAME =
  "relative isolate mx-page mt-nav flex overflow-hidden rounded-3xl items-end " +
  "h-[72svh] min-h-[30rem] max-h-[56rem] md:h-[75vh] md:min-h-[32rem] md:max-h-[64rem]";

/** Title-details panel: shared by the intercepted modal and the full /info page so they look identical. */
export const DETAILS_PANEL =
  "relative w-full overflow-hidden bg-surface sm:mx-auto sm:max-w-[53.125rem] sm:rounded-lg 3xl:max-w-[68.75rem]";

/** id of the heading that labels the title-details dialog */
export const DETAILS_HEADING_ID = "title-details-heading";
