import { ButtonLink } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { PAGE_TOP } from "@/components/ui/layout";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Page not found" };

export default function NotFound() {
  return (
    <div className={`px-page pb-16 ${PAGE_TOP}`}>
      <EmptyState
        headingLevel={1}
        title="Lost your way?"
        message="We couldn't find that page or title. It may have moved, or the link might be broken."
      >
        <ButtonLink href="/">Back to Home</ButtonLink>
        <ButtonLink href="/popular" variant="secondary">
          Browse popular
        </ButtonLink>
      </EmptyState>
    </div>
  );
}
