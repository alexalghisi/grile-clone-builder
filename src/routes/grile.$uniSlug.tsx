import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { getUniversity } from "@/lib/db.functions";
import { Header } from "@/components/Header";
import { Card } from "@/components/ui/card";
import { AdSlot, AdLeaderboard, AdInArticle } from "@/components/AdSlot";
import { BookOpen, Trophy, Sparkles, FileText } from "lucide-react";

export const Route = createFileRoute("/grile/$uniSlug")({
  loader: async ({ params }) => {
    const u = await getUniversity({ data: { slug: params.uniSlug } });
    if (!u) throw notFound();
    return u;
  },
  staleTime: 5 * 60 * 1000,
  head: ({ params, loaderData }) => {
    const slug = params.uniSlug;
    const u = loaderData as any;
    const SLUG = String(u?.short_name ?? slug.toUpperCase()).replace(/\s*20\d\d\s*$/, "").trim();
    const subjects = (u?.subjects ?? []) as Array<{ name: string; slug: string; question_count?: number }>;
    const totalQ = subjects.reduce((a, s) => a + (s.question_count ?? 0), 0);
    const materii = subjects.slice(0, 4).map((s) => s.name).join(", ");
    const title = `Grile Admitere ${SLUG} 2026 Rezolvate — ${subjects.length ? `${subjects.length} Materii` : "Toate Materiile"} | GrileAdmitere.ro`;
    const descriptionFull = `Grile admitere ${SLUG} 2026 rezolvate pas cu pas${materii ? ` la ${materii}` : ""}${totalQ ? ` — ${totalQ}+ întrebări` : ""} cu explicații la fiecare răspuns. Gratuit, nelimitat, cu simulări cronometrate.`;
    const description = descriptionFull.length <= 158 ? descriptionFull : descriptionFull.slice(0, 155).replace(/\s+\S*$/, "") + "…";
    return {
      meta: [
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: description },
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
            about: { "@type": "EducationalOrganization", name: u?.name ?? SLUG, url: `https://grileadmitere.ro/grile/${slug}` },
            isPartOf: { "@type": "WebSite", name: "GrileAdmitere.ro", url: "https://grileadmitere.ro" },
            hasPart: subjects.slice(0, 50).map((s) => ({ "@type": "Quiz", name: `Grile ${s.name} ${SLUG}`, url: `https://grileadmitere.ro/quiz/${s.slug}` })),
          }),
        },
      ],
    };
  },
  notFoundComponent: () => (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto max-w-2xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold">Universitate negăsită</h1>
        <Link to="/grile" className="mt-6 inline-block underline">Vezi toate universitățile</Link>
      </main>
    </div>
  ),
  component: Page,
});

function Page() {
  const { uniSlug } = Route.useParams();
  const loaded = Route.useLoaderData();
  const fn = useServerFn(getUniversity);
  const { data, isLoading } = useQuery({ queryKey: ["uni", uniSlug], queryFn: () => fn({ data: { slug: uniSlug } }), initialData: loaded, staleTime: 5 * 60 * 1000 });

  if (isLoading) return (<div className="min-h-screen bg-background"><Header /><div className="container py-10">Se încarcă…</div></div>);
  if (!data) return (<div className="min-h-screen bg-background"><Header /><div className="container py-10">Universitate negăsită.</div></div>);
  const uniName = String(data.short_name ?? data.name).replace(/\s*20\d\d\s*$/, "").trim();

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
        <h1 className="mt-2 text-3xl font-bold">Grile Admitere {uniName} 2026 — Rezolvate Pas cu Pas</h1>
        <p className="text-muted-foreground">{data.city} · pregătire gratuită pentru admitere</p>
        {data.description && <p className="mt-4 max-w-2xl text-sm text-muted-foreground">{data.description}</p>}
        <p className="mt-3 max-w-3xl text-sm text-muted-foreground">
          Exersează gratuit cu grilele de admitere {uniName} din anii precedenți. Fiecare materie are sute de întrebări cu explicații detaliate, ideal pentru a-ți crește scorul la admiterea 2026.
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
                      <div className="font-semibold">Grile {s.name}</div>
                      <div className="text-xs text-muted-foreground">{s.question_count ? `${s.question_count} întrebări rezolvate` : "grile cu explicații"}</div>
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
            { to: "/simulare" as const, icon: Trophy, t: `Simulare ${uniName}`, d: "30 de grile cronometrate, format de examen real." },
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
          <h2 className="text-lg font-semibold text-foreground">Cum funcționează pregătirea pentru {uniName}</h2>
          <p>Alege o materie, rezolvă grilele cronometrat și primește explicații detaliate la fiecare răspuns. Statisticile tale rămân salvate, ca să vezi unde stai bine și unde trebuie să mai exersezi.</p>
          <p>Toate grilele sunt extrase din subiectele oficiale de admitere {uniName} și sunt actualizate constant pentru sesiunea 2026.</p>
        </section>
      </main>
    </div>
  );
}
