import Link from "next/link";
import { tr, type Locale } from "@/lib/locale";

export function NewsPagination({ path, query, page, totalPage, locale = "en" }: {
  path: string;
  query: URLSearchParams;
  page: number;
  totalPage: number;
  locale?: Locale;
}) {
  if (totalPage < 2 && page <= 1) return null;
  const url = (number: number) => {
    const params = new URLSearchParams(query);
    params.set("page", String(number));
    return `${path}?${params}`;
  };
  return (
    <nav aria-label={tr(locale, "Pagination")} className="flex flex-wrap items-center gap-4 text-sm">
      {page > 1 && <Link className="underline" href={url(Math.min(page - 1, Math.max(1, totalPage)))}>{tr(locale, "Previous")}</Link>}
      <span>{locale === "bn" ? `পৃষ্ঠা ${page.toLocaleString("bn")} / ${Math.max(1, totalPage).toLocaleString("bn")}` : `Page ${page} of ${Math.max(1, totalPage)}`}</span>
      {page < totalPage && <Link className="underline" href={url(page + 1)}>{tr(locale, "Next")}</Link>}
    </nav>
  );
}
