import { headers } from "next/headers";
import { cache } from "react";
import type { Locale } from "./locale";

export const requestLocale = cache(async (): Promise<{ locale: Locale; path: string; query: string }> => {
  const requestHeaders = await headers();
  return {
    locale: requestHeaders.get("x-irri-locale") === "bn" ? "bn" : "en",
    path: requestHeaders.get("x-irri-path") ?? "/",
    query: requestHeaders.get("x-irri-query") ?? ""
  };
});
