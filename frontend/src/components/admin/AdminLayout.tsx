"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { AdminSidebar } from "@/features/admin/components/AdminSidebar";
import { AdminTopbar } from "@/features/admin/components/AdminTopbar";
import { Button } from "@/components/ui/button";

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar className="hidden lg:flex" />
      {isOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-foreground/40"
            aria-label="Close admin menu"
            onClick={() => setIsOpen(false)}
          />
          <div className="relative h-full w-[min(20rem,calc(100vw-2rem))] shadow-lifted">
            <AdminSidebar className="h-full w-full" onNavigate={() => setIsOpen(false)} />
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-3 top-3 text-sidebar-foreground hover:bg-sidebar-foreground/10 hover:text-sidebar-foreground"
              aria-label="Close admin menu"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-4 w-4" strokeWidth={2} />
            </Button>
          </div>
        </div>
      ) : null}
      <div className="min-w-0 flex-1">
        <AdminTopbar onMenuClick={() => setIsOpen(true)} />
        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
