import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Eye } from "lucide-react";
import { getBacBySlug } from "@/lib/subiecte-bac.functions";
type LoaderData = NonNullable<Awaited<ReturnType<typeof getBacBySlug>>>;
type PairItem = LoaderData["pair"][number];
type RelatedItem = LoaderData["related"][number];

import { AdLeaderboard, AdInArticle } from "@/components/AdSlot";

const SES: Record<string, string> = {
  "simulare": "Simulare",
  "iunie-iulie": "Iunie–Iulie",
  "august-septembrie": "August–Septembrie",
  "rezerva": "Rezervă",
};

export const Route = createFileRoute("/subiecte-bac/lucrare/$slug")({
  loader: async ({ params }) => {
    const data = await getBacBySlug({ data: { slug: params.slug } });
    if (!data) throw notFound();
    return data;
  },
  head: ({ params, loaderData }) => {
    const r = loaderData?.row;
    if (!r) return { meta: [{ title: "Subiect BAC" }] };
    const ses = SES[r.session] ?? r.session;
    const url = `https://grileadmitere.ro/subiecte-bac/lucrare/${params.slug}`;
    const title = `${r.title} — Subiecte BAC ${r.subject_name} ${r.year} PDF`;
    const description = `${r.paper_type === "barem" ? "Baremul oficial" : "Subiectul oficial"} de Bacalaureat la ${r.subject_name}, sesiunea ${ses} ${r.year}${r.profil ? `, profil ${r.profil}` : ""}${r.variant ? `, varianta ${r.variant}` : ""}. Descarcă PDF gratuit.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { name: "keywords", content: `${r.subject_name.toLowerCase()} bac ${r.year}, subiect bac ${r.subject_name.toLowerCase()} ${r.year}, barem bac ${r.subject_name.toLowerCase()} ${r.year}, ${ses.toLowerCase()} ${r.year}${r.variant ? `, varianta ${r.variant}` : ""}` },
        { name: "robots", content: "index, follow, max-image-preview:large, max-snippet:-1" },
        { httpEquiv: "Content-Language", content: "ro-RO" },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:url", content: url },
        { property: "og:type", content: "article" },
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
            { "@type": "ListItem", position: 3, name: `BAC ${r.subject_name}`, item: `https://grileadmitere.ro/subiecte-bac/materie/${r.subject_slug}` },
            { "@type": "ListItem", position: 4, name: r.title, item: url },
          ],
        })},
        { type: "application/ld+json", children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "DigitalDocument",
          name: r.title,
          description,
          inLanguage: "ro-RO",
          url,
          encodingFormat: "application/pdf",
          contentUrl: r.pdf_url ?? undefined,
          dateCreated: `${r.year}-01-01`,
          about: r.subject_name,
          publisher: { "@type": "Organization", name: "Ministerul Educației" },
        })},
      ],
    };
  },
  component: Page,
  notFoundComponent: () => (
    <div className="min-h-screen bg-background"><Header />
      <main className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold">Lucrarea nu a fost găsită</h1>
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
  const { row: r, pair, related } = Route.useLoaderData();
  const ses = SES[r.session] ?? r.session;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8 md:py-12">
        <nav aria-label="Breadcrumb" className="text-xs text-muted-foreground">
          <Link to="/" className="hover:underline">Acasă</Link> /
          <Link to="/subiecte-bac" className="ml-1 hover:underline">Subiecte BAC</Link> /
          <Link to="/subiecte-bac/materie/$materie" params={{ materie: r.subject_slug }} className="ml-1 hover:underline">{r.subject_name}</Link> /
          <span className="ml-1">{r.year}</span>
        </nav>
        <div className="mt-2 flex flex-wrap gap-2 text-xs">
          <Badge variant="secondary">{r.year}</Badge>
          <Badge variant="outline">{ses}</Badge>
          {r.profil && <Badge variant="outline">{r.profil}</Badge>}
          {r.variant && <Badge variant="outline">Varianta {r.variant}</Badge>}
          <Badge>{r.paper_type === "barem" ? "Barem" : "Subiect oficial"}</Badge>
        </div>
        <h1 className="mt-2 text-3xl font-bold sm:text-4xl">{r.title}</h1>
        <p className="mt-3 max-w-3xl text-muted-foreground">
          {r.paper_type === "barem" ? "Baremul oficial" : "Subiectul oficial"} de Bacalaureat la <strong>{r.subject_name}</strong>, sesiunea <strong>{ses} {r.year}</strong>
          {r.profil ? <>, profil <strong>{r.profil}</strong></> : null}
          {r.variant ? <>, <strong>varianta {r.variant}</strong></> : null}. PDF gratuit, rehostat de pe sursa oficială.
        </p>

        {r.pdf_url && (
          <div className="mt-5 flex flex-wrap gap-2">
            <Button asChild>
              <a href={r.pdf_url} target="_blank" rel="noopener noreferrer"><Eye className="mr-1 h-4 w-4" />Deschide PDF</a>
            </Button>
            <Button asChild variant="outline">
              <a href={r.pdf_url} download><Download className="mr-1 h-4 w-4" />Descarcă PDF</a>
            </Button>
          </div>
        )}

        <AdLeaderboard className="my-6" />

        {pair.length > 1 && (
          <section className="mt-6">
            <h2 className="text-lg font-semibold">Subiect + Barem</h2>
            <div className="mt-2 grid grid-cols-1 gap-3 md:grid-cols-2">
              {pair.map((p: PairItem) => (
                <Card key={p.id} className="p-3 flex items-center justify-between gap-2">
                  <div>
                    <Badge>{p.paper_type === "barem" ? "Barem" : "Subiect"}</Badge>
                    <div className="mt-1 text-sm">{p.title}</div>
                  </div>
                  {p.slug && p.slug !== r.slug && (
                    <Button asChild size="sm" variant="outline">
                      <Link to="/subiecte-bac/lucrare/$slug" params={{ slug: p.slug }}>Deschide</Link>
                    </Button>
                  )}
                </Card>
              ))}
            </div>
          </section>
        )}

        {r.pdf_url && (
          <section className="mt-8">
            <h2 className="text-lg font-semibold">Vizualizare PDF</h2>
            <Card className="mt-2 overflow-hidden">
              <iframe src={r.pdf_url} title={r.title} className="w-full" style={{ height: "80vh" }} />
            </Card>
          </section>
        )}

        <AdInArticle />

        {related.length > 1 && (
          <section className="mt-10">
            <h2 className="text-xl font-semibold">Alte variante {r.subject_name}</h2>
            <ul className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
              {related.filter((x: RelatedItem) => x.slug && x.slug !== r.slug).map((x: RelatedItem) => (
                <li key={x.slug}>
                  <Link to="/subiecte-bac/lucrare/$slug" params={{ slug: x.slug! }}
                    className="block rounded-md border bg-card px-3 py-2 text-sm hover:border-primary/40 hover:text-primary">
                    BAC {x.year} · {SES[x.session] ?? x.session}{x.variant ? ` · v${x.variant}` : ""}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="mt-10 max-w-3xl text-sm text-muted-foreground space-y-3">
          <h2 className="text-xl font-semibold text-foreground">Cum folosești {r.paper_type === "barem" ? "baremul" : "subiectul"}</h2>
          <p>Rezolvă întâi <strong>subiectul</strong> contra cronometru (3 ore, exact ca la examen), apoi verifică-te pas cu pas cu <strong>baremul oficial</strong>. Notează ce ai greșit și revino după 1–2 zile pe aceleași itemi.</p>
          <p>Pentru pregătire completă, parcurge sistematic <Link to="/subiecte-bac/materie/$materie" params={{ materie: r.subject_slug }} className="text-primary underline">toate subiectele BAC {r.subject_name}</Link> din 2010 până în prezent.</p>
        </section>
      </main>
    </div>
  );
}