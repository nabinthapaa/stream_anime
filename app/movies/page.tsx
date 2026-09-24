import { infoHref } from "@/components/ui/format";
import NextPreviousButton from "@/components/NextButton";
import { ButtonLink } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { FilterTabs } from "@/components/ui/FilterTabs";
import { PageHeader } from "@/components/ui/PageHeader";
import { GRID_SIZES, PosterCard } from "@/components/ui/PosterCard";
import { PosterGrid } from "@/components/ui/PosterGrid";
import { PAGE_TOP } from "@/components/ui/layout";
import { GridSkeleton } from "@/skeleton/Card";
import config from "@/utils/config";
import axios from "axios";
import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = { title: "Movies" };

export default async function Page(
  props: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
  }
) {
  const searchParams = await props.searchParams;
  let page = Number(searchParams.page) || 1;
  let aph = searchParams.aph || "";
  let letterArray = [];
  for (let i = "A".charCodeAt(0); i <= "Z".charCodeAt(0); i++) {
    letterArray.push(String.fromCharCode(i));
  }
  const tabs = [
    { label: "All", href: "?aph=all", active: aph === "all" || aph === "" },
    { label: "#", ariaLabel: "Titles starting with a number", href: "?aph=0", active: aph === "0" },
    ...letterArray.map((l) => ({ label: l, href: `?aph=${l}`, active: aph === l })),
  ];
  return (
    <div className={`px-page pb-16 ${PAGE_TOP}`}>
      <PageHeader title="Movies" description="Feature films, A to Z.">
        <FilterTabs label="Filter by first letter" tabs={tabs} wrap />
      </PageHeader>
      <div className="mt-8">
        <Suspense key={`${aph}-${page}`} fallback={<GridSkeleton />}>
          <Movies page={page} aph={aph} />
        </Suspense>
      </div>
    </div>
  );
}

async function Movies({ page, aph }: { page: number; aph: string | string[] }) {
  if (!config.hostname) return null;
  let data: any;
  let error: string | undefined;
  try {
    const response = await axios.post(`${config.hostname}/api/movies`, {
      page,
      aph,
    });
    data = response.data;
  } catch (e: any) {
    error = e.message;
  }

  if (error) {
    return (
      <EmptyState tone="error" title="Movies are unavailable right now" message="We couldn't reach the catalogue. Please try again in a moment.">
        <ButtonLink href="/movies">Try again</ButtonLink>
      </EmptyState>
    );
  }

  const results: any[] = data?.results ?? [];
  if (!results.length) {
    return (
      <EmptyState
        title="No movies here yet"
        message={aph && aph !== "all" ? `Nothing starts with “${aph === "0" ? "#" : aph}” right now.` : "The movie shelf is empty for now."}
      >
        <ButtonLink href="/movies">Show all movies</ButtonLink>
        <ButtonLink href="/popular" variant="secondary">
          Browse popular
        </ButtonLink>
      </EmptyState>
    );
  }

  return (
    <>
      <PosterGrid label="Movies">
        {results.map((element: any) => (
          <PosterCard
            key={element.id}
            href={infoHref(element.id)}
            title={element.name}
            image={element.img}
            badge={element.isDub ? "Dub" : undefined}
            meta={element.date ? `Released ${element.date}` : "Movie"}
            sizes={GRID_SIZES}
          />
        ))}
      </PosterGrid>
      <NextPreviousButton page={page} aph={aph} hasNext={data?.meta?.hasNext} />
    </>
  );
}
