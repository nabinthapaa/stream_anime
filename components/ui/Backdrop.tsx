import { getImageProps } from "next/image";
import { cn } from "./cn";
import { imageSrc } from "./format";

/**
 * Full-bleed key art with scrims. Art-directed: mobile gets the portrait cover,
 * desktop gets the wide AniList banner. With no banner, desktop shows the cover
 * blurred and dimmed so it reads as ambience rather than a stretched poster.
 */
export function Backdrop({
  banner,
  cover,
  highPriority = false,
  variant = "page",
  className,
}: {
  banner?: string;
  cover?: string;
  highPriority?: boolean;
  /** `page`: fades into the canvas. `card`: inset billboard, scrims to black inside the card. */
  variant?: "page" | "card";
  className?: string;
}) {
  const bannerSrc = imageSrc(banner);
  const coverSrc = imageSrc(cover);
  const fallback = coverSrc || bannerSrc;
  const common = {
    alt: "",
    fill: true,
    sizes: "100vw",
    fetchPriority: highPriority ? ("high" as const) : undefined,
    loading: highPriority ? ("eager" as const) : undefined,
  };

  let image = null;
  if (fallback) {
    const { props: img } = getImageProps({ ...common, src: fallback });
    const desktop = bannerSrc && coverSrc ? getImageProps({ ...common, src: bannerSrc }).props.srcSet : undefined;
    const blurredOnDesktop = !bannerSrc;
    image = (
      <picture>
        {desktop && <source media="(min-width: 768px)" srcSet={desktop} sizes="100vw" />}
        <img
          {...img}
          alt=""
          className={cn(
            "object-cover object-[center_20%] md:object-center",
            blurredOnDesktop && "md:scale-110 md:opacity-50 md:blur-2xl",
          )}
        />
      </picture>
    );
  }

  return (
    <div aria-hidden="true" className={cn("pointer-events-none absolute inset-0 -z-10 overflow-hidden bg-surface", className)}>
      {image}
      {variant === "card" ? (
        <>
          {/* Left + bottom scrims keep the title, meta and synopsis at AA contrast on any artwork */}
          <div className="absolute inset-0 bg-linear-to-r from-black/85 via-black/45 to-transparent md:w-3/4" />
          <div className="absolute inset-x-0 bottom-0 h-3/4 bg-linear-to-t from-black/90 via-black/50 to-transparent md:h-2/3" />
        </>
      ) : (
        <>
          <div className="absolute inset-0 bg-linear-to-r from-canvas/95 via-canvas/55 to-transparent md:via-canvas/40" />
          <div className="absolute inset-x-0 bottom-0 h-3/4 bg-linear-to-t from-canvas via-canvas/70 to-transparent" />
          <div className="absolute inset-x-0 top-0 h-32 bg-linear-to-b from-canvas/70 to-transparent" />
        </>
      )}
    </div>
  );
}
