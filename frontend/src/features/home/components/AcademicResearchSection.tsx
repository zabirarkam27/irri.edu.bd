import { Archive, BookOpen, GraduationCap, Library, Music, PenTool, ScrollText, Search, Users } from "lucide-react";
import { SectionHeader } from "@/components/shared/SectionHeader";

const focus = [
  { label: "Tagore literature", icon: BookOpen },
  { label: "Rabindra Sangeet", icon: Music },
  { label: "Cultural history", icon: Library },
  { label: "Humanistic philosophy", icon: Users },
  { label: "Archive documentation", icon: Archive },
  { label: "Bengali studies", icon: ScrollText },
  { label: "Research methods", icon: Search },
  { label: "Academic writing", icon: PenTool },
  { label: "Degree pathways", icon: GraduationCap }
];

export function AcademicResearchSection() {
  return (
    <section className="bg-background">
      <div className="container-x py-16 md:py-20 lg:py-24">
        <SectionHeader eyebrow="Academics" title="Academic and research focus" />
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {focus.map((item) => (
            <div key={item.label} className="rounded-xl border border-border bg-card p-6 shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lifted">
              <span className="grid h-11 w-11 place-items-center rounded-lg bg-secondary text-primary">
                <item.icon className="h-5 w-5" strokeWidth={2} />
              </span>
              <h3 className="mt-5 text-lg font-semibold text-foreground">{item.label}</h3>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
