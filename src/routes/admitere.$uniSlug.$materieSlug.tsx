import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/Header";
import { Card } from "@/components/ui/card";
import { getAdmitereSubject } from "@/lib/admitere.functions";
import { AdInArticle } from "@/components/AdSlot";

export const Route = createFileRoute("/admitere/$uniSlug/$materieSlug")({
  head: ({ params }) => {
    const title = `Subiecte Admitere ${params.materieSlug} ${params.uniSlug.toUpperCase()} — Toți Anii (PDF)`;
    const description = `Subiecte oficiale admitere ${params.materieSlug} ${params.uniSlug.toUpperCase()} din 2001-2026. PDF gratuit cu bareme.`;
    const url = `https://grileadmitere.ro/admitere/${params.uniSlug}/${params.materieSlug}`;
    return {
      meta: [
      { name: "twitter:card", content: "summary_large_image" },
        { title }, { name: "description", content: description },
        { property: "og:title", content: title }, { property: "og:description", content: description },
        { property: "og:url", content: url }, { property: "og:type", content: "article" },
      ],
      links: [{ rel: "canonical", href: url }],
    };
  },
  loader: ({ params }) => getAdmitereSubject({ data: { uni: params.uniSlug, materie: params.materieSlug } }),
  component: Page,
});

function Page() {
  const params = Route.useParams();
  const initial = Route.useLoaderData();
  const { data } = useQuery({
    queryKey: ["admitere-subject", params.uniSlug, params.materieSlug],
    queryFn: () => getAdmitereSubject({ data: { uni: params.uniSlug, materie: params.materieSlug } }),
    initialData: initial ?? undefined,
  });
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-10">
        <nav aria-label="Breadcrumb" className="text-xs text-muted-foreground">
          <Link to="/" className="hover:underline">Acasă</Link><span className="mx-1">/</span>
          <Link to="/admitere" className="hover:underline">Admitere</Link><span className="mx-1">/</span>
          <Link to="/admitere/$uniSlug" params={{ uniSlug: params.uniSlug }} className="hover:underline">{params.uniSlug.toUpperCase()}</Link>
          <span className="mx-1">/</span><span>{params.materieSlug}</span>
        </nav>
        <h1 className="mt-2 text-3xl font-bold">Subiecte Admitere {data?.subject_name ?? params.materieSlug} {data?.university_name ?? params.uniSlug.toUpperCase()} — Toți Anii</h1>
        <AdInArticle />
        {!data ? (
          <p className="mt-6 text-muted-foreground">Nu există subiecte încărcate pentru această combinație încă.</p>
        ) : (
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {data.years.map((y: any) => (
              <Link key={y.year} to="/admitere/$uniSlug/$materieSlug/$an" params={{ uniSlug: params.uniSlug, materieSlug: params.materieSlug, an: String(y.year) }}>
                <Card className="p-4 text-center transition hover:border-primary/40 hover:shadow">
                  <div className="text-2xl font-bold">{y.year}</div>
                  <div className="text-xs text-muted-foreground">{y.items.length} fișiere</div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}