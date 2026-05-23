import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/Header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, FileText } from "lucide-react";
import { listAdmitereUniversities } from "@/lib/admitere.functions";

export const Route = createFileRoute("/admitere")({
  head: () => {
    const title = "Subiecte Admitere 2001-2026 — Toate Facultățile (PDF) | GrileAdmitere";
    const description = "Arhiva completă cu subiecte admitere PDF pentru toate facultățile din România: UMF, Politehnică, ASE, UBB, UAIC. Toate materiile, toți anii 2001-2026, gratuit.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { name: "keywords", content: "subiecte admitere, admitere facultate pdf, admitere 2026, UMF subiecte, politehnica subiecte, admitere biologie, admitere matematica, subiecte rezolvate admitere" },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { property: "og:url", content: "https://grileadmitere.ro/admitere" },
      ],
      links: [{ rel: "canonical", href: "https://grileadmitere.ro/admitere" }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: title,
            description,
            url: "https://grileadmitere.ro/admitere",
            inLanguage: "ro-RO",
            isPartOf: { "@type": "WebSite", name: "GrileAdmitere.ro", url: "https://grileadmitere.ro" },
          }),
        },
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Acasă", item: "https://grileadmitere.ro/" },
              { "@type": "ListItem", position: 2, name: "Subiecte Admitere", item: "https://grileadmitere.ro/admitere" },
            ],
          }),
        },
      ],
    };
  },
  loader: () => listAdmitereUniversities(),
  component: Page,
});

function Page() {
  const initial = Route.useLoaderData();
  const { data: unis = initial ?? [] } = useQuery({
    queryKey: ["admitere-unis"],
    queryFn: () => listAdmitereUniversities(),
    initialData: initial ?? undefined,
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-10">
        <nav aria-label="Breadcrumb" className="text-xs text-muted-foreground">
          <Link to="/" className="hover:underline">Acasă</Link>
          <span className="mx-1">/</span>
          <span>Subiecte Admitere</span>
        </nav>
        <h1 className="mt-2 text-3xl font-bold sm:text-4xl">Subiecte Admitere 2001-2026 — Toate Facultățile din România</h1>
        <p className="mt-3 max-w-3xl text-muted-foreground">
          Arhivă completă cu subiecte de admitere oficiale din 2001 până în 2026 pentru cele mai importante universități din România. Descarcă PDF cu subiecte și bareme, exersează grilele și pregătește-te pentru admitere 2026 — totul gratuit.
        </p>

        {unis.length === 0 ? (
          <div className="mt-10 rounded-lg border border-dashed bg-card p-8 text-center">
            <FileText className="mx-auto h-10 w-10 text-muted-foreground" />
            <h2 className="mt-4 text-lg font-semibold">Arhiva se construiește</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Adăugăm continuu subiecte de la toate facultățile. Între timp, exersează cu grilele noastre.
            </p>
            <div className="mt-4 flex justify-center gap-2">
              <Link to="/grile" className="text-sm font-medium text-primary hover:underline">Vezi grilele admitere →</Link>
            </div>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {unis.map((u: any) => (
              <Link key={u.slug} to="/admitere/$uniSlug" params={{ uniSlug: u.slug }}>
                <Card className="h-full p-5 transition hover:border-primary/40 hover:shadow">
                  <div className="flex items-start gap-3">
                    <GraduationCap className="mt-1 h-5 w-5 text-primary" />
                    <div className="min-w-0">
                      <div className="font-semibold">{u.name}</div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        {u.subject_count} materii · {u.year_count} ani · {u.paper_count} subiecte
                      </div>
                    </div>
                    <Badge variant="secondary" className="ml-auto">PDF</Badge>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}

        <section className="mt-12 max-w-3xl space-y-3 text-sm text-muted-foreground">
          <h2 className="text-xl font-semibold text-foreground">Cum folosești arhiva de subiecte admitere</h2>
          <p>Alege facultatea care te interesează (UMF Carol Davila, UMF Cluj, Politehnică, ASE, UBB, UAIC etc.), apoi materia (biologie, chimie, matematică, fizică, informatică, limba română) și anul. Pentru fiecare combinație ai PDF cu subiectele oficiale și, când e disponibil, baremul de corectare.</p>
          <p>Pentru pregătire activă, rezolvă grilele admitere cu explicații pas cu pas — sunt extrase din aceleași tipuri de subiecte și te ajută să-ți crești scorul.</p>
        </section>
      </main>
    </div>
  );
}