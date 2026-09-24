import { Hero } from "@/components/Hero";
import { HomeSection } from "@/components/HomeSection";
import { ContinueWatchingRow, MyListRow } from "@/components/storage/LibraryRows";
import HeroSkeleton from "@/skeleton/Hero";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

export default function Home() {
  return (
    <>
      <h1 className="sr-only">Anime 101: watch anime online</h1>
      <Suspense fallback={<HeroSkeleton />}>
        <Hero />
      </Suspense>
      {/* 32px from the billboard to the first row, ~40px between rows */}
      <div className="space-y-8 pt-8 pb-12 md:space-y-10 md:pb-20">
        <ContinueWatchingRow />
        <MyListRow />
        <HomeSection title="New Episodes" link="recent" />
        <HomeSection title="Popular Airing Now" link="ongoing-popular" href="/popular?type=og" />
        <HomeSection title="All-Time Popular" link="popular" />
      </div>
    </>
  );
}
