import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { getSimulation } from "@/lib/db.functions";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { QuestionContent } from "@/components/QuestionContent";
import { Clock, CheckCircle2, XCircle, Trophy, Lock, AlertTriangle } from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";
import { UpgradeModal } from "@/components/UpgradeModal";
import { StripeEmbeddedCheckout } from "@/components/StripeEmbeddedCheckout";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sparkles } from "lucide-react";
import { AdInArticle } from "@/components/AdSlot";

export const Route = createFileRoute("/simulare/$slug")({
  head: ({ params }) => {
    const title = `Simulare ${params.slug} — Admitere 2026 | GrileAdmitere.ro`;
    return {
      meta: [
        { title },
        { name: "description", content: `Simulare admitere cronometrată în format real. Subiecte cu 6 variante, formule matematice și figuri, rezolvare pas cu pas.` },
        { property: "og:title", content: title },
      ],
      links: [{ rel: "canonical", href: `https://grileadmitere.ro/simulare/${params.slug}` }],
    };
  },
  component: Page,
});

type Q = {
  id: string;
  question_text: string;
  options: string[];
  correct_index: number;
  explanation: string | null;
  solution_md?: string | null;
  figure_url?: string | null;
  problem_number?: number | null;
};

function Page() {
  const { slug } = Route.useParams();
  const fn = useServerFn(getSimulation);
  const { data, isLoading } = useQuery({
    queryKey: ["sim", slug],
    queryFn: () => fn({ data: { slug } }),
    staleTime: 5 * 60 * 1000,
  });

  const [started, setStarted] = useState(false);
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [done, setDone] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [showReview, setShowReview] = useState<string | null>(null);
  const { isActive: isPremium, userId } = useSubscription();
  const [hasOneTime, setHasOneTime] = useState(false);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [oneTimeOpen, setOneTimeOpen] = useState(false);
  const [email, setEmail] = useState<string | undefined>();

  useEffect(() => {
    if (!userId) return;
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? undefined));
    supabase.from("simulation_purchases").select("id").eq("user_id", userId).eq("simulation_slug", slug).limit(1)
      .then(({ data }) => setHasOneTime(!!data && data.length > 0));
  }, [userId, slug]);

  const questions = useMemo(() => (data?.questions ?? []) as Q[], [data]);
  const sim = data?.simulation as any;

  useEffect(() => {
    if (sim && !started) setSeconds(sim.duration_minutes * 60);
  }, [sim, started]);

  useEffect(() => {
    if (!started || done) return;
    const t = setInterval(() => {
      setSeconds((s) => {
        if (s <= 1) { setDone(true); return 0; }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [started, done]);

  useEffect(() => {
    if (!done || !sim) return;
    const score = questions.reduce((acc, q) => acc + (answers[q.id] === q.correct_index ? 1 : 0), 0);
    supabase.auth.getUser().then(({ data: u }) => {
      if (u.user) {
        supabase.from("attempts").insert({
          user_id: u.user.id,
          subject_id: sim.subjects?.id ?? null,
          university_id: sim.universities?.id ?? null,
          score,
          total: questions.length,
          time_seconds: sim.duration_minutes * 60 - seconds,
          mode: "simulation",
          answers,
        });
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done]);

  if (isLoading) return (
    <div className="min-h-screen bg-background"><Header />
      <div className="container py-10">Se încarcă simularea…</div>
    </div>
  );

  if (!data || !sim) return (
    <div className="min-h-screen bg-background"><Header />
      <main className="container mx-auto max-w-xl px-4 py-16 text-center">
        <AlertTriangle className="mx-auto h-12 w-12 text-muted-foreground" />
        <h1 className="mt-4 text-2xl font-bold">Simulare indisponibilă</h1>
        <p className="mt-2 text-muted-foreground">Nu am găsit această simulare.</p>
        <Link to="/simulare"><Button className="mt-6">Vezi simulările</Button></Link>
      </main>
    </div>
  );

  // Pre-start screen
  if (!started && !done) {
    const locked = sim.is_premium && !isPremium && !hasOneTime;
    return (
      <div className="min-h-screen bg-background"><Header />
        <main className="container mx-auto max-w-2xl px-4 py-12">
          <Card className="p-8">
            <div className="flex items-center gap-2 mb-3">
              {sim.is_premium && <Badge className="bg-amber-500 text-white"><Lock className="mr-1 h-3 w-3" /> Premium</Badge>}
              {sim.session && <Badge variant="secondary">{sim.session}</Badge>}
              {sim.universities?.short_name && <Badge variant="outline">{sim.universities.short_name}</Badge>}
            </div>
            <h1 className="text-3xl font-bold">{sim.title}</h1>
            {sim.description && <p className="mt-3 text-muted-foreground">{sim.description}</p>}

            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="rounded-lg border bg-card p-4">
                <div className="text-xs uppercase tracking-wider text-muted-foreground">Durată</div>
                <div className="mt-1 text-2xl font-bold flex items-center gap-2"><Clock className="h-5 w-5 text-primary" />{sim.duration_minutes} min</div>
              </div>
              <div className="rounded-lg border bg-card p-4">
                <div className="text-xs uppercase tracking-wider text-muted-foreground">Probleme</div>
                <div className="mt-1 text-2xl font-bold flex items-center gap-2"><Trophy className="h-5 w-5 text-primary" />{questions.length}</div>
              </div>
            </div>

            <div className="mt-6 rounded-md border border-amber-500/30 bg-amber-50 dark:bg-amber-950/20 p-4 text-sm">
              <strong>Reguli:</strong> simularea este cronometrată. La final primești scorul și poți revedea fiecare problemă cu rezolvarea pas cu pas. Nu poți să o pauzezi.
            </div>

            {locked ? (
              <div className="mt-6 space-y-3">
                <Button
                  size="lg"
                  className="w-full [background-image:var(--gradient-hero)] shadow-[var(--shadow-glow)] hover:opacity-95"
                  onClick={() => userId ? setUpgradeOpen(true) : (window.location.href = "/autentificare")}
                >
                  <Sparkles className="mr-2 h-4 w-4" /> Deblochează Premium (50 RON/lună)
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full"
                  onClick={() => userId ? setOneTimeOpen(true) : (window.location.href = "/autentificare")}
                >
                  Sau plătește 30 RON doar pentru această simulare
                </Button>
              </div>
            ) : (
              <Button
                size="lg"
                className="mt-6 w-full"
                disabled={!questions.length}
                onClick={() => setStarted(true)}
              >
                {questions.length ? "Începe simularea" : "Nu sunt încă probleme adăugate"}
              </Button>
            )}
          </Card>

          <UpgradeModal open={upgradeOpen} onClose={() => setUpgradeOpen(false)} />
          <Dialog open={oneTimeOpen} onOpenChange={setOneTimeOpen}>
            <DialogContent className="max-w-2xl p-0 overflow-hidden">
              <DialogHeader className="px-6 pt-6 pb-2">
                <DialogTitle>Cumpără această simulare (30 RON)</DialogTitle>
              </DialogHeader>
              <div className="p-2">
                {oneTimeOpen && userId && (
                  <StripeEmbeddedCheckout
                    priceId="single_simulation_ron"
                    userId={userId}
                    customerEmail={email}
                    simulationSlug={slug}
                    returnUrl={`${window.location.origin}/simulare/${slug}?purchased=1`}
                  />
                )}
              </div>
            </DialogContent>
          </Dialog>
        </main>
      </div>
    );
  }

  // Results screen
  if (done) {
    const score = questions.reduce((acc, q) => acc + (answers[q.id] === q.correct_index ? 1 : 0), 0);
    const pct = questions.length ? Math.round((score / questions.length) * 100) : 0;
    const reviewQ = showReview ? questions.find((q) => q.id === showReview) : null;

    if (reviewQ) {
      const sel = answers[reviewQ.id];
      return (
        <div className="min-h-screen bg-background"><Header />
          <main className="container mx-auto max-w-3xl px-4 py-8">
            <Button variant="ghost" onClick={() => setShowReview(null)} className="mb-4">← Înapoi la rezultate</Button>
            <Card className="p-6">
              <Badge variant="secondary" className="mb-3">Problema {reviewQ.problem_number ?? questions.indexOf(reviewQ) + 1}</Badge>
              <QuestionContent text={reviewQ.question_text} figureUrl={reviewQ.figure_url} />
              <div className="mt-5 space-y-2">
                {reviewQ.options.map((opt, i) => {
                  const isCorrect = i === reviewQ.correct_index;
                  const isSel = sel === i;
                  const cls = isCorrect
                    ? "border-green-600 bg-green-50 dark:bg-green-950/30"
                    : isSel ? "border-destructive bg-destructive/10" : "opacity-70";
                  return (
                    <div key={i} className={`flex items-start gap-3 rounded-md border p-3 text-sm ${cls}`}>
                      <span className="font-bold text-primary">{String.fromCharCode(65 + i)})</span>
                      <span className="flex-1"><QuestionContent text={opt} className="[&_p]:my-0" /></span>
                    </div>
                  );
                })}
              </div>
              <div className="mt-5 rounded-md border border-green-600/40 bg-green-50 dark:bg-green-950/20 p-4">
                <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Rezolvare pas cu pas</div>
                {reviewQ.solution_md?.trim()
                  ? <QuestionContent text={reviewQ.solution_md} />
                  : reviewQ.explanation?.trim()
                    ? <div className="whitespace-pre-wrap">{reviewQ.explanation}</div>
                    : <div className="text-muted-foreground italic">Rezolvarea va fi adăugată curând.</div>}
              </div>
            </Card>
          </main>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-background"><Header />
        <main className="container mx-auto max-w-2xl px-4 py-10">
          <Card className="p-8 text-center">
            <Trophy className="mx-auto h-12 w-12 text-primary" />
            <h1 className="mt-4 text-2xl font-bold">Simulare terminată</h1>
            <div className="my-6 text-6xl font-bold text-primary">{score}/{questions.length}</div>
            <Progress value={pct} className="mb-2" />
            <p className="text-sm text-muted-foreground">{pct}%</p>
          </Card>
          <AdInArticle />
          <div className="mt-6 space-y-2">
            {questions.map((q, i) => {
              const ok = answers[q.id] === q.correct_index;
              return (
                <button
                  key={q.id}
                  onClick={() => setShowReview(q.id)}
                  className="flex w-full items-center gap-3 rounded-md border bg-card p-3 text-left text-sm transition hover:border-primary/40"
                >
                  {ok ? <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" /> : <XCircle className="h-5 w-5 text-destructive shrink-0" />}
                  <span className="font-semibold">Problema {q.problem_number ?? i + 1}</span>
                  <span className="ml-auto text-xs text-muted-foreground">Vezi rezolvarea →</span>
                </button>
              );
            })}
          </div>
        </main>
      </div>
    );
  }

  // Active simulation
  const q = questions[idx];
  if (!q) return null;
  const sel = answers[q.id];
  const timeLow = seconds < 300;

  return (
    <div className="min-h-screen bg-background"><Header />
      <main className="container mx-auto max-w-3xl px-4 py-6">
        <div className="sticky top-2 z-10 mb-4 flex items-center justify-between rounded-lg border bg-background/95 backdrop-blur px-4 py-2 shadow-sm">
          <div className="text-sm font-medium">{sim.title}</div>
          <div className={`flex items-center gap-1 font-mono text-lg font-bold ${timeLow ? "text-destructive animate-pulse" : "text-foreground"}`}>
            <Clock className="h-5 w-5" />
            {String(Math.floor(seconds/60)).padStart(2,"0")}:{String(seconds%60).padStart(2,"0")}
          </div>
        </div>
        <Progress value={((idx + 1) / questions.length) * 100} className="mb-6" />

        <Card className="p-6">
          <Badge variant="secondary" className="mb-3">Problema {q.problem_number ?? idx + 1} / {questions.length}</Badge>
          <div className="text-base leading-relaxed">
            <QuestionContent text={q.question_text} figureUrl={q.figure_url} />
          </div>
          <div className="mt-5 space-y-2">
            {q.options.map((opt, i) => {
              const isSel = sel === i;
              return (
                <button
                  key={i}
                  onClick={() => setAnswers({ ...answers, [q.id]: i })}
                  className={`flex w-full items-start gap-3 rounded-md border p-3 text-left text-sm transition ${isSel ? "border-primary bg-primary/5" : "hover:border-primary/40"}`}
                >
                  <span className="font-bold text-primary">{String.fromCharCode(65 + i)})</span>
                  <span className="flex-1"><QuestionContent text={opt} className="[&_p]:my-0" /></span>
                </button>
              );
            })}
          </div>
          <div className="mt-6 flex justify-between">
            <Button variant="ghost" disabled={idx === 0} onClick={() => setIdx(idx - 1)}>← Anterioară</Button>
            {idx < questions.length - 1 ? (
              <Button onClick={() => setIdx(idx + 1)}>Următoarea →</Button>
            ) : (
              <Button variant="destructive" onClick={() => setDone(true)}>Termină simularea</Button>
            )}
          </div>
        </Card>

        <div className="mt-4 grid grid-cols-10 gap-1 sm:grid-cols-15 md:grid-cols-20">
          {questions.map((qq, i) => {
            const isCurrent = i === idx;
            const isAnswered = answers[qq.id] !== undefined;
            return (
              <button
                key={qq.id}
                onClick={() => setIdx(i)}
                className={`aspect-square rounded text-xs font-semibold transition ${
                  isCurrent ? "bg-primary text-primary-foreground"
                  : isAnswered ? "bg-primary/20 text-primary"
                  : "bg-muted text-muted-foreground hover:bg-muted/70"
                }`}
              >
                {i + 1}
              </button>
            );
          })}
        </div>
      </main>
    </div>
  );
}