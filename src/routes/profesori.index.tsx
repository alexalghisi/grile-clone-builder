import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AdLeaderboard, AdSlot } from "@/components/AdSlot";
import { PROFESORI_MATERII } from "@/lib/profesori/data";
import { GraduationCap, Star, Users, BookOpen, CheckCircle2 } from "lucide-react";

const TITLE = "Profesori Meditații Online 2026 — Grile cu Profesori Verificați";
const DESCRIPTION =
  "Profesori de meditații online pentru admitere și BAC 2026. Profesori de matematică, română, biologie, chimie, fizică, informatică — grile rezolvate de profesori cu experiență. 100% gratuit.";
const URL = "https://grileadmitere.ro/profesori";

export const Route = createFileRoute("/profesori/")({
  head: () => ({
    meta: [
      { name: "twitter:card", content: "summary_large_image" },
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      {
        name: "keywords",
        content:
          "profesori, meditatii profesori, profesori online, profesori matematica, profesori romana, profesori biologie, profesori chimie, profesori fizica, profesori informatica, profesori admitere, profesori BAC, grile profesori, profesori UMF, profesori Politehnica, profesori ASE",
      },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { property: "og:url", content: URL },
    ],
    links: [{ rel: "canonical", href: URL }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: TITLE,
          description: DESCRIPTION,
          url: URL,
          inLanguage: "ro-RO",
          isPartOf: { "@type": "WebSite", name: "GrileAdmitere.ro", url: "https://grileadmitere.ro" },
          about: PROFESORI_MATERII.map((m) => ({ "@type": "Thing", name: `Profesori ${m.nume}` })),
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Acasă", item: "https://grileadmitere.ro/" },
            { "@type": "ListItem", position: 2, name: "Profesori", item: URL },
          ],
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: "Profesori pe materii",
          itemListElement: PROFESORI_MATERII.map((m, i) => ({
            "@type": "ListItem",
            position: i + 1,
            url: `https://grileadmitere.ro/profesori/${m.slug}`,
            name: `Profesori ${m.nume}`,
          })),
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: [
            {
              "@type": "Question",
              name: "Cum aleg profesori buni pentru admitere?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Caută profesori cu experiență în pregătirea admiterii la facultatea ta țintă. Pe GrileAdmitere.ro găsești profesori recomandați pentru UMF, UPB, UBB, ASE, plus mii de grile rezolvate de profesori cu explicații pas cu pas.",
              },
            },
            {
              "@type": "Question",
              name: "Profesorii fac meditații online sau fizic?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Majoritatea profesorilor noștri oferă meditații online (Zoom, Meet) și fizic. Grilele cu explicațiile profesorilor sunt disponibile 24/7 pe GrileAdmitere.ro.",
              },
            },
            {
              "@type": "Question",
              name: "Cât costă orele cu profesori particulari?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Tarifele profesorilor particulari variază între 80 și 250 lei/oră, în funcție de materie și experiență. Toate grilele de pe GrileAdmitere.ro sunt gratuite.",
              },
            },
            {
              "@type": "Question",
              name: "Profesorii ajută și cu grile de BAC?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Da. Toți profesorii noștri de matematică, română, biologie, istorie, geografie sau informatică acoperă programa de BAC și pregătesc elevii cu grile de BAC reale.",
              },
            },
          ],
        }),
      },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-10">
        <nav aria-label="Breadcrumb" className="mb-3 text-xs text-muted-foreground">
          <Link to="/" className="hover:underline">Acasă</Link>
          <span className="mx-1">/</span>
          <span>Profesori</span>
        </nav>

        <header className="max-w-4xl">
          <Badge variant="secondary" className="mb-3">Profesori verificați · Grile gratuite</Badge>
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
            Profesori meditații online 2026 — grile rezolvate de profesori cu experiență
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            <strong>Profesori</strong> de matematică, română, biologie, chimie, fizică și informatică, cu experiență la admitere și BAC.
            Învață cu <strong>grile</strong> reale explicate pas cu pas de profesori verificați — peste 50.000 de
            grile rezolvate, complet gratuit. Cel mai mare director de profesori particulari și grile online din România.
          </p>
          <div className="mt-5 flex flex-wrap gap-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><Users className="h-4 w-4 text-primary" /> 500+ profesori</span>
            <span className="flex items-center gap-1"><BookOpen className="h-4 w-4 text-primary" /> 50.000+ grile</span>
            <span className="flex items-center gap-1"><Star className="h-4 w-4 text-primary" /> 4.9/5 rating profesori</span>
            <span className="flex items-center gap-1"><CheckCircle2 className="h-4 w-4 text-primary" /> 100% gratuit</span>
          </div>
        </header>

        <AdLeaderboard className="my-8" />

        <section aria-labelledby="materii" className="mt-6">
          <h2 id="materii" className="text-2xl font-bold">Profesori pe materii — toate disciplinele</h2>
          <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
            Alege materia ta și descoperă profesori specializați + sute de grile rezolvate de profesori pentru
            admitere și BAC 2026.
          </p>
          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {PROFESORI_MATERII.map((m) => (
              <Link key={m.slug} to="/profesori/$materie" params={{ materie: m.slug }}>
                <Card className="p-5 h-full transition hover:border-primary/40 hover:shadow">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{m.emoji}</span>
                    <div className="min-w-0">
                      <div className="font-semibold">Profesori {m.nume}</div>
                      <div className="mt-1 text-xs text-muted-foreground line-clamp-3">{m.intro}</div>
                      <div className="mt-2 text-xs font-medium text-primary">
                        Vezi profesori & grile {m.nume.toLowerCase()} →
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        <AdSlot className="my-8" />

        <section className="mt-10 grid gap-6 md:grid-cols-2">
          <Card className="p-6">
            <h2 className="text-xl font-bold">De ce profesorii aleg GrileAdmitere.ro</h2>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>✅ Profesorii pot publica grile cu explicațiile lor și pot ajunge la mii de elevi.</li>
              <li>✅ Profesorii primesc cereri de meditații direct de la elevi pregătiți pentru admitere.</li>
              <li>✅ Profesorii cu cele mai bune grile apar pe paginile de top: <Link to="/grile" className="underline">grile admitere</Link>, <Link to="/subiecte-bac" className="underline">grile BAC</Link>.</li>
            </ul>
          </Card>
          <Card className="p-6">
            <h2 className="text-xl font-bold">De ce elevii caută profesori la noi</h2>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>🎯 Profesori specializați pe admitere UMF, UPB, UBB, ASE, UAIC.</li>
              <li>📚 Grile reale + grile explicate de profesori, organizate pe materii și ani.</li>
              <li>💸 Acces gratuit la mii de grile rezolvate de profesori — fără abonament.</li>
            </ul>
          </Card>
        </section>

        <section className="mt-10 max-w-4xl">
          <h2 className="text-2xl font-bold">Grile create și explicate de profesori — cum funcționează</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-3 text-sm">
            <Card className="p-5">
              <GraduationCap className="h-6 w-6 text-primary" />
              <h3 className="mt-2 font-semibold">1. Profesori verificați</h3>
              <p className="mt-1 text-muted-foreground">Profesorii din rețea sunt verificați — au experiență dovedită la admitere și BAC.</p>
            </Card>
            <Card className="p-5">
              <BookOpen className="h-6 w-6 text-primary" />
              <h3 className="mt-2 font-semibold">2. Grile + explicații</h3>
              <p className="mt-1 text-muted-foreground">Fiecare grilă vine cu raționamentul complet al profesorului — nu doar răspunsul.</p>
            </Card>
            <Card className="p-5">
              <Star className="h-6 w-6 text-primary" />
              <h3 className="mt-2 font-semibold">3. Feedback de la elevi</h3>
              <p className="mt-1 text-muted-foreground">Elevii votează grilele profesorilor → cele mai bune urcă în top.</p>
            </Card>
          </div>
        </section>

        <section className="mt-10 max-w-4xl">
          <h2 className="text-2xl font-bold">Întrebări frecvente despre profesori și grile</h2>
          <div className="mt-4 space-y-4 text-sm">
            {[
              {
                q: "Cum aleg profesori buni pentru admitere 2026?",
                a: "Caută profesori cu experiență la facultatea ta țintă. Profesorii din rețeaua GrileAdmitere.ro sunt clasați pe baza grilelor publicate și a feedback-ului elevilor.",
              },
              {
                q: "Profesorii fac meditații online?",
                a: "Da, marea majoritate a profesorilor oferă meditații online (Zoom / Meet) plus acces la grilele rezolvate publicate pe platformă.",
              },
              {
                q: "Cât costă orele cu profesori particulari?",
                a: "Profesorii particulari practică între 80 și 250 lei/oră. Grilele explicate de profesori sunt 100% gratuite pe GrileAdmitere.ro.",
              },
              {
                q: "Profesorii acoperă și BAC, nu doar admitere?",
                a: "Da. Profesorii noștri lucrează atât pentru admitere, cât și pentru BAC — cu grile separate pe fiecare examen.",
              },
            ].map((f) => (
              <Card key={f.q} className="p-5">
                <h3 className="font-semibold">{f.q}</h3>
                <p className="mt-1 text-muted-foreground">{f.a}</p>
              </Card>
            ))}
          </div>
        </section>

        <section className="mt-10 rounded-xl border bg-muted/30 p-6 text-sm text-muted-foreground">
          <h2 className="text-lg font-bold text-foreground">Profesori și grile — totul într-un loc</h2>
          <p className="mt-2">
            GrileAdmitere.ro este platforma unde <strong>profesori</strong> publică <strong>grile</strong> și
            <strong> elevi</strong> învață eficient. Profesorii de matematică, română, biologie, chimie, fizică,
            informatică, anatomie, istorie sau economie folosesc grilele pentru a-și prezenta metoda de predare. Elevii
            găsesc profesori potriviți și grile rezolvate de profesori — totul gratuit, pentru admitere și BAC 2026.
          </p>
        </section>
      </main>
    </div>
  );
}