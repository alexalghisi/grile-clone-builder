import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Eye } from "lucide-react";
import { getBacByYear } from "@/lib/subiecte-bac.functions";
import { AdLeaderboard, AdInArticle } from "@/components/AdSlot";

const SES: Record<string, string> = {
  "simulare": "Simulare",
  "iunie-iulie": "Iunie–Iulie",
  "august-septembrie": "August–Septembrie",
  "rezerva": "Rezervă",
};

type Row = Awaited<ReturnType<typeof getBacByYear>>["rows"][number];

export const Route = createFileRoute("/subiecte-bac/an/$an")({
  loader: async ({ params }) => {
    const year = Number(params.an);
    if (!Number.isInteger(year) || year < 2000 || year > 2030) throw notFound();
    const data = await getBacByYear({ data: { year } });
    if (!data.rows.length) throw notFound();
    return data;
  },
  head: ({ params }) => {
    const url = `https://grileadmitere.ro/subiecte-bac/an/${params.an}`;
    const title = `Subiecte Bacalaureat ${params.an} — Toate Materiile + Bareme PDF Oficiale`;
    const description = `Subiecte oficiale BAC ${params.an} la toate materiile: Română, Matematică M1/M2/M3, Istorie, Biologie, Fizică, Chimie, Geografie, Informatică. Simulare, sesiunea iunie–iulie, august–septembrie. Cu bareme. PDF gratuit.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { name: "keywords", content: `subiecte bac ${params.an}, bacalaureat ${params.an}, bareme bac ${params.an}, simulare bac ${params.an}, subiecte romana ${params.an}, subiecte matematica ${params.an}, subiecte istorie ${params.an}, subiecte biologie ${params.an}` },
        { name: "robots", content: "index, follow, max-image-preview:large, max-snippet:-1" },
        { httpEquiv: "Content-Language", content: "ro-RO" },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:url", content: url },
        { property: "og:type", content: "website" },
        { property: "og:locale", content: "ro_RO" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: description },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [
        { type: "application/ld+json", children: JSON.stringify({
          "@context": "https://schema.org", "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Acasă", item: "https://grileadmitere.ro/" },
            { "@type": "ListItem", position: 2, name: "Subiecte Bacalaureat", item: "https://grileadmitere.ro/subiecte-bac" },
            { "@type": "ListItem", position: 3, name: `BAC ${params.an}`, item: url },
          ],
        })},
      ],
    };
  },
  component: Page,
  notFoundComponent: () => (
    <div className="min-h-screen bg-background"><Header />
      <main className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold">Anul nu a fost găsit</h1>
        <Link to="/subiecte-bac" className="mt-4 inline-block text-primary underline">Înapoi la arhivă</Link>
      </main></div>
  ),
  errorComponent: ({ error }) => (
    <div className="min-h-screen bg-background"><Header />
      <main className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold">Eroare</h1>
        <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
      </main></div>
  ),
});

function Page() {
  const { year, rows } = Route.useLoaderData();
  const byMaterie = new Map<string, { name: string; items: Row[] }>();
  rows.forEach((r: Row) => {
    const k = r.subject_slug;
    const e = byMaterie.get(k) ?? { name: r.subject_name, items: [] };
    e.items.push(r);
    byMaterie.set(k, e);
  });
  const materii = Array.from(byMaterie.entries()).sort((a, b) => a[1].name.localeCompare(b[1].name, "ro"));

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8 md:py-12">
        <nav aria-label="Breadcrumb" className="text-xs text-muted-foreground">
          <Link to="/" className="hover:underline">Acasă</Link> /
          <Link to="/subiecte-bac" className="ml-1 hover:underline">Subiecte Bacalaureat</Link> /
          <span className="ml-1">{year}</span>
        </nav>
        <h1 className="mt-2 text-3xl font-bold sm:text-4xl">Subiecte Bacalaureat {year} — Arhivă Oficială</h1>
        <p className="mt-3 max-w-3xl text-muted-foreground">
          Toate subiectele și baremele oficiale de Bacalaureat din sesiunea <strong>{year}</strong>, la toate materiile și pentru fiecare profil (mate-info, științe ale naturii, uman, tehnologic, pedagogic). PDF gratuit.
        </p>

        <AdLeaderboard className="my-6" />

        {materii.map(([slug, { name, items }]) => (
          <section key={slug} className="mt-8">
            <h2 className="text-xl font-semibold">
              <Link to="/subiecte-bac/materie/$materie" params={{ materie: slug }} className="hover:underline">
                {name} — BAC {year}
              </Link>
            </h2>
            <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
              {items.map((r) => (
                <Card key={r.id} className="p-4">
                  <div className="flex flex-wrap gap-2 text-xs">
                    <Badge variant="outline">{SES[r.session] ?? r.session}</Badge>
                    {r.profil && <Badge variant="outline">{r.profil}</Badge>}
                    {r.variant && <Badge variant="outline">Var. {r.variant}</Badge>}
                    <Badge>{r.paper_type === "barem" ? "Barem" : "Subiect"}</Badge>
                  </div>
                  <h3 className="mt-2 text-base font-semibold">{r.title}</h3>
                  {r.pdf_url && (
                    <div className="mt-3 flex gap-2">
                      <a href={r.pdf_url} target="_blank" rel="noopener noreferrer">
                        <Button size="sm" variant="outline"><Eye className="mr-1 h-3 w-3" />Vezi PDF</Button>
                      </a>
                      <a href={r.pdf_url} download>
                        <Button size="sm" variant="ghost"><Download className="mr-1 h-3 w-3" />Descarcă</Button>
                      </a>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </section>
        ))}

        <AdInArticle />
      </main>
    </div>
  );
}