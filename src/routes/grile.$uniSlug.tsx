import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { getUniversity } from "@/lib/db.functions";
import { Header } from "@/components/Header";
import { Card } from "@/components/ui/card";
import { AdSlot, AdLeaderboard, AdInArticle } from "@/components/AdSlot";
import { BookOpen, Trophy, Sparkles, FileText } from "lucide-react";

export const Route = createFileRoute("/grile/$uniSlug")({
  head: ({ params }) => {
    const slug = params.uniSlug;
    const SLUG = slug.toUpperCase();
    const title = `Grile Admitere ${SLUG} 2026 Rezolvate — Toate Materiile | GrileAdmitere.ro`;
    const description = `Grile admitere ${SLUG} 2026 rezolvate pas cu pas, cu explicații detaliate la fiecare răspuns. Subiecte din anii precedenți, simulări gratuite și pregătire online completă pentru facultate.`;
    return {
      meta: [
      { name: "twitter:card", content: "summary_large_image" },
        { title },
        { name: "description", content: description },
        { name: "keywords", content: `grile ${slug}, admitere ${slug} 2026, teste ${slug}, subiecte ${slug}, pregatire admitere ${slug}, facultate ${slug}` },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "article" },
        { property: "og:url", content: `https://grileadmitere.ro/grile/${slug}` },
      ],
      links: [{ rel: "canonical", href: `https://grileadmitere.ro/grile/${slug}` }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Acasă", item: "https://grileadmitere.ro/" },
              { "@type": "ListItem", position: 2, name: "Grile Admitere", item: "https://grileadmitere.ro/grile" },
              { "@type": "ListItem", position: 3, name: SLUG, item: `https://grileadmitere.ro/grile/${slug}` },
            ],
          }),
        },
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: title,
            description,
            url: `https://grileadmitere.ro/grile/${slug}`,
            inLanguage: "ro-RO",
            about: { "@type": "EducationalOrganization", name: SLUG, url: `https://grileadmitere.ro/grile/${slug}` },
            isPartOf: { "@type": "WebSite", name: "GrileAdmitere.ro", url: "https://grileadmitere.ro" },
          }),
        },
      ],
    };
  },
  component: Page,
});

function Page() {
  const { uniSlug } = Route.useParams();
  const fn = useServerFn(getUniversity);
  const { data, isLoading } = useQuery({ queryKey: ["uni", uniSlug], queryFn: () => fn({ data: { slug: uniSlug } }) });

  if (isLoading) return (<div className="min-h-screen bg-background"><Header /><div className="container py-10">Se încarcă…</div></div>);
  if (!data) return (<div className="min-h-screen bg-background"><Header /><div className="container py-10">Universitate negăsită.</div></div>);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-10">
        <nav aria-label="Breadcrumb" className="text-xs text-muted-foreground">
          <Link to="/" className="hover:underline">Acasă</Link>
          <span className="mx-1">/</span>
          <Link to="/grile" className="hover:underline">Grile Admitere</Link>
          <span className="mx-1">/</span>
          <span>{data.short_name ?? uniSlug.toUpperCase()}</span>
        </nav>
        <h1 className="mt-2 text-3xl font-bold">Grile Admitere {data.short_name ?? data.name} 2026 — Rezolvate Pas cu Pas</h1>
        <p className="text-muted-foreground">{data.city} · pregătire gratuită pentru admitere</p>
        {data.description && <p className="mt-4 max-w-2xl text-sm text-muted-foreground">{data.description}</p>}
        <p className="mt-3 max-w-3xl text-sm text-muted-foreground">
          Exersează gratuit cu grilele de admitere {data.short_name ?? data.name} din anii precedenți. Fiecare materie are sute de întrebări cu explicații detaliate, ideal pentru a-ți crește scorul la admiterea 2026.
        </p>
        <AdLeaderboard className="my-4" />
        <AdSlot className="my-6" />
        <h2 className="mt-2 mb-3 text-lg font-semibold">Materii disponibile</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 mt-6">
          {[...data.subjects]
            .sort((a: any, b: any) => String(a.name).localeCompare(String(b.name), "ro"))
            .map((s: any) => (
            <Link key={s.id} to="/quiz/$slug" params={{ slug: s.slug }}>
              <Card className="p-5 h-full transition hover:border-primary/40 hover:shadow">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex gap-3">
                    <BookOpen className="h-5 w-5 text-primary mt-1" />
                    <div>
                      <div className="font-semibold">{s.name}</div>
                      <div className="text-xs text-muted-foreground">{s.slug}</div>
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
        <AdInArticle />
        {/* Next-step CTAs to reduce bounce */}
        <section className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            { to: "/simulare" as const, icon: Trophy, t: `Simulare ${data.short_name ?? data.name}`, d: "30 de grile cronometrate, format de examen real." },
            { to: "/grila-zilei" as const, icon: Sparkles, t: "Grila zilei", d: "Exersează zilnic o întrebare nouă cu explicație." },
            { to: "/subiecte-admitere" as const, icon: FileText, t: "Subiecte din anii precedenți", d: "Arhivă PDF cu bareme oficiale." },
          ].map((c) => (
            <Link key={c.t} to={c.to}>
              <Card className="h-full p-5 transition hover:border-primary/40 hover:shadow-md">
                <div className="flex items-start gap-3">
                  <div className="rounded-md bg-primary/10 p-2"><c.icon className="h-4 w-4 text-primary" /></div>
                  <div>
                    <div className="font-semibold">{c.t}</div>
                    <p className="mt-1 text-sm text-muted-foreground">{c.d}</p>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </section>
        <section className="mt-10 max-w-3xl text-sm text-muted-foreground space-y-3">
          <h2 className="text-lg font-semibold text-foreground">Cum funcționează pregătirea pentru {data.short_name ?? data.name}</h2>
          <p>Alege o materie, rezolvă grilele cronometrat și primește explicații detaliate la fiecare răspuns. Statisticile tale rămân salvate, ca să vezi unde stai bine și unde trebuie să mai exersezi.</p>
          <p>Toate grilele sunt extrase din subiectele oficiale de admitere {data.short_name ?? data.name} și sunt actualizate constant pentru sesiunea 2026.</p>
        </section>
      </main>
    </div>
  );
}
