import Link from "next/link";
import { requestLocale } from "@/lib/request-locale";
import { localePath, tr } from "@/lib/locale";

export async function Breadcrumbs({ items }: { items: { label: string; href?: string }[] }) {
  const { locale } = await requestLocale();
  return <nav aria-label={tr(locale, "Breadcrumb")}>
    <ol className="flex flex-wrap items-baseline gap-2 break-words text-sm text-muted-foreground">
      <li><Link className="underline" href={localePath(locale, "/")}>{tr(locale, "Home")}</Link></li>
      {items.map((item, index) => <li key={index} className="max-w-full break-words">
        <span aria-hidden="true" className="mr-2">/</span>
        {item.href ? <Link className="underline" href={localePath(locale, item.href)}>{tr(locale, item.label)}</Link> : <span aria-current="page">{item.label}</span>}
      </li>)}
    </ol>
  </nav>;
}
