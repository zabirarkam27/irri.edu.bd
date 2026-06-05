import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { publicNav } from "@/config/nav";
import { siteConfig } from "@/config/site";

const groups = [
  { title: "Explore", links: publicNav.slice(1, 6) },
  { title: "Academics", links: publicNav.slice(6, 10) },
  { title: "Updates", links: publicNav.slice(10, 14) }
];

export function Footer() {
  return (
    <footer className="border-t border-border bg-sidebar text-sidebar-foreground">
      <div className="container-x grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="font-display text-xl font-semibold tracking-[-0.02em]">{siteConfig.name}</p>
          <p lang="bn" className="mt-2 font-bn text-sm text-sidebar-foreground/75">{siteConfig.nameBn}</p>
          <p className="mt-5 text-sm leading-relaxed text-sidebar-foreground/70">{siteConfig.location}</p>
        </div>
        {groups.map((group) => (
          <div key={group.title}>
            <p className="text-xs font-semibold uppercase tracking-widest text-sidebar-foreground/60">{group.title}</p>
            <ul className="mt-4 grid gap-3">
              {group.links.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-sm text-sidebar-foreground/75 transition-colors hover:text-primary-foreground">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-sidebar-foreground/60">Contact</p>
          <ul className="mt-4 grid gap-3 text-sm text-sidebar-foreground/75">
            <li className="flex gap-2"><MapPin className="mt-0.5 h-4 w-4" /> Patisar, Naogaon</li>
            <li className="flex gap-2"><Phone className="mt-0.5 h-4 w-4" /> +880 0000 000000</li>
            <li className="flex gap-2"><Mail className="mt-0.5 h-4 w-4" /> info@irri.edu.com</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-sidebar-foreground/10">
        <div className="container-x flex flex-col gap-2 py-5 text-xs text-sidebar-foreground/60 sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} {siteConfig.acronym}. All rights reserved.</span>
          <span>Academic research, culture, and documentation.</span>
        </div>
      </div>
    </footer>
  );
}
