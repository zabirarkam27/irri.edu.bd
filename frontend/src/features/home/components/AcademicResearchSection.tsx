import Link from "next/link";
import { newsRequest } from "@/features/news/data";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { requestLocale } from "@/lib/request-locale";
import { localePath, localized, tr } from "@/lib/locale";

type Preview = { id: string; slug: string; title: string; titleBn?: string; excerpt?: string; contentBn?: string; abstract?: string; description?: string };

export async function AcademicResearchSection() {
  const get = <T,>(path: string) => newsRequest<T>(path).then(({ data }) => data).catch(() => null);
  const [about, research, programs, publications, { locale }] = await Promise.all([
    get<Preview>("/pages/about"), get<Preview>("/pages/research"),
    get<Preview[]>("/programs?limit=3"), get<Preview[]>("/publications?limit=3"), requestLocale()
  ]);
  return (
    <section className="container-x grid gap-10 py-12">
      {about && <div className="max-w-3xl">
        <SectionHeader title={localized(locale, about.title, about.titleBn).text} href="/about" />
        {about.excerpt && <p lang="en" className="mt-3 break-words text-muted-foreground">{about.excerpt}</p>}
      </div>}
      <div className="grid gap-8 lg:grid-cols-2">
        <PreviewList title="Academic programs" href="/academic-programs" entries={programs} />
        <PreviewList title="Publications" href="/publications" entries={publications} />
      </div>
      {research && <div className="max-w-3xl">
        <SectionHeader title={localized(locale, research.title, research.titleBn).text} href="/research" />
        {research.excerpt && <p lang="en" className="mt-3 break-words text-muted-foreground">{research.excerpt}</p>}
      </div>}
    </section>
  );
}

async function PreviewList({ title, href, entries }: { title: string; href: string; entries: Preview[] | null }) {
  const { locale } = await requestLocale();
  return <div>
    <SectionHeader title={title} href={href} />
    {!entries ? <p role="alert" className="mt-3 text-muted-foreground">{tr(locale, "This content is temporarily unavailable.")}</p> :
      entries.length ? <ul className="mt-3 divide-y border-y">
        {entries.map((entry) => {
          const caption = localized(locale, entry.title, entry.titleBn);
          return <li key={entry.id} className="py-3">
          <Link lang={caption.lang} className="break-words font-semibold underline" href={localePath(locale, `${href}/${encodeURIComponent(entry.slug)}`)}>{caption.text}</Link>
          {(entry.description || entry.abstract) && <p lang="en" className="mt-1 line-clamp-2 break-words text-sm text-muted-foreground">{entry.description || entry.abstract}</p>}
        </li>; })}
      </ul> : <p className="mt-3 text-muted-foreground">{tr(locale, "No published records.")}</p>}
  </div>;
}
