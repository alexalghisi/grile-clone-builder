import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/Header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getAdmitereYear } from "@/lib/admitere.functions";
import { AdLeaderboard, AdInArticle } from "@/components/AdSlot";

export const Route = createFileRoute("/admitere/$uniSlug/$materieSlug/$an")({
  head: ({ params }) => {
    const uni = params.uniSlug.toUpperCase();
    const title = `Subiecte Admitere ${params.materieSlug} ${uni} ${params.an} — Rezolvate (PDF)`;
    const description = `Subiecte oficiale și bareme admitere ${params.materieSlug} la ${uni}, sesiunea ${params.an}. Descarcă PDF gratuit și exersează online.`;
    const url = `https://grileadmitere.ro/admitere/${params.uniSlug}/${params.materieSlug}/${params.an}`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:url", content: url },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "LearningResource",
            name: title,
            description,
            url,
            inLanguage: "ro",
            educationalLevel: "Higher Education",
            learningResourceType: "Exam",
            about: { "@type": "Thing", name: `Admitere ${params.materieSlug} ${uni}` },
            dateCreated: `${params.an}-01-01`,
          }),
        },
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Acasă", item: "https://grileadmitere.ro/" },
              { "@type": "ListItem", position: 2, name: "Admitere", item: "https://grileadmitere.ro/admitere" },
              { "@type": "ListItem", position: 3, name: uni, item: `https://grileadmitere.ro/admitere/${params.uniSlug}` },
              { "@type": "ListItem", position: 4, name: params.materieSlug, item: `https://grileadmitere.ro/admitere/${params.uniSlug}/${params.materieSlug}` },
              { "@type": "ListItem", position: 5, name: params.an, item: url },
            ],
          }),
        },
      ],
    };
  },
  loader: ({ params }) =>
    getAdmitereYear({ data: { uni: params.uniSlug, materie: params.materieSlug, an: Number(params.an) } }),
  component: Page,
});

function Page() {
  const params = Route.useParams();
  const initial = Route.useLoaderData();
  const { data } = useQuery({
    queryKey: ["admitere-year", params.uniSlug, params.materieSlug, params.an],
    queryFn: () =>
      getAdmitereYear({ data: { uni: params.uniSlug, materie: params.materieSlug, an: Number(params.an) } }),
    initialData: initial ?? undefined,
  });

  const uni = data?.university_name ?? params.uniSlug.toUpperCase();
  const materie = data?.subject_name ?? params.materieSlug;
  const main = data?.papers?.find((p: any) => p.paper_type === "subiect") ?? data?.papers?.[0];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-10">
        <nav aria-label="Breadcrumb" className="text-xs text-muted-foreground">
          <Link to="/" className="hover:underline">Acasă</Link><span className="mx-1">/</span>
          <Link to="/admitere" className="hover:underline">Admitere</Link><span className="mx-1">/</span>
          <Link to="/admitere/$uniSlug" params={{ uniSlug: params.uniSlug }} className="hover:underline">{uni}</Link>
          <span className="mx-1">/</span>
          <Link to="/admitere/$uniSlug/$materieSlug" params={{ uniSlug: params.uniSlug, materieSlug: params.materieSlug }} className="hover:underline">{materie}</Link>
          <span className="mx-1">/</span><span>{params.an}</span>
        </nav>

        <h1 className="mt-2 text-3xl font-bold">
          Subiecte Admitere {materie} {uni} {params.an} — Rezolvate
        </h1>
        <p className="mt-3 max-w-3xl text-muted-foreground">
          Subiectele oficiale de admitere la {materie} susținute la {uni} în {params.an}, împreună cu baremele de
          corectare. Toate fișierele PDF sunt găzduite local și pot fi descărcate gratuit. Folosește-le pentru
          pregătirea admiterii și exersează apoi grilele rezolvate de pe platformă.
        </p>

        <AdLeaderboard className="my-6" />

        {!data ? (
          <p className="mt-6 text-muted-foreground">Subiectele pentru acest an nu sunt încă disponibile.</p>
        ) : (
          <>
            <div className="mt-6 flex flex-wrap gap-2">
              {data.papers.map((p: any) => (
                <a key={p.id} href={p.pdf_url ?? "#"} target="_blank" rel="noopener noreferrer">
                  <Button size="sm" variant="outline">{p.paper_type === "barem" ? "Barem" : "Subiect"}{p.variant ? ` · ${p.variant}` : ""} PDF</Button>
                </a>
              ))}
            </div>

            {main?.pdf_url && (
              <Card className="mt-6 overflow-hidden">
                <iframe
                  src={main.pdf_url}
                  title={`Subiect admitere ${materie} ${uni} ${params.an}`}
                  className="h-[80vh] w-full"
                  loading="lazy"
                />
              </Card>
            )}

            <section className="mt-10">
              <h2 className="text-xl font-semibold">Despre subiectele de admitere {params.an}</h2>
              <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
                Această pagină reunește toate variantele oficiale de subiecte la {materie} pentru concursul de
                admitere {uni} din anul {params.an}. Conținutul este indexat pentru a putea fi căutat după
                cuvinte-cheie din enunțuri (vezi mai jos). Dacă pregătești admiterea, recomandăm să rezolvi
                varianta de mai sus, să compari cu baremul oficial și apoi să exersezi pe{" "}
                <Link to="/grile" className="underline">grilele interactive</Link>.
              </p>
            </section>

            <AdInArticle />

            <section className="mt-8">
              <h2 className="text-xl font-semibold">Navighează între ani</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {data.all_years.map((y: number) => (
                  <Link key={y} to="/admitere/$uniSlug/$materieSlug/$an" params={{ uniSlug: params.uniSlug, materieSlug: params.materieSlug, an: String(y) }}>
                    <Button size="sm" variant={y === Number(params.an) ? "default" : "outline"}>{y}</Button>
                  </Link>
                ))}
              </div>
            </section>

            {main?.ocr_text && (
              <section className="mt-10 border-t pt-6">
                <h2 className="text-xl font-semibold">Conținut subiect (text extras)</h2>
                <pre className="mt-3 max-h-[60vh] overflow-auto whitespace-pre-wrap rounded bg-muted p-4 text-xs text-muted-foreground">
                  {main.ocr_text.slice(0, 8000)}
                </pre>
              </section>
            )}
          </>
        )}
      </main>
    </div>
  );
}