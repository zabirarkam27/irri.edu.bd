import { BookOpen, CalendarCheck, GraduationCap, Landmark, MapPin, ScrollText } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { institution } from "@/features/home/data";

const items = [
  { icon: Landmark, label: "English Name", value: institution.name },
  { icon: ScrollText, label: "Bengali Name", value: institution.nameBn, bn: true },
  { icon: MapPin, label: "Location", value: institution.location },
  { icon: CalendarCheck, label: "Established", value: institution.established },
  { icon: GraduationCap, label: "Operations Started", value: institution.approved },
  { icon: BookOpen, label: "Motto", value: institution.motto }
];

export function InstituteGlance() {
  return (
    <section className="bg-background">
      <div className="container-x py-16 md:py-20 lg:py-24">
        <SectionHeader eyebrow="Institute at a Glance" title="A research institute shaped by culture, memory, and scholarship" />
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <Card key={item.label}>
              <CardContent className="p-6">
                <span className="grid h-11 w-11 place-items-center rounded-lg bg-secondary text-primary">
                  <item.icon className="h-5 w-5" strokeWidth={2} />
                </span>
                <p className="mt-5 text-xs font-semibold uppercase tracking-widest text-muted-foreground">{item.label}</p>
                <p lang={item.bn ? "bn" : undefined} className={item.bn ? "mt-2 font-bn text-lg font-semibold leading-relaxed text-foreground" : "mt-2 text-base font-semibold leading-relaxed text-foreground"}>
                  {item.value}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
