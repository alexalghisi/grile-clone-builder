import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { tutorialeBySlug, tutoriale } from "@/lib/tutoriale/data";

export const Route = createFileRoute("/tutoriale/$slug")({
  loader: ({ params }) => {
    const t = tutorialeBySlug.get(params.slug);
    if (!t) throw notFound();
    return t;
  },
  head: ({ params, loaderData }) => {
    const t = loaderData;
    if (!t) return { meta: [{ title: "Tutorial — grileadmitere.ro" }] };
    const url = `https://grileadmitere.ro/tutoriale/${params.slug}`;
    const desc = `${t.intro} Subiecte cheie: ${t.keywords}.`;
    return {
      meta: [
        { title: `${t.title} — Tutorial ${t.materie} | grileadmitere.ro` },
        { name: "description", content: desc.slice(0, 158) },
        { name: "keywords", content: `${t.keywords}, ${t.materie}, admitere 2026, BAC, tutorial, grile` },
        { property: "og:title", content: t.title },
        { property: "og:description", content: desc.slice(0, 158) },
        { property: "og:type", content: "article" },
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
        <p className="mt-2 text-muted-foreground">{error.message}</p>
        <button onClick={reset} className="mt-4 underline">Încearcă din nou</button>
      </main>
    </div>
  ),
  component: TutorialPage,
});

function TutorialPage() {
  const t = Route.useLoaderData();
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