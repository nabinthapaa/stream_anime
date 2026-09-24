import { infoHref } from "@/components/ui/format";
import NextPreviousButton from "@/components/NextButton";
import { ButtonLink } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { GRID_SIZES, PosterCard } from "@/components/ui/PosterCard";
import { PosterGrid } from "@/components/ui/PosterGrid";
import { SearchIcon } from "@/components/ui/icons";
import { PAGE_TOP } from "@/components/ui/layout";
import { GridSkeleton } from "@/skeleton/Card";
import config from "@/utils/config";
import axios from "axios";
import type { Metadata } from "next";
import React, { Suspense } from "react";

export async function generateMetadata(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}): Promise<Metadata> {
  const { q } = await props.searchParams;
  return { title: q ? `Search: ${q}` : "Search" };
}

export default async function page(
  props: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
  }
) {
  const searchParams = await props.searchParams;
  const q = searchParams?.q || "naruto";
  const page = Number(searchParams.page) || 1;

  return (
    <div className={`px-page pb-16 ${PAGE_TOP}`}>
      <PageHeader title="Search" description={<>Results for <span className="font-semibold text-white">&ldquo;{q}&rdquo;</span></>}>
        <form action="/search" role="search" className="relative max-w-xl">
          <label htmlFor="search-page-q" className="sr-only">
            Search titles
          </label>
          <SearchIcon className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-neutral-400" />
          <input
            id="search-page-q"
            type="search"
            name="q"
            defaultValue={searchParams?.q ? String(q) : ""}
            placeholder="Search titles"
            autoComplete="off"
            enterKeyHint="search"
            className="h-12 w-full rounded-md bg-surface-raised pr-4 pl-12 text-base text-white ring-1 ring-white/10 transition-shadow outline-hidden focus:ring-accent"
          />
        </form>
      </PageHeader>
      <div className="mt-8">
        <Suspense key={`${q}-${page}`} fallback={<GridSkeleton />}>
          <Results term={q as string} page={page} />
        </Suspense>
      </div>
    </div>
  );
}

async function Results({ term, page }: { term: string; page: number }) {
  if (!config.hostname) return null;
  const { data } = await axios.get(`${config.hostname}/api/search?q=${encodeURIComponent(term)}&page=${page}`);
  const results: any[] = data?.results ?? [];

  if (!results.length) {
    return (
      <EmptyState title={`No results for “${term}”`} message="Check the spelling, or try the English or Japanese title.">
        <ButtonLink href="/popular">Browse popular</ButtonLink>
        <ButtonLink href="/recent" variant="secondary">
          Recent episodes
        </ButtonLink>
      </EmptyState>
    );
  }

  return (
    <>
      <PosterGrid label={`Search results for ${term}`}>
        {results.map((element: any) => (
          <PosterCard
            key={element.id}
            href={infoHref(element.id)}
            title={element.name}
            image={element.img}
            badge={element.isDub ? "Dub" : undefined}
            meta={element.date ? `Released ${element.date}` : undefined}
            sizes={GRID_SIZES}
          />
        ))}
      </PosterGrid>
      <NextPreviousButton page={page} q={term} hasNext={data?.meta?.hasNext} />
    </>
  );
}
