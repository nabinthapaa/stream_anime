import { HomeSection } from "@/components/HomeSection";

export const dynamic = "force-dynamic";

export default function Home() {
  return (
    <>
      <HomeSection title="Popular" link="popular" />
      <HomeSection title="Recent Episodes" link="recent" />
    </>
  );
}
