import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { tutorialeBySlug, tutoriale } from "@/lib/tutoriale/data";
import { getArticol } from "@/lib/articole.functions";
import { QuestionContent } from "@/components/QuestionContent";
import { SubiectRezolvatView } from "@/components/SubiectRezolvatView";
import { subiecteBySlug } from "@/lib/tutoriale/subiecte";
import { letter, type SubiectRezolvat, type IntrebareRezolvata } from "@/lib/subiect-rezolvat";

const BASE = "https://grileadmitere.ro";
const plain = (t: string) => t.replace(/```[\s\S]*?```/g, " [cod] ").replace(/[$*`#]/g, "").replace(/\s+/g, " ").trim();

function subiectHead(s: SubiectRezolvat) {
  const url = `${BASE}/tutoriale/${s.slug}`;
  return {
    meta: [
      { title: `${s.title} | grileadmitere.ro` },
      { name: "description", content: s.description },
      { name: "keywords", content: s.keywords },
      { property: "og:title", content: s.title },
      { property: "og:description", content: s.description },
      { property: "og:type", content: "article" },
      { property: "og:url", content: url },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: s.title },
      { name: "twitter:description", content: s.description },
      ...(s.published_at ? [{ property: "article:published_time", content: s.published_at }] : []),
    ],
    links: [{ rel: "canonical", href: url }],
    scripts: [
      { type: "application/ld+json", children: JSON.stringify({
        "@context": "https://schema.org", "@type": "Article", headline: s.title, description: s.description,
        inLanguage: "ro-RO", about: s.materie, keywords: s.keywords, mainEntityOfPage: url,
        author: { "@type": "Organization", name: "grileadmitere.ro" },
        publisher: { "@type": "Organization", name: "grileadmitere.ro", logo: { "@type": "ImageObject", url: `${BASE}/logo.png` } },
        ...(s.published_at ? { datePublished: s.published_at, dateModified: s.published_at } : {}),
      }) },
      { type: "application/ld+json", children: JSON.stringify({
        "@context": "https://schema.org", "@type": "FAQPage",
        mainEntity: s.intrebari.map((q, i) => ({
          "@type": "Question", name: `Întrebarea ${i + 1}: ${plain(q.enunt)}`,
          acceptedAnswer: { "@type": "Answer", text: `Răspuns corect: ${letter(q.corect)}) ${plain(q.variante[q.corect])}. ${plain(q.rezolvare)} ${plain(q.de_ce)}` },
        })),
      }) },
      { type: "application/ld+json", children: JSON.stringify({
        "@context": "https://schema.org", "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Acasă", item: `${BASE}/` },
          { "@type": "ListItem", position: 2, name: "Tutoriale", item: `${BASE}/tutoriale` },
          { "@type": "ListItem", position: 3, name: s.title, item: url },
        ],
      }) },
    ],
  };
}

export const Route = createFileRoute("/tutoriale/$slug")({
  loader: async ({ params }) => {
    const st = subiecteBySlug.get(params.slug);
    if (st) return { kind: "subiect" as const, subiect: st };
    const t = tutorialeBySlug.get(params.slug);
    if (t) return { kind: "ghid" as const, ...t, content_md: null as string | null, published_at: null as string | null };
    const a = await getArticol({ data: { slug: params.slug } });
    if (!a) throw notFound();
    if (Array.isArray(a.intrebari) && a.intrebari.length) {
      return { kind: "subiect" as const, subiect: { slug: a.slug, title: a.title, description: a.description, materie: a.materie, keywords: a.keywords, intro: a.content_md || a.description, subject_slug: a.subject_slug, published_at: a.published_at, intrebari: a.intrebari as IntrebareRezolvata[] } satisfies SubiectRezolvat };
    }
    return { kind: "ghid" as const, slug: a.slug, title: a.title, materie: a.materie, keywords: a.keywords, intro: a.description, body: "", content_md: a.content_md, published_at: a.published_at };
  },
  head: ({ params, loaderData }) => {
    if (!loaderData) return { meta: [{ title: "Tutorial indisponibil — grileadmitere.ro" }, { name: "robots", content: "noindex" }] };
    if (loaderData.kind === "subiect") return subiectHead(loaderData.subiect);
    const t = loaderData;
    const url = `https://grileadmitere.ro/tutoriale/${params.slug}`;
    const raw = t.content_md ? t.intro : `${t.intro} Subiecte cheie: ${t.keywords}.`;
    const desc = raw.length <= 158 ? raw : raw.slice(0, 155).replace(/\s+\S*$/, "") + "…";
    return {
      meta: [
        { title: `${t.title} — Tutorial ${t.materie} | grileadmitere.ro` },
        { name: "description", content: desc },
        { name: "twitter:title", content: t.title },
        { name: "twitter:description", content: desc },
        { name: "keywords", content: `${t.keywords}, ${t.materie}, admitere 2026, BAC, tutorial, grile` },
        { property: "og:title", content: t.title },
        { property: "og:description", content: desc },
        ...(t.published_at ? [{ property: "article:published_time", content: t.published_at }] : []),
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary_large_image" },
        { property: "og:url", content: url },
        { name: "article:section", content: t.materie },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: t.title,
            description: desc,
            about: t.materie,
            keywords: t.keywords,
            inLanguage: "ro-RO",
            author: { "@type": "Organization", name: "grileadmitere.ro" },
            publisher: { "@type": "Organization", name: "grileadmitere.ro" },
            mainEntityOfPage: url,
            ...(t.published_at ? { datePublished: t.published_at, dateModified: t.published_at } : {}),
            articleSection: t.materie,
          }),
        },
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Acasă", item: "https://grileadmitere.ro/" },
              { "@type": "ListItem", position: 2, name: "Tutoriale", item: "https://grileadmitere.ro/tutoriale" },
              { "@type": "ListItem", position: 3, name: t.title, item: url },
            ],
          }),
        },
      ],
    };
  },
  notFoundComponent: () => (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto max-w-2xl px-4 py-16 text-center">
        <h1 className="text-3xl font-bold">Tutorial inexistent</h1>
        <p className="mt-3 text-muted-foreground">Tutorialul cerut nu a fost găsit.</p>
        <Link to="/tutoriale" className="mt-6 inline-block underline">Înapoi la lista de tutoriale</Link>
      </main>
    </div>
  ),
  errorComponent: ({ error, reset }) => (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto max-w-2xl px-4 py-16">
        <h1 className="text-2xl font-bold">A apărut o eroare</h1>
        <p className="mt-2 text-muted-foreground">{(error as Error).message}</p>
        <button onClick={reset} className="mt-4 underline">Încearcă din nou</button>
      </main>
    </div>
  ),
  component: TutorialPage,
});

function TutorialPage() {
  const data = Route.useLoaderData();
  if (data.kind === "subiect") {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto max-w-3xl px-4 py-10">
          <nav aria-label="Breadcrumb" className="mb-4 text-sm text-muted-foreground">
            <Link to="/" className="hover:underline">Acasă</Link> /{" "}
            <Link to="/tutoriale" className="hover:underline">Tutoriale</Link> /{" "}
            <span>{data.subiect.materie}</span>
          </nav>
          <SubiectRezolvatView s={data.subiect} />
        </main>
      </div>
    );
  }
  return <GhidPage t={data} />;
}

function GhidPage({ t }: { t: Extract<ReturnType<typeof Route.useLoaderData>, { kind: "ghid" }> }) {
  const related = tutoriale.filter(x => x.materie === t.materie && x.slug !== t.slug).slice(0, 6);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto max-w-3xl px-4 py-10">
        <nav aria-label="Breadcrumb" className="mb-4 text-sm text-muted-foreground">
          <Link to="/" className="hover:underline">Acasă</Link> /{" "}
          <Link to="/tutoriale" className="hover:underline">Tutoriale</Link> /{" "}
          <span>{t.materie}</span>
        </nav>

        <article className="prose dark:prose-invert max-w-none">
          <p className="text-sm uppercase tracking-wide text-primary mb-2 not-prose">{t.materie}</p>
          <h1>{t.title}</h1>
          <p className="lead text-lg text-muted-foreground">{t.intro}</p>

          {t.content_md ? (
            <div className="not-prose-fix"><QuestionContent text={t.content_md} /></div>
          ) : (
            <>
          <h2>Ce trebuie să știi</h2>
          <p>{t.body}</p>

          <h2>Subiecte conexe la admitere</h2>
          <p>
            Acest tutorial acoperă noțiunile cheie: <strong>{t.keywords}</strong>. Toate apar frecvent
            în grilele de admitere la universitățile din România și în subiectele de BAC din ultimii ani.
          </p>

          <h2>Cum exersezi după ce ai citit</h2>
          <ol>
            <li>Notează formulele/definițiile cu mâna — fixarea e mai bună decât simpla recitire.</li>
            <li>Rezolvă 10–20 de grile pe acest subiect la <Link to="/grile">grile online</Link>.</li>
            <li>Marchează grilele greșite și revino peste 2-3 zile (repetiție spațiată).</li>
            <li>Dă o simulare cronometrată după ce ai parcurs 3-5 tutoriale înrudite.</li>
          </ol>

          <h2>Întrebări frecvente</h2>
          <h3>Este suficient acest tutorial pentru admitere?</h3>
          <p>Tutorialul îți dă scheletul. Pentru admitere, completează cu manualul oficial și sute de grile rezolvate pe materie.</p>
          <h3>Pot folosi tutorialul și pentru BAC?</h3>
          <p>Da. Conținutul respectă programa școlară și se suprapune larg cu programa de bacalaureat.</p>
            </>
          )}
        </article>

        {related.length > 0 && (
          <aside className="mt-12">
            <h2 className="text-xl font-semibold">Alte tutoriale de {t.materie}</h2>
            <ul className="mt-4 grid sm:grid-cols-2 gap-3">
              {related.map(r => (
                <li key={r.slug}>
                  <Link to="/tutoriale/$slug" params={{ slug: r.slug }} className="block p-3 rounded-md border hover:border-primary">
                    {r.title}
                  </Link>
                </li>
              ))}
            </ul>
          </aside>
        )}

        <div className="mt-10 p-4 rounded-md bg-muted/40 text-sm">
          Pregătire completă: combină tutorialele cu <Link to="/grile" className="underline">grilele de admitere</Link>, <Link to="/simulare" className="underline">simulările cronometrate</Link> și <Link to="/subiecte-bac" className="underline">subiectele BAC din anii trecuți</Link>.
        </div>
      </main>
    </div>
  );
}