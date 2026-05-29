import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { listUniversities, listPopularSubjects } from "@/lib/db.functions";
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
  Sparkles,
  Timer,
  CheckCircle2,
  Lightbulb,
  Target,
  FileText,
  Flame,
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
  const popFn = useServerFn(listPopularSubjects);
  const { data: popular = [] } = useQuery({
    queryKey: ["popular-subjects"],
    queryFn: () => popFn({ data: { limit: 12 } }),
  });
  const navigate = useNavigate();
  const [selected, setSelected] = useState<string>("");

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero — split layout, navy gradient */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[var(--gradient-soft)]" />
        <div className="pointer-events-none absolute -top-32 -right-32 -z-10 h-[28rem] w-[28rem] rounded-full bg-primary-glow/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-40 -left-20 -z-10 h-[24rem] w-[24rem] rounded-full bg-primary/10 blur-3xl" />

        <div className="container mx-auto grid items-center gap-10 px-4 py-14 sm:py-20 lg:grid-cols-[1.05fr_1fr]">
          <div>
            <Badge variant="secondary" className="mb-5 inline-flex items-center gap-1.5 rounded-full border border-primary/15 bg-primary/5 px-3 py-1 text-primary">
              <Sparkles className="h-3.5 w-3.5" /> Sesiunea Admitere 2026
            </Badge>
            <h1 className="max-w-2xl text-4xl font-bold leading-[1.05] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Pregătire <span className="bg-[var(--gradient-hero)] bg-clip-text text-transparent">serioasă</span> pentru admiterea la facultate.
            </h1>
            <p className="mt-6 max-w-xl text-base sm:text-lg leading-relaxed text-muted-foreground">
              Grile reale UPB, UMF, UBB, ASE și 100+ universități — cu <strong className="text-foreground">rezolvare completă pas cu pas</strong>, formule LaTeX și simulări cronometrate în format de examen.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link to="/simulare">
                <Button size="lg" className="h-12 bg-[var(--gradient-hero)] px-6 text-base shadow-[var(--shadow-glow)] hover:opacity-95">
                  <Trophy className="mr-2 h-4 w-4" /> Începe o simulare
                </Button>
              </Link>
              <Link to="/grile">
                <Button size="lg" variant="outline" className="h-12 px-6 text-base">
                  Vezi grile pe materii <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-[oklch(0.62_0.16_155)]" /> 100% gratuit</span>
              <span className="inline-flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-[oklch(0.62_0.16_155)]" /> Rezolvări pas cu pas</span>
              <span className="inline-flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-[oklch(0.62_0.16_155)]" /> Format examen real</span>
            </div>
          </div>

          {/* Quick start card */}
          <Card className="relative w-full max-w-md justify-self-center p-6 shadow-[var(--shadow-elegant)] sm:p-7 lg:justify-self-end">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-[var(--gradient-hero)] text-white shadow-[var(--shadow-glow)]">
                <BookOpen className="h-5 w-5" />
              </div>
              <div>
                <div className="font-semibold">Începe în 10 secunde</div>
                <div className="text-xs text-muted-foreground">Alege universitatea ta</div>
              </div>
            </div>
            <div className="mt-5 space-y-2">
              <label className="text-sm font-medium">Universitate</label>
              <Select value={selected} onValueChange={setSelected}>
                <SelectTrigger className="w-full h-11"><SelectValue placeholder="ex. UPB — Informatică" /></SelectTrigger>
                <SelectContent className="max-h-80">
                  {unis.map((u: any) => (
                    <SelectItem key={u.id} value={u.slug}>{u.short_name} — {u.city}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              className="mt-5 w-full h-11 bg-[var(--gradient-hero)] shadow-[var(--shadow-glow)] hover:opacity-95"
              disabled={!selected}
              onClick={() => navigate({ to: "/grile/$uniSlug", params: { uniSlug: selected } })}
            >
              Începe testul <ArrowRight className="ml-2 h-4 w-4" />
            </Button>

            <div className="mt-6 grid grid-cols-3 gap-3 border-t border-border pt-5 text-center">
              {[
                { v: "74k+", l: "Grile" },
                { v: `${unis.length || 100}+`, l: "Universități" },
                { v: "10k+", l: "Studenți" },
              ].map((s) => (
                <div key={s.l}>
                  <div className="text-xl font-bold text-foreground">{s.v}</div>
                  <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{s.l}</div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </section>

      <main className="container mx-auto space-y-16 px-4 py-12">
        <AdLeaderboard className="my-2" />

        {/* Popular subjects — quick-start deep links to reduce bounce */}
        {popular.length > 0 && (
          <section>
            <div className="flex items-end justify-between gap-4">
              <div>
                <Badge variant="outline" className="mb-2"><Flame className="mr-1 h-3 w-3" /> Cele mai accesate</Badge>
                <h2 className="text-2xl font-bold sm:text-3xl">Materii populare — Începe într-un click</h2>
                <p className="mt-2 text-muted-foreground">Sari direct la grilele rezolvate cele mai cerute de candidați.</p>
              </div>
              <Link to="/grile" className="hidden sm:inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
                Vezi toate universitățile <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {popular.map((s: any) => (
                <Link key={s.id} to="/quiz/$slug" params={{ slug: s.slug }}>
                  <Card className="h-full p-4 transition hover:border-primary/40 hover:shadow-md">
                    <div className="flex items-start gap-3">
                      <div className="rounded-md bg-primary/10 p-2 mt-0.5"><BookOpen className="h-4 w-4 text-primary" /></div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate font-semibold">{s.name}</div>
                        <div className="text-xs text-muted-foreground truncate">
                          {s.universities?.short_name ?? ""}{s.universities?.city ? ` · ${s.universities.city}` : ""}
                        </div>
                      </div>
                      <Badge variant="secondary" className="shrink-0">{s.question_count}</Badge>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Cross-link strip to reduce bounce */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            { to: "/grila-zilei" as const, icon: Sparkles, t: "Grila zilei", d: "O întrebare nouă în fiecare zi, cu explicație." },
            { to: "/simulare" as const, icon: Trophy, t: "Simulare cronometrată", d: "30 de grile în format de examen real." },
            { to: "/subiecte-admitere" as const, icon: FileText, t: "Subiecte din anii precedenți", d: "Arhivă oficială cu bareme PDF." },
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