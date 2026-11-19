import Link from "next/link";

export function NewsPagination({ path, query, page, totalPage }: {
  path: string;
  query: URLSearchParams;
  page: number;
  totalPage: number;
}) {
  if (totalPage < 2 && page <= 1) return null;
  const url = (number: number) => {
    const params = new URLSearchParams(query);
    params.set("page", String(number));
    return `${path}?${params}`;
  };
  return (
    <nav aria-label="News pagination" className="flex flex-wrap items-center gap-4 text-sm">
      {page > 1 && <Link className="underline" href={url(Math.min(page - 1, Math.max(1, totalPage)))}>Previous</Link>}
      <span>Page {page} of {Math.max(1, totalPage)}</span>
      {page < totalPage && <Link className="underline" href={url(page + 1)}>Next</Link>}
    </nav>
  );
}
