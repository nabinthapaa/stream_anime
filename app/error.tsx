"use client";

import { Button, ButtonLink } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { PAGE_TOP } from "@/components/ui/layout";
import { useEffect } from "react";

export default function Error({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className={`px-page pb-16 ${PAGE_TOP}`}>
      <EmptyState
        tone="error"
        headingLevel={1}
        title="Something went wrong"
        message={
          <>
            We couldn&apos;t load this page. The source may be slow or temporarily unavailable.
            {error.digest && <span className="mt-2 block text-xs text-neutral-400">Reference: {error.digest}</span>}
          </>
        }
      >
        <Button onClick={() => retry()}>Try again</Button>
        <ButtonLink href="/" variant="secondary">
          Back to Home
        </ButtonLink>
      </EmptyState>
    </div>
  );
}
