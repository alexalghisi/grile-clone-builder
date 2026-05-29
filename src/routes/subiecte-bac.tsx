import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/Header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, FileText } from "lucide-react";
import { listBacSubjects } from "@/lib/bac.functions";

const ICONS: Record<string, string> = {
  matematica: "📐", romana: "📖", biologie: "🧬",
  chimie: "⚗️", fizica: "⚛️", engleza: "🌍",
};

export const Route = createFileRoute("/subiecte-bac")({
  head: () => ({
    meta: [
      { title: "Subiecte BAC 2026 Rezolvate — Toate Materiile (PDF)" },
      { name: "description", content: "Subiecte BAC 2001-2026: matematică, română, biologie, chimie, fizică. PDF cu bareme și variante gratuite." },
      { name: "keywords", content: "subiecte bac, bac 2026, bac matematica, bac romana, bac biologie, bac chimie, bac fizica, bareme bac, variante bac, pdf bac" },
      { property: "og:title", content: "Subiecte BAC 2026 Rezolvate — Toate Materiile (PDF)" },
      { property: "og:description", content: "Arhiva completă subiecte BAC 2001-2026 cu PDF, bareme și rezolvări pentru toate materiile." },
      { property: "og:url", content: "https://grileadmitere.ro/subiecte-bac" },
    ],
    links: [{ rel: "canonical", href: "https://grileadmitere.ro/subiecte-bac" }],
    scripts: [{
      type: "application/ld+json",
      children: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: "Subiecte BAC 2026 Rezolvate — Arhiva Oficială",
        description: "Colecție de subiecte BAC oficiale 2001-2026 pentru toate materiile, cu PDF, bareme și rezolvări.",
        url: "https://grileadmitere.ro/subiecte-bac",
        inLanguage: "ro-RO",
      }),
    }],
  }),
  loader: () => listBacSubjects(),
  component: Page,
});

function Page() {
  const initial = Route.useLoaderData();
  const { data: subjects = initial ?? [] } = useQuery({
    queryKey: ["bac-subjects"],
    queryFn: () => listBacSubjects(),
    initialData: initial ?? undefined,
  });
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold sm:text-4xl">Subiecte BAC 2026 Rezolvate — Toate Materiile, Toți Anii</h1>
        <p className="mt-3 max-w-3xl text-muted-foreground">
          Arhivă completă cu subiecte și bareme oficiale Bacalaureat din 2001 până în 2026 pentru toate materiile: matematică, limba română, biologie, chimie, fizică și engleză. Descarcă PDF-uri cu variante rezolvate și pregătește-te pentru BAC 2026.
        </p>

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {subjects.map((s: any) => (
            <Link key={s.slug} to="/subiecte-bac/$materie" params={{ materie: s.slug }}>
              <Card className="h-full p-6 transition hover:border-primary/40 hover:shadow-md">
                <div className="text-3xl">{ICONS[s.slug] ?? "📚"}</div>
                <h2 className="mt-3 text-lg font-semibold">Subiecte BAC {s.name}</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {s.year_count} ani disponibili · cel mai recent {s.latest}
                </p>
                <Button variant="outline" size="sm" className="mt-4">
                  Vezi anii <ArrowRight className="ml-1 h-3 w-3" />
                </Button>
              </Card>
            </Link>
          ))}
        </div>

        <section className="mt-12 rounded-lg border bg-card p-6">
          <h2 className="text-xl font-semibold">Cum folosești arhiva de subiecte BAC</h2>
          <ul className="mt-3 list-disc space-y-1 pl-6 text-sm text-muted-foreground">
            <li>Alege materia ta și anul care te interesează (din 2001 până în 2026)</li>
            <li>Descarcă PDF-ul cu subiectele și baremul oficial publicat de Ministerul Educației</li>
            <li>Rezolvă variantele și verifică-te cu grilele și simulările noastre gratuite</li>
            <li>Folosește filtrele pe sesiuni (iunie / august / specială) pentru pregătire țintită</li>
          </ul>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link to="/simulare"><Button variant="outline" size="sm">Simulare BAC</Button></Link>
            <Link to="/grile"><Button variant="outline" size="sm">Grile Admitere</Button></Link>
            <Link to="/grila-zilei"><Button variant="outline" size="sm">Grila Zilei</Button></Link>
            <Link to="/meditatii"><Button variant="outline" size="sm"><FileText className="mr-1 h-3 w-3" />Caut profesor meditații</Button></Link>
          </div>
        </section>
      </main>
    </div>
  );
}