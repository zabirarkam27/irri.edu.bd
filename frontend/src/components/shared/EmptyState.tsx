import { Archive } from "lucide-react";

export function EmptyState({ title = "No content yet", description }: { title?: string; description?: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-8 text-center shadow-soft">
      <Archive className="mx-auto h-8 w-8 text-muted-foreground" />
      <h3 className="mt-4 text-lg font-semibold">{title}</h3>
      {description ? <p className="mt-2 text-sm text-muted-foreground">{description}</p> : null}
    </div>
  );
}
