"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { ChevronDown, GraduationCap, Menu, Search, X } from "lucide-react";
import { publicNavGroups } from "@/config/nav";
import { siteConfig } from "@/config/site";
import { Button } from "@/components/ui/button";
import { localePath, tr, type Locale } from "@/lib/locale";

export function Navbar({ locale, path: pathname, query }: { locale: Locale; path: string; query: string }) {
  const t = (text: string) => tr(locale, text);
  const href = (path: string) => localePath(locale, path);
  const alternate = locale === "bn" ? "en" : "bn";
  const [openPath, setOpenPath] = useState<string | null>(null);
  const toggle = useRef<HTMLButtonElement>(null);
  const isOpen = openPath === pathname;
  const close = () => setOpenPath(null);
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-surface"
      onKeyDown={(event) => {
        if (event.key === "Escape" && isOpen) { close(); toggle.current?.focus(); }
      }}>
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-2 focus:z-50 focus:rounded focus:bg-background focus:p-3">{t("Skip to content")}</a>
      <div className="container-x flex min-h-16 items-center justify-between gap-3 py-2">
        <Link href={href("/")} className="flex min-w-0 items-center gap-2 text-sm font-semibold" aria-label={locale === "bn" ? siteConfig.nameBn : siteConfig.name} onClick={close}>
          <GraduationCap className="h-6 w-6 shrink-0 text-primary" aria-hidden="true" />
          <span>IRRI</span>
        </Link>
        <nav className="hidden items-center gap-4 lg:flex" aria-label={t("Primary navigation")}>
          {publicNavGroups.map((group) => (
            <details key={group.label} name="public-navigation" className="relative">
              <summary className="flex cursor-pointer list-none items-center gap-1 rounded px-2 py-2 text-sm font-medium">
                {t(group.label)}<ChevronDown className="h-4 w-4" aria-hidden="true" />
              </summary>
              <ul className="absolute left-0 top-full z-10 grid w-52 gap-1 rounded-md border bg-surface p-2 shadow-soft">
                {group.links.map((item) => <li key={item.href}>
                  <Link href={href(item.href)} aria-current={pathname === item.href ? "page" : undefined} className="block rounded px-2 py-2 text-sm hover:bg-secondary"
                    onClick={(event) => { const details = event.currentTarget.closest("details"); if (details) details.open = false; }}>{t(item.label)}</Link>
                </li>)}
              </ul>
            </details>
          ))}
        </nav>
        <div className="flex shrink-0 gap-2">
          <Button variant="ghost" size="sm" asChild><Link href={href("/search")} aria-label={t("Search")} title={t("Search")} onClick={close}><Search className="h-5 w-5" aria-hidden="true" /></Link></Button>
          <Button variant="outline" size="sm" asChild><a href={localePath(alternate, pathname) + query} hrefLang={alternate} lang={alternate}>{alternate === "bn" ? "বাংলা" : "English"}</a></Button>
          <Button ref={toggle} variant="ghost" size="sm" className="lg:hidden" type="button"
            aria-label={t(isOpen ? "Close menu" : "Open menu")} aria-expanded={isOpen} aria-controls="mobile-navigation"
            onClick={() => setOpenPath(isOpen ? null : pathname)}>
            {isOpen ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
          </Button>
        </div>
      </div>
      <nav id="mobile-navigation" aria-label={t("Mobile navigation")}
        className={isOpen ? "max-h-[75dvh] overflow-y-auto border-t bg-surface px-5 py-4 lg:hidden" : "hidden"}>
        <div className="container-x grid gap-4 sm:grid-cols-2">
          {publicNavGroups.map((group) => <div key={group.label}>
            <p className="text-sm font-semibold">{t(group.label)}</p>
            <ul className="mt-1 grid gap-1">{group.links.map((item) => <li key={item.href}>
              <Link href={href(item.href)} onClick={close} aria-current={pathname === item.href ? "page" : undefined}
                className="block rounded px-2 py-2 text-sm hover:bg-secondary">{t(item.label)}</Link>
            </li>)}</ul>
          </div>)}
        </div>
      </nav>
    </header>
  );
}
