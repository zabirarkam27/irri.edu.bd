import { Badge } from "@/components/ui/badge";

export function StatusBadge({ status }: { status: string }) {
  const label = status.toUpperCase();
  const className =
    label === "PUBLISHED"
      ? "bg-success/15 text-success"
      : label === "ARCHIVED"
        ? "bg-muted text-muted-foreground"
        : "bg-secondary text-muted-foreground";

  return <Badge className={className}>{label}</Badge>;
}
