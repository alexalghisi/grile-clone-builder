import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { listSimulations } from "@/lib/db.functions";
import { Header } from "@/components/Header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trophy, Clock, ArrowRight } from "lucide-react";
import { AdLeaderboard, AdInArticle, AdSlot } from "@/components/AdSlot";

export const Route = createFileRoute("/simulare")({
  head: () => ({
    meta: [
      { title: "Simulare Admitere 2026 Gratuit — UPB, UMF, UBB, ASE, UAIC | GrileAdmitere" },
      { name: "description", content: "Simulare admitere 2026 gratuită cronometrată — UPB, UMF (Carol Davila, Cluj, Iași, Timișoara), UBB, ASE, UAIC, UTCN. 6 variante A–F, LaTeX, figuri, feedback instant și rezolvare pas cu pas. Format identic cu examenul real." },
      { name: "keywords", content: "simulare admitere, simulare admitere 2026, simulare UPB, simulare UMF, simulare UBB, simulare ASE, simulare UAIC, simulare UTCN, simulare medicina, simulare politehnica, simulare informatica, test admitere, test admitere online, grile cronometrate, simulare grile" },
      { property: "og:title", content: "Simulare Admitere 2026 — Cronometrată, Gratuită, cu Rezolvări" },
      { property: "og:description", content: "Simulări admitere UPB, UMF, UBB, ASE, UAIC — format real, cronometrate, cu rezolvări pas cu pas. 100% gratuit." },
      { property: "og:url", content: "https://grileadmitere.ro/simulare" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://grileadmitere.ro/simulare" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Acasă", item: "https://grileadmitere.ro/" },
            { "@type": "ListItem", position: 2, name: "Simulări Admitere", item: "https://grileadmitere.ro/simulare" },
          ],
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Course",
          name: "Simulare Admitere 2026",
          description: "Simulări cronometrate pentru admiterea 2026 la UPB, UMF, UBB, ASE, UAIC, UTCN.",
          provider: { "@type": "EducationalOrganization", name: "GrileAdmitere.ro", url: "https://grileadmitere.ro" },
          educationalLevel: "Higher Education",
          inLanguage: "ro-RO",
          isAccessibleForFree: true,
          offers: { "@type": "Offer", price: "0", priceCurrency: "RON" },
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: [
            { "@type": "Question", name: "Cât durează o simulare de admitere?", acceptedAnswer: { "@type": "Answer", text: "Fiecare simulare are între 60 și 180 minute, în funcție de universitate — durata este identică cu examenul real de admitere." } },
            { "@type": "Question", name: "Simulările sunt gratuite?", acceptedAnswer: { "@type": "Answer", text: "Da. Toate simulările admitere 2026 pentru UPB, UMF, UBB, ASE, UAIC, UTCN sunt 100% gratuite pe GrileAdmitere.ro." } },
            { "@type": "Question", name: "Primesc rezolvări pas cu pas?", acceptedAnswer: { "@type": "Answer", text: "Da. La finalul simulării vezi scorul, timpul și rezolvarea completă pas cu pas la fiecare grilă." } },
          ],
        }),
      },
    ],
  }),
  component: SimulationLayout,
});

function SimulationLayout() {
  const pathname = useRouterState({ select: state => state.location.pathname });
  return pathname.replace(/\/$/, "") === "/simulare" ? <Page /> : <Outlet />;
}

function Page() {
  const fn = useServerFn(listSimulations);
  const { data: sims = [], isLoading } = useQuery({
    queryKey: ["simulations"],
    queryFn: () => fn(),
    staleTime: 5 * 60 * 1000,
  });

  return (
    <div className="min-h-screen bg-background"><Header />
      <main className="container mx-auto max-w-5xl px-4 py-12">
        <div className="text-center mb-10">
          <Trophy className="mx-auto h-12 w-12 text-primary" />
          <h1 className="mt-4 text-3xl md:text-4xl font-bold">Simulări admitere 2026</h1>
          <p className="mt-2 text-muted-foreground max-w-xl mx-auto">
            Format real: 6 variante A–F, formule matematice, figuri, cronometru. Rezolvare pas cu pas la final.
          </p>
        </div>

        <AdLeaderboard className="mb-8" />

        {isLoading ? (
          <div className="text-center text-muted-foreground py-12">Se încarcă simulările…</div>
        ) : sims.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground">Simulările sunt în pregătire. Revino curând!</p>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {sims.map((s: any) => (
              <Card key={s.id} className="p-6 transition hover:border-primary/40 hover:shadow-md">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex flex-wrap items-center gap-2">
                    {s.universities?.short_name && <Badge variant="outline">{s.universities.short_name}</Badge>}
                    {s.session && <Badge variant="secondary">{s.session}</Badge>}
                  </div>
                </div>
                <h2 className="text-lg font-bold">{s.title}</h2>
                {s.description && <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{s.description}</p>}
                <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1"><Clock className="h-4 w-4" />{s.duration_minutes} min</span>
                  <span className="flex items-center gap-1"><Trophy className="h-4 w-4" />{s.total_questions} probleme</span>
                </div>
                <Button asChild className="mt-4 w-full">
                  <Link to="/simulare/$slug" params={{ slug: s.slug }}>Începe <ArrowRight className="ml-2 h-4 w-4" /></Link>
                </Button>
              </Card>
            ))}
          </div>
        )}

        <AdInArticle />

        <section className="mt-12 max-w-3xl text-sm text-muted-foreground space-y-3">
          <h2 className="text-xl font-semibold text-foreground">Cum funcționează simularea admitere 2026</h2>
          <p>Fiecare <strong>simulare admitere</strong> reproduce fidel proba reală: număr de întrebări, timp, format A–F, formule matematice și figuri. La final primești scorul, timpul și <strong>rezolvarea pas cu pas</strong> la fiecare grilă.</p>
          <p>Recomandăm să dai <strong>2–3 simulări pe săptămână</strong> în lunile premergătoare admiterii — este cel mai eficient mod de a-ți antrena ritmul și de a scoate în evidență capitolele slabe.</p>
        </section>
        <AdSlot className="my-6" />
      </main>
    </div>
  );
}
