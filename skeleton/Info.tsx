import { InfoFrame } from "@/app/info/[id]/Components/InfoFrame";
import { TitleDetailsSkeleton } from "@/components/title/TitleDetailsSkeleton";

/** Full /info page placeholder: same frame and sheet layout as the loaded page. */
export default function InfoSekeleton() {
  return (
    <InfoFrame>
      <TitleDetailsSkeleton />
    </InfoFrame>
  );
}
