import { default as NextPreviousButton } from "@/components/NextButton";
import { ButtonLink } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { GRID_SIZES, PosterCard } from "@/components/ui/PosterCard";
import { PosterGrid } from "@/components/ui/PosterGrid";
import { PAGE_TOP } from "@/components/ui/layout";
import { GridSkeleton } from "@/skeleton/Card";
import config from "@/utils/config";
import axios from "axios";
import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = { title: "Recent Episodes" };


export default async function Page(
  props: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
  }
) {
  const searchParams = await props.searchParams;
  let page = Number(searchParams?.page) || 1;
  let type = searchParams.type || "SUB";
  return (
    <div className={`px-page pb-16 ${PAGE_TOP}`}>
      <PageHeader title="Recent Episodes" description="The latest subbed episodes as they land, newest first." />
      <div className="mt-8">
        <Suspense key={`${type}-${page}`} fallback={<GridSkeleton />}>
          <Recent page={page} type={type} />
        </Suspense>
      </div>
    </div>
  );
}

async function Recent({
  page,
  type,
}: {
  page: number;
  type: string | string[];
}) {
  if (!config.hostname) return null;
  const { data } = await axios.get(
    `${config.hostname}/api/recent?page=${page}&type=${type}`,
  );
  const results: any[] = data?.results ?? [];

  if (!results.length) {
    return (
      <EmptyState
        title={page > 1 ? "You've reached the end" : "No new episodes yet"}
        message={page > 1 ? "There are no more recent episodes." : "Nothing new has been released yet. Check back soon."}
      >
        {page > 1 ? <ButtonLink href="/recent">Back to page 1</ButtonLink> : <ButtonLink href="/popular">Browse popular</ButtonLink>}
      </EmptyState>
    );
  }

  return (
    <>
      <PosterGrid label="Recent episodes">
        {results.map((element: any) => (
          <PosterCard
            key={element.ep_id ?? element.id}
            href={`/watch/${element.ep_id}`}
            action="play"
            title={element.name}
            image={element.img}
            meta={element.episode}
            sizes={GRID_SIZES}
          />
        ))}
      </PosterGrid>
      <NextPreviousButton page={page} type={type} hasNext={data?.meta?.hasNext ?? true} />
    </>
  );
}
