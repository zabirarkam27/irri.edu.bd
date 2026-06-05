import Link from "next/link";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";

const contacts = [
  { label: "Address", value: "Patisar, Naogaon", icon: MapPin },
  { label: "Phone", value: "+880 0000 000000", icon: Phone },
  { label: "Email", value: "info@irri.edu.com", icon: Mail },
  { label: "Hours", value: "Sun-Thu, 9 AM-5 PM", icon: Clock }
];

export function ContactCTA() {
  return (
    <section className="bg-background">
      <div className="container-x py-16 md:py-20 lg:py-24">
        <div className="rounded-2xl bg-gradient-brand p-6 text-primary-foreground shadow-lifted md:p-8 lg:p-10">
          <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr] lg:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-primary-foreground/70">Contact IRRI</p>
              <h2 className="mt-3 font-display text-3xl font-semibold tracking-[-0.02em] text-balance md:text-4xl">Connect for research, programs, and collaboration</h2>
              <p className="mt-4 text-sm leading-relaxed text-primary-foreground/80">Send a message about research collaboration, admissions, publications, events, or archive access.</p>
              <Button variant="gold" className="mt-6 w-full sm:w-auto" asChild>
                <Link href="/contact">Contact Us</Link>
              </Button>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {contacts.map((item) => (
                <div key={item.label} className="rounded-xl border border-primary-foreground/15 bg-primary-foreground/10 p-4">
                  <item.icon className="h-5 w-5 text-primary-foreground/75" strokeWidth={2} />
                  <p className="mt-3 text-xs font-semibold uppercase tracking-widest text-primary-foreground/60">{item.label}</p>
                  <p className="mt-1 text-sm font-semibold">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
