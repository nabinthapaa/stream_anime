import { getTitleInfo, type TitleInfo } from "@/components/title/data";
import { TitleDetails } from "@/components/title/TitleDetails";
import { plainText } from "@/components/ui/format";
import InfoSekeleton from "@/skeleton/Info";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { InfoFrame } from "./Components/InfoFrame";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { id } = await props.params;
  try {
    const data = await getTitleInfo(id);
    return {
      title: `${data.name}`,
      description: plainText(data.plot).slice(0, 200) || undefined,
    };
  } catch {
    return { title: "Title not found" };
  }
}

/** Direct load / refresh of /info/[id]: the same details sheet as the modal, as a full page. */
export default async function Page(props: Props) {
  const { id } = await props.params;
  return (
    <Suspense fallback={<InfoSekeleton />}>
      <Info id={id} />
    </Suspense>
  );
}

async function Info({ id }: { id: string }) {
  let data: TitleInfo;
  try {
    data = await getTitleInfo(id);
  } catch {
    redirect("/not-found");
  }
  return (
    <InfoFrame>
      <TitleDetails id={id} data={data} headingLevel={1} />
    </InfoFrame>
  );
}
