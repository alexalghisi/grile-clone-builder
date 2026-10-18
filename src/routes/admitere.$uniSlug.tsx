import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/Header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen } from "lucide-react";
import { getAdmitereUniversity } from "@/lib/admitere.functions";
import { AdLeaderboard, AdInArticle } from "@/components/AdSlot";

export const Route = createFileRoute("/admitere/$uniSlug")({
  head: ({ params }) => {
    const slug = params.uniSlug;
    const display = slug.toUpperCase();
    const title = `Subiecte Admitere ${display} 2001-2026 — Toate Materiile (PDF)`;
    const description = `Subiecte oficiale admitere ${display} din 2001 până în 2026, PDF gratuit cu bareme și rezolvări. Toate materiile pentru pregătire admitere ${display} 2026.`;
    const url = `https://grileadmitere.ro/admitere/${slug}`;
    return {
      meta: [
      { name: "twitter:card", content: "summary_large_image" },
        { title },
        { name: "description", content: description },
        { name: "keywords", content: `subiecte admitere ${slug}, ${slug} admitere pdf, admitere ${slug} 2026, ${slug} biologie chimie matematica` },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "article" },
        { property: "og:url", content: url },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Acasă", item: "https://grileadmitere.ro/" },
              { "@type": "ListItem", position: 2, name: "Subiecte Admitere", item: "https://grileadmitere.ro/admitere" },
              { "@type": "ListItem", position: 3, name: display, item: url },
            ],
          }),
        },
      ],
    };
  },
  loader: async ({ params }) => {
    const data = await getAdmitereUniversity({ data: { slug: params.uniSlug } });
    return data;
  },
  component: Page,
  notFoundComponent: () => <div className="container py-10">Universitate fără subiecte încărcate încă.</div>,
  errorComponent: ({ error }) => <div className="container py-10 text-destructive">Eroare: {String((error as Error)?.message ?? error)}</div>,
});

function Page() {
  const params = Route.useParams();
  const initial = Route.useLoaderData();
  const { data } = useQuery({
    queryKey: ["admitere-uni", params.uniSlug],
    queryFn: () => getAdmitereUniversity({ data: { slug: params.uniSlug } }),
    initialData: initial ?? undefined,
  });

  if (!data) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-10">
          <nav aria-label="Breadcrumb" className="text-xs text-muted-foreground">
            <Link to="/" className="hover:underline">Acasă</Link>
            <span className="mx-1">/</span>
            <Link to="/admitere" className="hover:underline">Subiecte Admitere</Link>
            <span className="mx-1">/</span>
            <span>{params.uniSlug.toUpperCase()}</span>
          </nav>
          <h1 className="mt-2 text-3xl font-bold">Subiecte Admitere {params.uniSlug.toUpperCase()}</h1>
          <p className="mt-4 max-w-2xl text-muted-foreground">
            Adăugăm continuu subiecte pentru această facultate. Între timp, vezi grilele admitere {params.uniSlug.toUpperCase()} cu explicații pas cu pas.
          </p>
          <Link to="/grile/$uniSlug" params={{ uniSlug: params.uniSlug }} className="mt-4 inline-block text-sm font-medium text-primary hover:underline">
            Grile admitere {params.uniSlug.toUpperCase()} →
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-10">
        <nav aria-label="Breadcrumb" className="text-xs text-muted-foreground">
          <Link to="/" className="hover:underline">Acasă</Link>
          <span className="mx-1">/</span>
          <Link to="/admitere" className="hover:underline">Subiecte Admitere</Link>
          <span className="mx-1">/</span>
          <span>{data.name}</span>
        </nav>
        <h1 className="mt-2 text-3xl font-bold sm:text-4xl">Subiecte Admitere {data.name} 2001-2026 — Toate Materiile</h1>
        <p className="mt-3 max-w-3xl text-muted-foreground">
          Arhivă cu subiecte oficiale de admitere {data.name} pe materii și ani. Descarcă PDF, vezi baremul și exersează grilele cu explicații.
        </p>

        <AdLeaderboard className="my-6" />

        <h2 className="mt-8 mb-3 text-lg font-semibold">Materii disponibile</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.subjects.map((s: any) => (
            <Link key={s.slug} to="/admitere/$uniSlug/$materieSlug" params={{ uniSlug: params.uniSlug, materieSlug: s.slug }}>
              <Card className="h-full p-5 transition hover:border-primary/40 hover:shadow">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex gap-3">
                    <BookOpen className="mt-1 h-5 w-5 text-primary" />
                    <div>
                      <div className="font-semibold">{s.name}</div>
                      <div className="text-xs text-muted-foreground">cel mai recent: {s.latest}</div>
                    </div>
                  </div>
                  <Badge variant="secondary">{s.year_count} ani</Badge>
                </div>
              </Card>
            </Link>
          ))}
        </div>

        <AdInArticle />

        <section className="mt-12 max-w-3xl space-y-3 text-sm text-muted-foreground">
          <h2 className="text-xl font-semibold text-foreground">Pregătire admitere {data.name}</h2>
          <p>Pentru fiecare materie ai subiectele oficiale din ultimii ani plus baremul de corectare. Le poți descărca în PDF și rezolva offline, sau să faci direct grilele admitere {data.name} pe site cu explicații pas cu pas.</p>
          <Link to="/grile/$uniSlug" params={{ uniSlug: params.uniSlug }} className="inline-block font-medium text-primary hover:underline">
            Grile admitere {data.name} →
          </Link>
        </section>
      </main>
    </div>
  );
}