"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, BookOpen, Inbox, LayoutDashboard, Shield } from "lucide-react";
import { adminNav } from "@/config/nav";
import { cn } from "@/lib/utils";

const groups = [
  { title: "Overview", icon: LayoutDashboard, items: ["dashboard", "profile", "institution"] },
  { title: "Content", icon: BookOpen, items: ["pages", "administration", "departments", "programs", "courses", "news", "notices", "events", "gallery", "categories", "publications", "media"] },
  { title: "Communication", icon: Inbox, items: ["contact-messages"] },
  { title: "System", icon: Shield, items: ["audit-logs", "users", "settings"] }
];

function findNav(segment: string) {
  return adminNav.find((item) => item.href.endsWith(`/${segment}`));
}

export function AdminSidebar({ role, className, onNavigate }: { role: string; className?: string; onNavigate?: () => void }) {
  const pathname = usePathname();
  const admin = role === "ADMIN" || role === "SUPER_ADMIN";

  return (
    <aside className={cn("flex min-h-screen w-64 shrink-0 flex-col bg-sidebar text-sidebar-foreground", className)}>
      <div className="flex h-16 items-center gap-3 border-b border-sidebar-foreground/10 px-4">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-brand shadow-soft">
          <BarChart3 className="h-5 w-5" strokeWidth={2} />
        </span>
        <div>
          <p className="text-sm font-semibold">IRRI Admin</p>
          <p className="text-xs text-sidebar-foreground/55">CMS Dashboard</p>
        </div>
      </div>
      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-5">
        {groups.filter((group) => (group.title !== "System" || admin) && (group.title !== "Communication" || role !== "EDITOR")).map((group) => (
          <div key={group.title}>
            <p className="mb-2 flex items-center gap-2 px-3 text-[11px] font-semibold uppercase tracking-widest text-sidebar-foreground/45">
              <group.icon className="h-4 w-4" strokeWidth={2} /> {group.title}
            </p>
            <div className="grid gap-1">
              {group.items.filter((segment) => segment !== "institution" || admin).map((segment) => {
                const item = findNav(segment);
                if (!item) return null;
                const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onNavigate}
                    className={active ? "rounded-lg bg-gradient-brand px-3 py-2 text-sm font-medium text-primary-foreground shadow-soft" : "rounded-lg px-3 py-2 text-sm font-medium text-sidebar-foreground/70 transition-colors hover:bg-sidebar-foreground/10 hover:text-sidebar-foreground"}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
}
