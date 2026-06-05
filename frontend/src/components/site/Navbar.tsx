"use client";

import { useState } from "react";
import Link from "next/link";
import { GraduationCap, Menu, X } from "lucide-react";
import { publicNav } from "@/config/nav";
import { siteConfig } from "@/config/site";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-surface/85 backdrop-blur-md">
      <div className="container-x flex h-16 items-center justify-between gap-4">
        <Link
          href="/"
          className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-gradient-brand text-primary-foreground shadow-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          aria-label={siteConfig.name}
          onClick={() => setIsOpen(false)}
        >
          <GraduationCap className="h-5 w-5" strokeWidth={2} />
        </Link>

        <nav className="hidden items-center gap-5 lg:flex" aria-label="Primary navigation">
          {publicNav.slice(0, 8).map((item) => (
            <Link key={item.href} href={item.href} className="text-sm font-medium text-foreground/80 transition-colors hover:text-primary-pressed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background">
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button className="hidden sm:inline-flex" size="sm" asChild>
            <Link href="/academic-programs">Apply Now</Link>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden"
            aria-label={isOpen ? "Close menu" : "Open menu"}
            aria-expanded={isOpen}
            aria-controls="mobile-navigation"
            onClick={() => setIsOpen((value) => !value)}
          >
            {isOpen ? <X className="h-4 w-4" strokeWidth={2} /> : <Menu className="h-4 w-4" strokeWidth={2} />}
          </Button>
        </div>
      </div>
      <div
        id="mobile-navigation"
        className={isOpen ? "border-t border-border bg-surface px-5 py-3 shadow-soft lg:hidden" : "hidden"}
      >
        <nav className="mx-auto grid max-w-[1240px] grid-cols-1 gap-2 sm:grid-cols-2" aria-label="Mobile navigation">
          {publicNav.slice(0, 8).map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-md px-3 py-2 text-sm font-medium text-foreground/80 hover:bg-secondary hover:text-primary-pressed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              onClick={() => setIsOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          <Button className="mt-1 sm:hidden" size="sm" asChild>
            <Link href="/academic-programs" onClick={() => setIsOpen(false)}>
              Apply Now
            </Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}
