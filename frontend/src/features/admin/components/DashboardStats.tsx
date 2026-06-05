import { ArrowUpRight, BookOpen, CalendarDays, Image, Newspaper } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const stats = [
  { label: "Published Pages", value: "14", icon: BookOpen },
  { label: "News Posts", value: "3", icon: Newspaper },
  { label: "Events", value: "2", icon: CalendarDays },
  { label: "Media Assets", value: "12", icon: Image }
];

export function DashboardStats() {
  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.label}>
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <p className="mt-2 font-display text-3xl font-semibold tracking-[-0.02em] text-foreground">{stat.value}</p>
              <p className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-success"><ArrowUpRight className="h-3.5 w-3.5" /> +12% this month</p>
            </div>
            <span className="grid h-11 w-11 place-items-center rounded-lg bg-secondary text-primary">
              <stat.icon className="h-5 w-5" strokeWidth={2} />
            </span>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
