import InfoSekeleton from "@/skeleton/Info";

export default function Info({ params }: { params: { id: string } }) {
    return (
        <div className="container mx-auto py-4">
            <InfoSekeleton />
        </div>
    )
}
