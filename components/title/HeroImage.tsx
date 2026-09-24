"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "../ui/cn";

/**
 * Details-sheet hero art. When opened from a card, `placeholder` is the exact
 * `/_next/image` URL the card already decoded (its `currentSrc`), so the first frame
 * of the morph paints instantly from the memory cache. The sharper hero (different
 * optimizer size, or the AniList banner) cross-fades in on top once it has loaded.
 */
export function HeroImage({
  src,
  placeholder,
  sizes,
  className,
  preload,
}: {
  src?: string;
  placeholder?: string;
  sizes: string;
  className?: string;
  preload?: boolean;
}) {
  const [loaded, setLoaded] = useState(false);
  return (
    <>
      {placeholder && (
        // eslint-disable-next-line @next/next/no-img-element -- must reuse the card's already-loaded optimizer URL verbatim
        <img
          src={placeholder}
          alt=""
          aria-hidden="true"
          decoding="sync"
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}
      {src && (
        <Image
          src={src}
          alt=""
          fill
          preload={preload}
          sizes={sizes}
          onLoad={() => setLoaded(true)}
          className={cn(className, placeholder && "transition-opacity duration-200", placeholder && !loaded && "opacity-0")}
        />
      )}
    </>
  );
}
