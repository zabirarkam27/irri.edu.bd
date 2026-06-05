import Link from "next/link";
import { PageHero } from "@/components/shared/PageHero";
import { SiteFooter } from "@/components/shared/SiteFooter";
import { SiteHeader } from "@/components/shared/SiteHeader";
import { Container } from "@/components/shared/Container";
import { EmptyState } from "@/components/shared/EmptyState";
import { leaders, news, notices, events } from "@/features/home/data";
import { ArrowUpRight, CalendarDays, UserRound } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const copy: Record<string, { title: string; description: string; body: string }> = {
  about: {
    title: "About",
    description: "An academic institute dedicated to Rabindranath Tagore's thought, literature, music, philosophy, and cultural legacy.",
    body: "IRRI is a research-centered institution based in Patisar, Atrai, Naogaon. The website is CMS-ready so institute teams can publish bilingual pages, academic updates, notices, events, galleries, and publications."
  },
  history: {
    title: "History",
    description: "From private research institute foundation in 2014 to approved operations beginning in 2018.",
    body: "The institute carries the cultural memory of Patisar and the wider Rabindra tradition into a modern academic platform for scholars and students."
  },
  "mission-vision": {
    title: "Mission & Vision",
    description: "Excellence through practicing our own history and culture.",
    body: "The mission and vision guide teaching, research, documentation, and cultural practice across Honors, Masters, PhD, and independent scholarly pathways."
  },
  "academic-programs": {
    title: "Academic Programs",
    description: "Programs for researchers and students focused on literature, music, history, culture, and humanistic values.",
    body: "Program records are modeled in the backend with SEO, status, department, duration, and bilingual descriptions."
  },
  courses: {
    title: "Courses",
    description: "Course offerings for Rabindra studies, culture, archive work, and interdisciplinary humanities.",
    body: "Course records support codes, credits, descriptions, instructors, and program relationships."
  },
  research: {
    title: "Research",
    description: "Research in Tagore studies, Bengali literature, cultural heritage, music, philosophy, and archive documentation.",
    body: "The CMS is structured to publish research groups, publications, events, and archival media over time."
  },
  gallery: {
    title: "Gallery",
    description: "Images from academic, cultural, and archival activities.",
    body: "Media upload and gallery album models support captions, alt text, ordering, and publication status."
  },
  publications: {
    title: "Publications",
    description: "Journals, papers, reports, and research publications from IRRI.",
    body: "Publication records support abstracts, authors, files, publication dates, status, and SEO metadata."
  },
  news: {
    title: "News",
    description: "Latest academic and institutional updates from IRRI.",
    body: "Published news posts will appear here with searchable, paginated CMS data."
  },
  notices: {
    title: "Notices",
    description: "Official notices, admissions updates, library information, and institute announcements.",
    body: "Published notices will appear here with status and publication date filtering."
  },
  events: {
    title: "Events",
    description: "Academic, cultural, and research events hosted by IRRI.",
    body: "Published events will appear here with dates, venues, and details."
  },
  contact: {
    title: "Contact",
    description: "Reach IRRI for research, admissions, publications, events, and collaboration.",
    body: "Use the contact form to send a message. Submissions are validated and stored by the backend contact API."
  }
};

export function PublicPage({ slug }: { slug: string }) {
  const page = copy[slug] ?? copy.about;
  const publications = [
    { title: "Journal of Rabindra Research, Volume 1", slug: "journal-of-rabindra-research-volume-1", date: "2026-01-01" }
  ];
  return (
    <>
      <SiteHeader />
      <main>
        <PageHero title={page.title} description={page.description} />
        <Container className="py-16 md:py-20">
          {slug === "administration" ? (
            <Administration />
          ) : slug === "news" ? (
            <Listing base="/news" items={news} />
          ) : slug === "notices" ? (
            <Listing base="/notices" items={notices} />
          ) : slug === "events" ? (
            <Listing base="/events" items={events} />
          ) : slug === "publications" ? (
            <Listing base="/publications" items={publications} />
          ) : (
            <Content body={page.body} />
          )}
        </Container>
      </main>
      <SiteFooter />
    </>
  );
}

function Content({ body }: { body: string }) {
  return (
    <div className="max-w-3xl rounded-2xl border border-border bg-card p-6 text-base leading-8 text-muted-foreground shadow-soft md:p-8">
      {body}
    </div>
  );
}

function Administration() {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {leaders.map((leader) => (
        <Card key={leader.name}>
          <CardContent className="p-6">
            <div className="mb-5 grid h-12 w-12 place-items-center rounded-full bg-gradient-brand text-sm font-semibold text-primary-foreground">
              {leader.name
                .split(" ")
                .map((part) => part[0])
                .join("")
                .slice(0, 2)}
            </div>
            <p className="font-display text-xl font-semibold tracking-[-0.02em] text-foreground">{leader.name}</p>
            <p className="mt-1 text-sm text-primary">{leader.designation}</p>
            <p className="mt-3 text-sm text-muted-foreground">{leader.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function Listing({ base, items }: { base: string; items: typeof news }) {
  if (!items.length) return <EmptyState description="Published content will appear here." />;
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <Card key={item.slug}>
          <CardContent className="p-6">
            <div className="mb-5 grid h-11 w-11 place-items-center rounded-lg bg-secondary text-primary">
              {base === "/events" ? <CalendarDays className="h-5 w-5" /> : <UserRound className="h-5 w-5" />}
            </div>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{item.date}</p>
            <Link
              href={`${base}/${item.slug}`}
              className="group mt-3 flex items-start justify-between gap-4 font-display text-xl font-semibold tracking-[-0.02em] text-foreground transition hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <span>{item.title}</span>
              <ArrowUpRight className="mt-1 h-4 w-4 shrink-0 text-primary transition group-hover:text-primary-pressed" />
            </Link>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
