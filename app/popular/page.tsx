import NextPreviousButton from "@/components/NextButton";
import { ButtonLink } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { FilterTabs } from "@/components/ui/FilterTabs";
import { PageHeader } from "@/components/ui/PageHeader";
import { GRID_SIZES, PosterCard } from "@/components/ui/PosterCard";
import { PosterGrid } from "@/components/ui/PosterGrid";
import { titleCase, infoHref } from "@/components/ui/format";
import { PAGE_TOP } from "@/components/ui/layout";
import { GridSkeleton } from "@/skeleton/Card";
import config from "@/utils/config";
import axios from "axios";
import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = { title: "Popular" };

export default async function Page(
  props: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
  }
) {
  const searchParams = await props.searchParams;
  let page = Number(searchParams?.page) || 1;
  let type = searchParams.type || "";
  return (
    <div className={`px-page pb-16 ${PAGE_TOP}`}>
      <PageHeader
        title="Popular"
        description={type === "og" ? "What everyone is watching this season." : "The most watched titles of all time."}
      >
        <FilterTabs
          label="Popularity"
          tabs={[
            { label: "All Time", href: "/popular", active: type !== "og" },
            { label: "Airing Now", href: "?type=og", active: type === "og" },
          ]}
        />
      </PageHeader>
      <div className="mt-8">
        <Suspense key={`${type}-${page}`} fallback={<GridSkeleton />}>
          <Popular page={page} type={type} />
        </Suspense>
      </div>
    </div>
  );
}

interface Element {
  id: string;
  name: string;
  date?: string;
  img: string;
  isDub?: boolean;
  genres?: string[];
  recent_ep_id?: string;
}

interface Data {
  meta: {
    totalResult: number;
    hasNext: true;
  };
  results: Element[];
}

async function Popular({
  page,
  type,
}: {
  page: number;
  type?: string | string[];
}) {
  if (!config.hostname) return null;
  let data: Data | any = {};
  if (type === "og") {
    const res = await axios.get(
      `${config.hostname}/api/ongoing-popular?page=${page}`,
    );
    data = res.data;
  } else {
    const res = await axios.get(`${config.hostname}/api/popular?page=${page}`);
    data = res.data;
  }
  const results: Element[] = data?.results ?? [];

  if (!results.length) {
    return (
      <EmptyState
        title={page > 1 ? "You've reached the end" : "Nothing popular yet"}
        message={page > 1 ? "There are no more titles on this list." : "We couldn't find any titles for this list right now."}
      >
        <ButtonLink href={type === "og" ? "?type=og" : "/popular"}>{page > 1 ? "Back to page 1" : "Refresh"}</ButtonLink>
      </EmptyState>
    );
  }

  return (
    <>
      <PosterGrid label="Popular titles">
        {results.map((element) => (
          <PosterCard
            key={element.id}
            href={infoHref(element.id)}
            title={element.name}
            image={element.img}
            badge={element.isDub ? "Dub" : undefined}
            meta={
              element.date
                ? `Released ${element.date}`
                : element.genres?.length
                  ? element.genres.slice(0, 2).map(titleCase).join(" • ")
                  : "Sub"
            }
            sizes={GRID_SIZES}
          />
        ))}
      </PosterGrid>
      <NextPreviousButton page={page} type={type} hasNext={data?.meta?.hasNext ?? true} />
    </>
  );
}
