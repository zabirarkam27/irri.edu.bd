import Link from "next/link";
import { Bell, ChevronDown, Menu, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AdminTopbar({ onMenuClick }: { onMenuClick?: () => void }) {
  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between gap-4 border-b border-border bg-surface px-4 sm:px-6 lg:px-8">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <Button variant="ghost" size="sm" className="lg:hidden" aria-label="Open admin menu" onClick={onMenuClick}>
          <Menu className="h-4 w-4" strokeWidth={2} />
        </Button>
        <label className="relative hidden max-w-md flex-1 md:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" strokeWidth={2} />
          <input className="h-10 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background" placeholder="Search CMS" />
        </label>
      </div>
      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm" className="hidden sm:inline-flex" asChild>
          <Link href="/">View Site</Link>
        </Button>
        <button className="relative grid h-10 w-10 place-items-center rounded-md border border-border bg-card text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background">
          <Bell className="h-4 w-4" strokeWidth={2} />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-destructive" />
        </button>
        <div className="hidden items-center gap-3 rounded-md border border-border bg-card px-3 py-2 sm:flex">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-gradient-brand text-xs font-semibold text-primary-foreground">SA</span>
          <span>
            <span className="block text-sm font-semibold leading-none text-foreground">Super Admin</span>
            <span className="mt-1 block text-xs text-muted-foreground">Administrator</span>
          </span>
          <ChevronDown className="h-4 w-4 text-muted-foreground" strokeWidth={2} />
        </div>
      </div>
    </header>
  );
}
