import Link from "next/link";
import { publicNavGroups } from "@/config/nav";
import { siteConfig } from "@/config/site";
import { localePath, tr } from "@/lib/locale";
import { requestLocale } from "@/lib/request-locale";

export async function Footer() {
  const { locale } = await requestLocale();
  return (
    <footer className="border-t border-border bg-sidebar text-sidebar-foreground">
      <div className="container-x grid gap-8 py-12 sm:grid-cols-2 lg:grid-cols-5">
        <div>
          <p className="font-display text-xl font-semibold">{locale === "bn" ? siteConfig.nameBn : siteConfig.name}</p>
        </div>
        {publicNavGroups.map((group) => (
          <div key={group.label}>
            <p className="text-sm font-semibold text-sidebar-foreground">{tr(locale, group.label)}</p>
            <ul className="mt-4 grid gap-3">
              {group.links.map((item) => (
                <li key={item.href}>
                  <Link href={localePath(locale, item.href)} className="text-sm text-sidebar-foreground/75 transition-colors hover:text-primary-foreground">
                    {tr(locale, item.label)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-sidebar-foreground/10">
        <div className="container-x flex flex-col gap-2 py-5 text-xs text-sidebar-foreground/60 sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} {siteConfig.acronym}. {tr(locale, "All rights reserved.")}</span>
        </div>
      </div>
    </footer>
  );
}
