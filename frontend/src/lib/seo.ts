import type { Metadata } from "next";
import { siteConfig } from "@/config/site";

export function createMetadata(title: string, description = siteConfig.description): Metadata {
  const pageTitle = title === siteConfig.name ? title : `${title} | ${siteConfig.name}`;

  return {
    title: pageTitle,
    description,
    alternates: { canonical: siteConfig.url },
    openGraph: {
      title: pageTitle,
      description,
      url: siteConfig.url,
      siteName: siteConfig.name,
      type: "website"
    },
    twitter: {
      card: "summary_large_image",
      title: pageTitle,
      description
    }
  };
}
