export default function NextPreviousButton({
  page,
  type,
  hasNext = true,
  q,
  aph,
}: {
  page: number;
  type?: string | string[];
  hasNext?: boolean;
  q?: string | string[];
  aph?: string | string[];
}) {
  return (
    <div className="w-full flex justify-center gap-20 pb-10">
      <a
        className={`rounded-lg bg-blue-300 px-4 py-2 ${
          page === 1 ? "hidden" : ""
        } `}
        href={`?page=${page - 1 ? page - 1 : 1}${type ? `&type=${type}` : ""}${
          q ? `&q=${q}` : ""
        }${aph ? `&aph=${aph}` : ""}`}
      >
        Previous Page
      </a>
      <a
        className={`rounded-lg bg-blue-300 px-4 py-2 ${
          !hasNext ? "hidden" : ""
        }`}
        href={`?page=${page + 1}${type ? `&type=${type}` : ""}${
          q ? `&q=${q}` : ""
        }
        ${aph ? `&aph=${aph}` : ""}`}
      >
        Next Page
      </a>
    </div>
  );
}
