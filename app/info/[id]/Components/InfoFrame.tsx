import { DETAILS_PANEL } from "@/components/ui/layout";
import type { ReactNode } from "react";

/** Full-page frame for the details sheet: same panel as the modal, clear of the navbar. */
export function InfoFrame({ children }: { children: ReactNode }) {
  return (
    <div className="pt-nav pb-12 sm:px-4 sm:pt-[calc(var(--spacing-nav)_+_2rem)] sm:pb-16">
      <div className={DETAILS_PANEL + " shadow-[0_3px_10px_rgb(0_0_0/0.75)]"}>{children}</div>
    </div>
  );
}
