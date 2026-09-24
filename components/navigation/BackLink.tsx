"use client";

import { useRouter } from "next/navigation";
import type { MouseEvent, ReactNode } from "react";
import { normalizeId } from "../title/morph";
import { watchBackSteps, watchBackTarget } from "./history";

/**
 * A real link (semantics, middle-click, open in new tab) whose plain click returns to
 * where the user came from when that entry is in-app, like the browser Back button.
 * Otherwise it navigates to `href` (replacing the entry when `replace` is set).
 *
 * `onlyIfFromDetails`: go back only when the previous entry is this title's details
 * modal (`/info/<id>`); otherwise follow `href`.
 */
export function BackLink({
  href,
  replace = false,
  onlyIfFromDetails,
  className,
  children,
  ...rest
}: {
  href: string;
  replace?: boolean;
  onlyIfFromDetails?: string;
  className?: string;
  children: ReactNode;
  "aria-label"?: string;
  tabIndex?: number;
}) {
  const router = useRouter();

  const onClick = (e: MouseEvent<HTMLAnchorElement>) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    const steps = watchBackSteps();
    const target = watchBackTarget();
    const fromDetails =
      onlyIfFromDetails === undefined ||
      (target?.startsWith("/info/") && normalizeId(target.slice("/info/".length)) === normalizeId(onlyIfFromDetails));
    if (steps && fromDetails) window.history.go(-steps);
    else if (replace) router.replace(href, { scroll: false });
    else router.push(href);
  };

  return (
    <a href={href} onClick={onClick} className={className} {...rest}>
      {children}
    </a>
  );
}
