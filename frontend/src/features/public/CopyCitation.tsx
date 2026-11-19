"use client";

import { useState } from "react";
import { Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { tr, type Locale } from "@/lib/locale";

export function CopyCitation({ value, locale }: { value: string; locale: Locale }) {
  const [message, setMessage] = useState("");
  return <div className="flex flex-wrap items-center gap-3">
    <Button type="button" size="sm" variant="outline" onClick={async () => {
      try {
        await navigator.clipboard.writeText(value);
        setMessage(tr(locale, "Citation copied."));
      } catch {
        setMessage(tr(locale, "Could not copy citation."));
      }
    }}><Copy aria-hidden="true" />{tr(locale, "Copy citation")}</Button>
    <span role="status" className="text-sm text-muted-foreground">{message}</span>
  </div>;
}
