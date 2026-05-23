import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { listUniversities } from "@/lib/db.functions";
import { Header } from "@/components/Header";
import { AdSlot, AdLeaderboard } from "@/components/AdSlot";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  GraduationCap,
  BookOpen,
  Trophy,
  ArrowRight,
  Star,
  Sparkles,
  Timer,
  CheckCircle2,
  Lightbulb,
  Target,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Grile Admitere 2026 cu Explicații Pas cu Pas" },
      { name: "description", content: "Grile admitere și BAC 2026 cu explicații detaliate pas cu pas. UPB, UBB, UTCN, UMF, UAIC, ASE și 100+ universități din România." },
      { property: "og:title", content: "Grile Admitere 2026 cu Explicații Pas cu Pas" },
      { property: "og:description", content: "Singurul site de grile online care îți arată DE CE ai greșit. UPB, UBB, UTCN, UMF, ASE și 100+ universități." },
      { property: "og:url", content: "https://grileadmitere.ro/" },
    ],
    links: [{ rel: "canonical", href: "https://grileadmitere.ro/" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: [
            {
              "@type": "Question",
              name: "Cum mă pregătesc pentru admiterea la facultate 2026?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Pe GrileAdmitere.ro găsești 74.000+ grile rezolvate pas cu pas pentru UMF, UPB, UBB, ASE și 100+ universități, complet gratuit.",
              },
            },
            {
              "@type": "Question",
              name: "Grilele de admitere sunt gratuite?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Da, toate grilele de admitere și simulările BAC de pe GrileAdmitere.ro sunt 100% gratuite.",
              },
            },
            {
              "@type": "Question",
              name: "Pentru ce universități am grile?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Avem grile pentru UMF (București, Cluj, Iași, Timișoara), UPB, UBB, ASE, UAIC, UTCN și 100+ universități din România.",
              },
            },
          ],
        }),
      },
    ],
  }),
  component: Index,
});

function Index() {
  const fn = useServerFn(listUniversities);
  const { data: unis = [] } = useQuery({ queryKey: ["unis"], queryFn: () => fn() });
  const navigate = useNavigate();
  const [selected, setSelected] = useState<string>("");

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border bg-gradient-to-br from-primary/10 via-background to-background">
        <div className="container mx-auto px-4 py-12 sm:py-20 text-center">
          <Badge variant="secondary" className="mb-5 inline-flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5" /> Sesiunea de Admitere 2026
          </Badge>
          <h1 className="mx-auto max-w-4xl text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
            Grile Admitere 2026{" "}
            <span className="bg-gradient-to-r from-primary to-sky-400 bg-clip-text text-transparent">
              cu Explicații Pas cu Pas
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base sm:text-lg text-muted-foreground">
            Singurul site de <strong className="text-foreground">grile online</strong> care îți arată{" "}
            <strong className="text-foreground">DE CE ai greșit</strong> și îți oferă{" "}
            <strong className="text-foreground">rezolvarea completă pas cu pas</strong> — grile cu explicații detaliate pentru fiecare greșeală.
          </p>
          <p className="mx-auto mt-3 max-w-2xl text-sm sm:text-base text-muted-foreground">
            <strong className="text-foreground">Grile admitere</strong>, <strong className="text-foreground">grile medicină</strong> și grile BAC 2026 — UPB, UBB, UTCN, UMF, UAIC, ASE, UPT și 100+ universități din România.
          </p>
          <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-amber-300/40 bg-amber-50 px-4 py-2 text-sm font-medium text-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
            <Star className="h-4 w-4 fill-current" />
            Grile cu explicații detaliate — nu doar răspunsul corect!
          </div>

          {/* Începe acum card */}
          <Card className="mx-auto mt-10 max-w-xl p-6 text-left shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-primary/10 p-2.5">
                <BookOpen className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="font-semibold">Începe acum</div>
                <div className="text-xs text-muted-foreground">Selectează universitatea dorită</div>
              </div>
            </div>
            <div className="mt-5 space-y-2">
              <label className="text-sm font-medium">Universitate</label>
              <Select value={selected} onValueChange={setSelected}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Alege universitatea" />
                </SelectTrigger>
                <SelectContent className="max-h-80">
                  {unis.map((u: any) => (
                    <SelectItem key={u.id} value={u.slug}>
                      {u.short_name} — {u.city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              className="mt-5 w-full"
              size="lg"
              disabled={!selected}
              onClick={() => navigate({ to: "/grile/$uniSlug", params: { uniSlug: selected } })}
            >
              Începe Testul <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Card>

          {/* Stats */}
          <div className="mx-auto mt-12 grid max-w-3xl grid-cols-2 gap-6 sm:grid-cols-4">
            {[
              { v: "74k+", l: "Întrebări" },
              { v: `${unis.length}+`, l: "Universități" },
              { v: "10k+", l: "Utilizatori" },
              { v: "95%", l: "Satisfacție" },
            ].map((s) => (
              <div key={s.l}>
                <div className="text-2xl font-bold text-primary sm:text-3xl">{s.v}</div>
                <div className="text-xs text-muted-foreground sm:text-sm">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <main className="container mx-auto space-y-16 px-4 py-12">
        <AdLeaderboard className="my-2" />
        <AdSlot />

        {/* Simulare */}
        <section className="rounded-2xl border border-border bg-gradient-to-br from-primary/5 via-background to-background p-6 sm:p-10">
          <Badge variant="outline" className="mb-3"><Timer className="mr-1 h-3 w-3" /> Simulare examen 2026</Badge>
          <h2 className="text-2xl font-bold sm:text-3xl">Simulare Admitere — Test Cronometrat Gratuit</h2>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Simulare admitere UPB, UBB, UTCN, UMF și 100+ universități. 30 de grile cu cronometru, în format identic cu examenul real. Feedback instant cu explicații la fiecare greșeală.
          </p>
          <Link to="/simulare">
            <Button size="lg" className="mt-6"><Trophy className="mr-2 h-4 w-4" /> Începe o simulare gratuită</Button>
          </Link>
        </section>

        {/* Why */}
        <section>
          <div className="text-center">
            <h2 className="text-2xl font-bold sm:text-3xl">De ce grilele cu explicații de pe GrileAdmitere sunt diferite?</h2>
            <p className="mt-3 text-muted-foreground">Singurul site de grile cu explicații care te învață din greșeli, nu doar te testează</p>
          </div>
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {[
              { icon: Lightbulb, t: "Grile cu explicații complete", d: "La fiecare răspuns greșit, primești explicația detaliată pas cu pas: de ce ai greșit, care este rezolvarea corectă și ce concept trebuie aprofundat." },
              { icon: CheckCircle2, t: "Grile actualizate 2026", d: "Grile cu explicații aliniate cu programa oficială de admitere 2026 pentru fiecare universitate: UPB, UBB, UTCN, UMF și altele." },
              { icon: Target, t: "Nivel de examen real", d: "Întrebări dificile similare cu cele de la examenele reale, cu feedback instant, explicații detaliate și progres vizibil." },
            ].map((f) => (
              <Card key={f.t} className="p-6">
                <div className="mb-4 inline-flex rounded-lg bg-primary/10 p-2.5">
                  <f.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold">{f.t}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{f.d}</p>
              </Card>
            ))}
          </div>
        </section>

        <AdLeaderboard />
        <AdSlot />

        {/* Universities */}
        <section>
          <div className="text-center">
            <h2 className="text-2xl font-bold sm:text-3xl">Universități Disponibile</h2>
            <p className="mt-3 text-muted-foreground">Alege universitatea și începe pregătirea pentru admitere</p>
          </div>
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {unis.map((u: any) => (
              <Link key={u.id} to="/grile/$uniSlug" params={{ uniSlug: u.slug }}>
                <Card className="h-full p-4 transition hover:border-primary/40 hover:shadow-md">
                  <div className="flex items-start gap-3">
                    <div className="rounded-md bg-primary/10 p-2"><GraduationCap className="h-4 w-4 text-primary" /></div>
                    <div className="min-w-0">
                      <div className="truncate font-semibold">{u.short_name}</div>
                      <div className="text-xs text-muted-foreground">{u.city}</div>
                      <div className="mt-1 text-xs text-muted-foreground">{u.subject_count} facultăți</div>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">
        © 2026 GrileAdmitere.ro — Grile cu explicații pas cu pas
      </footer>
    </div>
  );
}