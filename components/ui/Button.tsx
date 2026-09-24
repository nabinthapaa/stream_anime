import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "./cn";

type Variant = "primary" | "secondary" | "accent" | "ghost";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex shrink-0 items-center justify-center gap-2 font-medium whitespace-nowrap select-none " +
  "transition-[background-color,color,transform] duration-200 ease-out active:scale-[0.98] " +
  "disabled:pointer-events-none disabled:opacity-40 aria-disabled:pointer-events-none aria-disabled:opacity-40";

const variants: Record<Variant, string> = {
  // "Play": solid white, like the billboard CTA
  primary: "bg-white text-black hover:bg-white/80",
  // "More info": translucent gray over imagery
  secondary: "bg-[rgb(128_128_128/0.4)] text-white hover:bg-[rgb(128_128_128/0.25)]",
  accent: "bg-accent-strong text-white hover:bg-accent-hover",
  ghost: "text-neutral-300 hover:bg-white/10 hover:text-white",
};

const sizes: Record<Size, string> = {
  sm: "h-11 px-4 text-sm sm:h-9",
  md: "h-11 px-5 text-sm md:text-base",
  // Billboard CTA: 48px tall, 8px 20px padding, 18px/500
  lg: "h-12 px-5 text-base md:text-lg",
};

export function buttonClass(variant: Variant = "primary", size: Size = "md", className?: string, pill = false) {
  return cn(base, pill ? "rounded-full" : "rounded-md", variants[variant], sizes[size], className);
}

interface Common {
  variant?: Variant;
  size?: Size;
  /** Fully rounded (billboard style) instead of a rounded rectangle */
  pill?: boolean;
  icon?: ReactNode;
  children: ReactNode;
}

export function ButtonLink({
  variant,
  size,
  pill,
  icon,
  children,
  className,
  ...props
}: Common & ComponentProps<typeof Link>) {
  return (
    <Link className={buttonClass(variant, size, className, pill)} {...props}>
      {icon}
      {children}
    </Link>
  );
}

export function Button({
  variant,
  size,
  pill,
  icon,
  children,
  className,
  type = "button",
  ...props
}: Common & ComponentProps<"button">) {
  return (
    <button type={type} className={buttonClass(variant, size, className, pill)} {...props}>
      {icon}
      {children}
    </button>
  );
}
