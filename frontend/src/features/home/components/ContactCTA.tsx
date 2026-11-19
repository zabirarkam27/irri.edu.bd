import Link from "next/link";
import { MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { loadInstitution } from "@/features/home/institution";
import { requestLocale } from "@/lib/request-locale";
import { localePath, tr } from "@/lib/locale";

export async function ContactCTA() {
  const [institution, { locale }] = await Promise.all([loadInstitution(), requestLocale()]);
  const contacts = institution.location ? [{ label: "Address", value: institution.location, icon: MapPin }] : [];
  return (
    <section className="bg-background">
      <div className="container-x py-16 md:py-20 lg:py-24">
        <div className="rounded-2xl bg-gradient-brand p-6 text-primary-foreground shadow-lifted md:p-8 lg:p-10">
          <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr] lg:items-center">
            <div>
              <h2 className="font-display text-3xl font-semibold text-balance md:text-4xl">{tr(locale, "Contact IRRI")}</h2>
              <Button variant="gold" className="mt-6 w-full sm:w-auto" asChild>
                <Link href={localePath(locale, "/contact")}>{tr(locale, "Contact Us")}</Link>
              </Button>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {contacts.map((item) => (
                <div key={item.label} className="rounded-xl border border-primary-foreground/15 bg-primary-foreground/10 p-4">
                  <item.icon className="h-5 w-5 text-primary-foreground/75" strokeWidth={2} />
                  <p className="mt-3 text-xs font-semibold text-primary-foreground/90">{tr(locale, item.label)}</p>
                  <p lang="en" className="mt-1 text-sm font-semibold">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
