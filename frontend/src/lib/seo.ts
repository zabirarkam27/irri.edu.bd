import type { Metadata } from "next";
import { siteConfig } from "@/config/site";
import { localePath, tr, type Locale } from "./locale";

export function createMetadata(title: string, description = siteConfig.description, path = "/", locale: Locale = "en", bilingual = true): Metadata {
  const brand = locale === "bn" ? siteConfig.nameBn : siteConfig.name;
  const pageTitle = title === brand ? title : `${title} | ${brand}`;
  const url = new URL(localePath(locale, path), siteConfig.url).href;
  const image = new URL("/opengraph-image", siteConfig.url).href;

  return {
    title: pageTitle,
    description,
    alternates: { canonical: url, ...(bilingual ? { languages: {
      en: new URL(path, siteConfig.url).href, bn: new URL(localePath("bn", path), siteConfig.url).href
    } } : {}) },
    openGraph: {
      title: pageTitle,
      description,
      url,
      siteName: brand,
      locale: locale === "bn" ? "bn_BD" : "en",
      type: "website",
      images: [{ url: image, width: 1200, height: 630, alt: siteConfig.name }]
    },
    twitter: {
      card: "summary_large_image",
      title: pageTitle,
      description,
      images: [image]
    }
  };
}

export function publicMetadata(title: string, description: string, path: string, locale: Locale) {
  const name = tr(locale, title);
  return createMetadata(name, locale === "bn" ? `${name} · ${siteConfig.nameBn}` : description, path, locale);
}
