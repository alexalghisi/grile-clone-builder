import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Eye } from "lucide-react";
import { getBacByMaterie } from "@/lib/subiecte-bac.functions";
import { AdLeaderboard, AdInArticle } from "@/components/AdSlot";

const SES: Record<string, string> = {
  "simulare": "Simulare",
  "iunie-iulie": "Iunie–Iulie",
  "august-septembrie": "August–Septembrie",
  "rezerva": "Rezervă",
};

export const Route = createFileRoute("/subiecte-bac/materie/$materie")({
  loader: async ({ params }) => {
    const data = await getBacByMaterie({ data: { slug: params.materie } });
    if (!data.rows.length) throw notFound();
    return data;
  },
  head: ({ params, loaderData }) => {
    const name = loaderData?.name ?? params.materie;
    const url = `https://grileadmitere.ro/subiecte-bac/materie/${params.materie}`;
    const title = `Subiecte BAC ${name} 2010–2026 — Toate Variantele + Bareme PDF`;
    const description = `Toate subiectele oficiale de Bacalaureat la ${name} din 2010 până în 2026, cu bareme de corectare în PDF. Simulare, iunie–iulie, august–septembrie, rezervă. Descarcă gratuit, arhivă completă.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { name: "keywords", content: `subiecte bac ${name.toLowerCase()}, subiecte bacalaureat ${name.toLowerCase()}, bareme bac ${name.toLowerCase()}, variante bac ${name.toLowerCase()}, simulare bac ${name.toLowerCase()}, ${name.toLowerCase()} 2026, ${name.toLowerCase()} 2025, ${name.toLowerCase()} 2024` },
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
            { "@type": "ListItem", position: 3, name: `Subiecte BAC ${name}`, item: url },
          ],
        })},
        { type: "application/ld+json", children: JSON.stringify({
          "@context": "https://schema.org", "@type": "CollectionPage",
          name: title, description, url, inLanguage: "ro-RO",
          isPartOf: { "@type": "WebSite", name: "GrileAdmitere.ro", url: "https://grileadmitere.ro" },
          about: `Subiecte BAC ${name}`,
        })},
      ],
    };
  },
  component: Page,
  notFoundComponent: () => (
    <div className="min-h-screen bg-background"><Header />
      <main className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold">Materia nu a fost găsită</h1>
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

type BacRow = Awaited<ReturnType<typeof getBacByMaterie>>["rows"][number];

function Page() {
  const { name, rows } = Route.useLoaderData();
  const byYear = new Map<number, BacRow[]>();
  rows.forEach((r: BacRow) => { const a = byYear.get(r.year) ?? []; a.push(r); byYear.set(r.year, a); });
  const years = Array.from(byYear.keys()).sort((a, b) => b - a);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8 md:py-12">
        <nav aria-label="Breadcrumb" className="text-xs text-muted-foreground">
          <Link to="/" className="hover:underline">Acasă</Link> /
          <Link to="/subiecte-bac" className="ml-1 hover:underline">Subiecte Bacalaureat</Link> /
          <span className="ml-1">{name}</span>
        </nav>
        <h1 className="mt-2 text-3xl font-bold sm:text-4xl">Subiecte BAC {name} — Toate Variantele 2010–2026</h1>
        <p className="mt-3 max-w-3xl text-muted-foreground">
          Arhivă completă cu subiecte oficiale și bareme de corectare pentru proba de <strong>{name}</strong> de la Bacalaureat, din 2010 până în 2026. Toate variantele, sesiunile (simulare, iunie–iulie, august–septembrie, rezervă) și profilurile — gratuit, în PDF.
        </p>

        <AdLeaderboard className="my-6" />

        {years.map((y) => (
          <section key={y} className="mt-8">
            <h2 className="text-xl font-semibold">Subiecte BAC {name} {y}</h2>
            <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
              {(byYear.get(y) ?? []).map((r: BacRow) => (
                <Card key={r.id} className="p-4">
                  <div className="flex flex-wrap gap-2 text-xs">
                    <Badge variant="secondary">{r.year}</Badge>
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
                      {r.slug && (
                        <Link to="/subiecte-bac/lucrare/$slug" params={{ slug: r.slug }}>
                          <Button size="sm" variant="ghost">Detalii</Button>
                        </Link>
                      )}
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </section>
        ))}

        <AdInArticle />

        <section className="mt-12 max-w-3xl text-sm text-muted-foreground space-y-3">
          <h2 className="text-xl font-semibold text-foreground">De ce să exersezi pe subiecte reale de BAC la {name}?</h2>
          <p>Subiectele oficiale din anii precedenți sunt cea mai bună pregătire pentru proba de <strong>{name}</strong>. Modelele se repetă, baremul îți arată exact cum se punctează, iar rezolvarea cronometrată te antrenează pentru emoțiile examenului.</p>
          <p>Folosește această arhivă pentru a parcurge sistematic <strong>toate variantele de BAC {name}</strong>, începând cu cele mai recente (2026, 2025, 2024) și mergând în urmă până în 2010.</p>
        </section>
      </main>
    </div>
  );
}