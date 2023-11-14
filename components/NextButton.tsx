export default function NextPreviousButton({
  page,
  type,
}: {
  page: number;
  type?: string | string[];
}) {
  return (
    <div className="w-full flex justify-center gap-20 pb-10">
      <a
        className="rounded-lg bg-blue-300 px-4 py-2"
        href={`?page=${page - 1 ? page - 1 : 1}${type ? `&type=${type}` : ""}`}
      >
        Previous Page
      </a>
      <a
        className="rounded-lg bg-blue-300 px-4 py-2"
        href={`?page=${page + 1}${type ? `&type=${type}` : ""}`}
      >
        Next Page
      </a>
    </div>
  );
}
