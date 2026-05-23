import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, ChevronLeft, Download } from "lucide-react";
import { getBacSubject } from "@/lib/bac.functions";

export const Route = createFileRoute("/subiecte-bac/$materie")({
  loader: async ({ params }) => {
    const data = await getBacSubject({ data: { slug: params.materie } });
    if (!data) throw notFound();
    return data;
  },
  head: ({ params, loaderData }) => {
    const name = loaderData?.name ?? params.materie;
    const title = `Subiecte BAC ${name} — Toți Anii 2001-2026 (PDF + Bareme)`;
    const desc = `Toate subiectele BAC ${name} din 2001 până în 2026. PDF oficial MEC cu bareme, variante rezolvate, sesiuni iunie și august. Pregătire gratuită pentru Bacalaureat 2026.`;
    return {
      meta: [
        { title }, { name: "description", content: desc },
        { name: "keywords", content: `subiecte bac ${name.toLowerCase()}, bac ${name.toLowerCase()} 2026, variante bac ${name.toLowerCase()}, bareme bac, pdf bac` },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:url", content: `https://grileadmitere.ro/subiecte-bac/${params.materie}` },
      ],
      links: [{ rel: "canonical", href: `https://grileadmitere.ro/subiecte-bac/${params.materie}` }],
    };
  },
  component: Page,
});

function Page() {
  const data = Route.useLoaderData();
  const params = Route.useParams();
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-10">
        <Link to="/subiecte-bac" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
          <ChevronLeft className="h-4 w-4" /> Toate materiile
        </Link>
        <h1 className="mt-3 text-3xl font-bold sm:text-4xl">Subiecte BAC {data.name} — Toți Anii</h1>
        <p className="mt-3 max-w-3xl text-muted-foreground">
          Arhivă completă a subiectelor și baremelor de Bacalaureat la {data.name}, de la {data.years[data.years.length - 1]?.year} până în {data.years[0]?.year}. Descarcă PDF-uri oficiale MEC pentru toate sesiunile.
        </p>

        <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {data.years.map((y) => (
            <Link key={y.year} to="/subiecte-bac/$materie/$an" params={{ materie: params.materie, an: String(y.year) }}>
              <Card className="p-4 transition hover:border-primary/40 hover:shadow-md">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold">BAC {data.name} {y.year}</h2>
                    <p className="text-xs text-muted-foreground">{y.items.length} {y.items.length === 1 ? "sesiune" : "sesiuni"}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </Card>
            </Link>
          ))}
        </div>

        <section className="mt-12 rounded-lg border bg-card p-6">
          <h2 className="text-xl font-semibold">Resurse conexe pentru {data.name}</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            <Link to="/quiz/$slug" params={{ slug: params.materie }}><Button variant="outline" size="sm"><Download className="mr-1 h-3 w-3" />Quiz {data.name}</Button></Link>
            <Link to="/simulare"><Button variant="outline" size="sm">Simulare BAC</Button></Link>
            <Link to="/meditatii"><Button variant="outline" size="sm">Caut profesor {data.name}</Button></Link>
          </div>
        </section>
      </main>
    </div>
  );
}