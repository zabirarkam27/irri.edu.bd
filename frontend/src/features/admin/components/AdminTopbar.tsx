import Link from "next/link";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AdminTopbar({ account, onMenuClick }: { account: { name: string; role: string }; onMenuClick?: () => void }) {
  return (
    <header className="sticky top-0 z-40 flex min-h-16 items-center justify-between gap-4 border-b border-border bg-surface px-4 py-2 sm:px-6 lg:px-8">
      <div className="flex min-w-0 items-center gap-3">
        <Button variant="ghost" size="sm" className="lg:hidden" aria-label="Open admin menu" onClick={onMenuClick}>
          <Menu className="h-4 w-4" />
        </Button>
        <Link href="/admin/profile" className="min-w-0 break-words text-sm font-semibold">{account.name}</Link>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        <span className="hidden text-xs text-muted-foreground sm:inline">{account.role.replaceAll("_", " ")}</span>
        <Button variant="outline" size="sm" asChild><Link href="/">View site</Link></Button>
      </div>
    </header>
  );
}
