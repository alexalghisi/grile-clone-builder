import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AdLeaderboard, AdSlot } from "@/components/AdSlot";
import { PROFESORI_MATERII } from "@/lib/profesori/data";

export const Route = createFileRoute("/profesori/$materie")({
  loader: ({ params }) => {
    const m = PROFESORI_MATERII.find((x) => x.slug === params.materie);
    if (!m) throw notFound();
    return m;
  },
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [] };
    const m = loaderData;
    const title = `Profesori ${m.nume} 2026 — Meditații + Grile ${m.nume} Rezolvate`;
    const description = `${m.profesori[0].toUpperCase() + m.profesori.slice(1)} pentru admitere și BAC 2026. Grile ${m.nume.toLowerCase()} rezolvate pas cu pas de profesori cu experiență. 100% gratuit.`;
    const url = `https://grileadmitere.ro/profesori/${m.slug}`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        {
          name: "keywords",
          content: `profesori ${m.nume.toLowerCase()}, meditatii ${m.nume.toLowerCase()}, profesori ${m.nume.toLowerCase()} online, grile ${m.nume.toLowerCase()}, profesori ${m.nume.toLowerCase()} admitere, profesori ${m.nume.toLowerCase()} BAC, profesor ${m.nume.toLowerCase()}`,
        },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { property: "og:url", content: url },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Service",
            serviceType: `Meditații ${m.nume}`,
            name: `Profesori ${m.nume}`,
            description,
            areaServed: { "@type": "Country", name: "România" },
            provider: { "@type": "Organization", name: "GrileAdmitere.ro", url: "https://grileadmitere.ro" },
            url,
          }),
        },
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Acasă", item: "https://grileadmitere.ro/" },
              { "@type": "ListItem", position: 2, name: "Profesori", item: "https://grileadmitere.ro/profesori" },
              { "@type": "ListItem", position: 3, name: `Profesori ${m.nume}`, item: url },
            ],
          }),
        },
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: m.faq.map((f) => ({
              "@type": "Question",
              name: f.q,
              acceptedAnswer: { "@type": "Answer", text: f.a },
            })),
          }),
        },
      ],
    };
  },
  component: Page,
  notFoundComponent: () => (
    <div className="container mx-auto p-10">
      <h1 className="text-2xl font-bold">Materia nu a fost găsită</h1>
      <Link to="/profesori" className="text-primary underline">Înapoi la profesori</Link>
    </div>
  ),
  errorComponent: ({ error }) => (
    <div className="container mx-auto p-10 text-sm text-destructive">{String(error)}</div>
  ),
});

function Page() {
  const m = Route.useLoaderData();
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-10">
        <nav aria-label="Breadcrumb" className="mb-3 text-xs text-muted-foreground">
          <Link to="/" className="hover:underline">Acasă</Link>
          <span className="mx-1">/</span>
          <Link to="/profesori" className="hover:underline">Profesori</Link>
          <span className="mx-1">/</span>
          <span>{m.nume}</span>
        </nav>

        <header className="max-w-4xl">
          <Badge variant="secondary" className="mb-3">{m.emoji} {m.nume}</Badge>
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
            Profesori {m.nume} 2026 — meditații + grile {m.nume.toLowerCase()} rezolvate
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">{m.intro}</p>
          <p className="mt-3 text-sm text-muted-foreground">
            Cei mai buni <strong>profesori de {m.nume.toLowerCase()}</strong> publică aici <strong>grile de {m.nume.toLowerCase()}</strong> rezolvate
            pas cu pas pentru admitere și BAC 2026. Învață cu profesori verificați și grile reale, complet gratuit.
          </p>
        </header>

        <AdLeaderboard className="my-8" />

        <section>
          <h2 className="text-2xl font-bold">Ce acoperă profesorii de {m.nume.toLowerCase()}</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {m.topics.map((t: string) => (
              <Card key={t} className="p-4 text-sm">
                <div className="font-medium">{t}</div>
              </Card>
            ))}
          </div>
        </section>

        <AdSlot className="my-8" />

        <section className="mt-10 max-w-4xl">
          <h2 className="text-2xl font-bold">Cum aleg profesori de {m.nume.toLowerCase()} pe GrileAdmitere.ro</h2>
          <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-muted-foreground">
            <li>Vezi profilul profesorului — experiență, materii, grile publicate.</li>
            <li>Verifică grilele publicate de profesor și calitatea explicațiilor.</li>
            <li>Citește feedback-ul elevilor care au lucrat cu acel profesor.</li>
            <li>Contactează profesorul pentru meditații sau lucrează gratuit cu grilele lui.</li>
          </ol>
        </section>

        <section className="mt-10 max-w-4xl">
          <h2 className="text-2xl font-bold">Întrebări frecvente — profesori de {m.nume.toLowerCase()}</h2>
          <div className="mt-4 space-y-3 text-sm">
            {m.faq.map((f: { q: string; a: string }) => (
              <Card key={f.q} className="p-5">
                <h3 className="font-semibold">{f.q}</h3>
                <p className="mt-1 text-muted-foreground">{f.a}</p>
              </Card>
            ))}
          </div>
        </section>

        <section className="mt-10 rounded-xl border bg-muted/30 p-6 text-sm">
          <h2 className="text-lg font-bold">Vezi toate grilele și ceilalți profesori</h2>
          <div className="mt-2 flex flex-wrap gap-3 text-primary">
            <Link to="/profesori" className="underline">← Toți profesorii</Link>
            <Link to="/grile" className="underline">Toate grilele admitere</Link>
            <Link to="/subiecte-bac" className="underline">Grile BAC</Link>
          </div>
        </section>
      </main>
    </div>
  );
}