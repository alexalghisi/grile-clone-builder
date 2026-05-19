import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { getQuiz, getNextSubjects } from "@/lib/db.functions";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { AdSlot, AdLeaderboard } from "@/components/AdSlot";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Clock, RotateCcw, ArrowRight, Sparkles, BookOpen } from "lucide-react";

export const Route = createFileRoute("/quiz/$slug")({
  head: ({ params }) => {
    const title = `Test Grile ${params.slug} — Admitere 2026 | GrileAdmitere.ro`;
    const description = `Rezolvă grilele de admitere 2026 pentru ${params.slug} cu explicații pas cu pas la fiecare răspuns. Gratuit.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
      ],
      links: [{ rel: "canonical", href: `https://grileadmitere.ro/quiz/${params.slug}` }],
    };
  },
  component: Page,
});

type Q = { id: string; question_text: string; options: string[]; correct_index: number; explanation: string | null };

function Page() {
  const { slug } = Route.useParams();
  const fn = useServerFn(getQuiz);
  const { data, isLoading } = useQuery({ queryKey: ["quiz", slug], queryFn: () => fn({ data: { slug } }) });
  const nextFn = useServerFn(getNextSubjects);
  const { data: nextData } = useQuery({
    queryKey: ["next-subjects", (data?.subject as any)?.id],
    queryFn: () => nextFn({ data: { currentSubjectId: (data!.subject as any).id, universityId: (data!.subject as any).university_id } }),
    enabled: !!data?.subject,
  });

  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const [done, setDone] = useState(false);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => { const t = setInterval(() => setSeconds((s) => s + 1), 1000); return () => clearInterval(t); }, []);

  const questions: Q[] = useMemo(() => (data?.questions ?? []).slice(0, 30) as Q[], [data]);
  const q = questions[idx];

  useEffect(() => {
    if (done && data?.subject) {
      const score = questions.reduce((acc, qq) => acc + (answers[qq.id] === qq.correct_index ? 1 : 0), 0);
      supabase.auth.getUser().then(({ data: u }) => {
        if (u.user) {
          supabase.from("attempts").insert({
            user_id: u.user.id, subject_id: data.subject.id,
            university_id: data.subject.university_id, score, total: questions.length,
            time_seconds: seconds, mode: "practice", answers,
          });
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done]);

  if (isLoading) return (<div className="min-h-screen bg-background"><Header /><div className="container py-10">Se încarcă…</div></div>);
  if (!data || !questions.length) return (<div className="min-h-screen bg-background"><Header /><div className="container py-10">Niciun quiz găsit.</div></div>);

  if (done) {
    const score = questions.reduce((acc, qq) => acc + (answers[qq.id] === qq.correct_index ? 1 : 0), 0);
    const pct = Math.round((score / questions.length) * 100);
    const next = nextData?.next;
    const recs = nextData?.recommendations ?? [];
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto max-w-2xl px-4 py-10">
          <Card className="p-8 text-center">
            <h1 className="text-2xl font-bold">Rezultat</h1>
            <div className="my-6 text-5xl font-bold text-primary">{score}/{questions.length}</div>
            <Progress value={pct} className="mb-2" />
            <p className="text-sm text-muted-foreground">{pct}% · {Math.floor(seconds/60)}:{String(seconds%60).padStart(2,"0")}</p>
            <div className="mt-6 flex justify-center gap-3">
              <Button onClick={() => { setIdx(0); setAnswers({}); setRevealed({}); setDone(false); setSeconds(0); }}>
                <RotateCcw className="mr-2 h-4 w-4" />Reîncepe
              </Button>
              <Link to="/grile/$uniSlug" params={{ uniSlug: (data.subject as any).universities?.slug ?? "" }}>
                <Button variant="outline">Înapoi</Button>
              </Link>
            </div>
          </Card>

          {next && (
            <Card className="mt-6 p-6 border-2 border-primary/40 bg-gradient-to-br from-primary/5 to-transparent">
              <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-primary font-semibold">
                <Sparkles className="h-4 w-4" /> Continuă pregătirea
              </div>
              <div className="mt-2 text-lg font-bold">{next.name}</div>
              <div className="text-sm text-muted-foreground">
                {(next as any).universities?.short_name ?? ""} · {next.question_count} grile
              </div>
              <Link to="/quiz/$slug" params={{ slug: next.slug }} className="mt-4 block">
                <Button size="lg" className="w-full">
                  Grila următoare <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </Card>
          )}

          {recs.length > 0 && (
            <div className="mt-6">
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Recomandate pentru tine</h2>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {recs.map((r: any) => (
                  <Link key={r.id} to="/quiz/$slug" params={{ slug: r.slug }}>
                    <Card className="p-4 h-full transition hover:border-primary/40 hover:shadow">
                      <div className="flex items-start gap-2">
                        <BookOpen className="h-4 w-4 text-primary mt-1" />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-semibold truncate">{r.name}</div>
                          <div className="text-xs text-muted-foreground truncate">
                            {r.universities?.short_name ?? ""} · {r.question_count} grile
                          </div>
                        </div>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          )}

          <AdSlot className="my-6" />
          <div className="space-y-3">
            {questions.map((qq, i) => {
              const ok = answers[qq.id] === qq.correct_index;
              return (
                <Card key={qq.id} className="p-4">
                  <div className="flex items-start gap-2">
                    {ok ? <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" /> : <XCircle className="h-5 w-5 text-destructive mt-0.5" />}
                    <div className="flex-1">
                      <div className="text-sm font-medium whitespace-pre-wrap">{i + 1}. {qq.question_text}</div>
                      <div className="mt-2 text-xs text-muted-foreground">Corect: {String.fromCharCode(65 + qq.correct_index)}. {qq.options[qq.correct_index]}</div>
                      {qq.explanation && <div className="mt-2 text-xs text-foreground/80">{qq.explanation}</div>}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </main>
      </div>
    );
  }

  const isRevealed = revealed[q.id];
  const sel = answers[q.id];
  const isWrong = isRevealed && sel !== q.correct_index;
  const isRight = isRevealed && sel === q.correct_index;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto max-w-3xl px-4 py-8">
        <div className="mb-2 flex items-center justify-between text-sm">
          <Link to="/quiz/$slug" params={{ slug }} className="text-muted-foreground">{(data.subject as any).name}</Link>
          <span className="flex items-center gap-1 text-muted-foreground"><Clock className="h-4 w-4" />{Math.floor(seconds/60)}:{String(seconds%60).padStart(2,"0")}</span>
        </div>
        <Progress value={((idx + 1) / questions.length) * 100} className="mb-6" />
        <Card
          className={`p-6 transition-colors ${
            isWrong
              ? "border-2 border-destructive bg-destructive/10"
              : isRight
              ? "border-2 border-green-600 bg-green-50 dark:bg-green-950/20"
              : ""
          }`}
        >
          <Badge variant="secondary" className="mb-3">Întrebarea {idx + 1} / {questions.length}</Badge>
          <div className="text-base font-medium whitespace-pre-wrap">{q.question_text}</div>
          <div className="mt-5 space-y-2">
            {q.options.map((opt, i) => {
              const isCorrect = i === q.correct_index;
              const isSel = sel === i;
              const cls = isRevealed
                ? isCorrect ? "border-green-600 bg-green-50 dark:bg-green-950/30"
                : isSel ? "border-destructive bg-destructive/10" : "opacity-60"
                : isSel ? "border-primary" : "hover:border-primary/40";
              return (
                <button
                  key={i}
                  disabled={isRevealed}
                  onClick={() => setAnswers({ ...answers, [q.id]: i })}
                  className={`w-full rounded-md border p-3 text-left text-sm transition ${cls}`}
                >
                  <span className="mr-2 font-semibold">{String.fromCharCode(65 + i)}.</span>{opt}
                </button>
              );
            })}
          </div>
          {isRevealed && (
            <div
              className={`mt-5 rounded-md border p-4 text-sm ${
                isWrong
                  ? "border-destructive/40 bg-destructive/5"
                  : "border-green-600/40 bg-green-50 dark:bg-green-950/20"
              }`}
            >
              <div className="mb-2 flex items-center gap-2 font-semibold">
                {isWrong ? (
                  <><XCircle className="h-5 w-5 text-destructive" /><span className="text-destructive">Răspuns greșit</span></>
                ) : (
                  <><CheckCircle2 className="h-5 w-5 text-green-600" /><span className="text-green-700 dark:text-green-400">Răspuns corect</span></>
                )}
              </div>
              <div className="mb-2">
                <span className="font-medium">Răspunsul corect: </span>
                <span className="font-semibold text-green-700 dark:text-green-400">
                  {String.fromCharCode(65 + q.correct_index)}. {q.options[q.correct_index]}
                </span>
              </div>
              <div className="mt-3 border-t pt-3">
                <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Explicație / Rezolvare</div>
                <div className="whitespace-pre-wrap text-foreground/90">
                  {q.explanation?.trim() || "Nu există o explicație detaliată pentru această grilă. Răspunsul corect este marcat mai sus."}
                </div>
              </div>
            </div>
          )}
          {isRevealed && <AdSlot className="mt-5" />}
          <div className="mt-6 flex justify-between">
            <Button variant="ghost" disabled={idx === 0} onClick={() => setIdx(idx - 1)}>Înapoi</Button>
            {!isRevealed ? (
              <Button disabled={sel === undefined} onClick={() => setRevealed({ ...revealed, [q.id]: true })}>Verifică</Button>
            ) : idx < questions.length - 1 ? (
              <Button onClick={() => setIdx(idx + 1)}>Următoarea →</Button>
            ) : (
              <Button onClick={() => setDone(true)}>Termină</Button>
            )}
          </div>
        </Card>
        <AdLeaderboard className="my-6" />
        <AdSlot className="my-6" />
      </main>
    </div>
  );
}
