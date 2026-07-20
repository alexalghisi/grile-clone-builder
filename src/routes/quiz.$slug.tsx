import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { getQuiz, getNextSubjects } from "@/lib/db.functions";
import { submitEmailLead } from "@/lib/leads.functions";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { AdSlot, AdLeaderboard } from "@/components/AdSlot";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Clock, RotateCcw, ArrowRight, Sparkles, BookOpen } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { QuestionContent } from "@/components/QuestionContent";

const EMAIL_GATE_KEY = "ga_email_captured_v1";

function EmailGate({ slug, onDone }: { slug: string; onDone: () => void }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const submitLead = useServerFn(submitEmailLead);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const v = email.trim();
    if (!/^\S+@\S+\.\S+$/.test(v)) { toast.error("Introdu un email valid"); return; }
    setLoading(true);
    try {
      const res = await submitLead({ data: { email: v, quiz_slug: slug, source: "quiz_gate" } });
      setLoading(false);
      if (!res.ok) {
        toast.error(res.reason || "Email invalid. Folosește o adresă reală.");
        return;
      }
    } catch (err: any) {
      setLoading(false);
      toast.error("Nu am putut salva emailul. Încearcă din nou.");
      return;
    }
    try { localStorage.setItem(EMAIL_GATE_KEY, v); } catch {}
    toast.success("Mulțumim! Continuă cu grilele.");
    onDone();
  };
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto max-w-lg px-4 py-12">
        <Card className="p-8 border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-transparent">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary uppercase tracking-wider">
            <Sparkles className="h-3.5 w-3.5" /> Continuă gratuit
          </div>
          <h1 className="text-2xl font-bold">Lasă-ne emailul tău</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Ai rezolvat primele 3 grile. Introdu emailul pentru a continua cu restul grilelor și pentru a primi
            grila zilei + sfaturi de pregătire pentru admitere.
          </p>
          <form onSubmit={submit} className="mt-6 space-y-3">
            <Input
              type="email"
              required
              autoFocus
              placeholder="numele.tau@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Button type="submit" size="lg" className="w-full" disabled={loading}>
              {loading ? "Se trimite…" : "Continuă cu grilele"}
            </Button>
            <p className="text-[11px] text-muted-foreground text-center">
              Nu trimitem spam. Te poți dezabona oricând.
            </p>
          </form>
        </Card>
      </main>
    </div>
  );
}

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
        { property: "og:url", content: `https://grileadmitere.ro/quiz/${params.slug}` },
      ],
      links: [{ rel: "canonical", href: `https://grileadmitere.ro/quiz/${params.slug}` }],
      scripts: [{
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Quiz",
          name: title,
          description,
          url: `https://grileadmitere.ro/quiz/${params.slug}`,
          inLanguage: "ro-RO",
          educationalUse: "Assessment",
          learningResourceType: "Quiz",
        }),
      }],
    };
  },
  component: Page,
});

type Q = {
  id: string;
  question_text: string;
  options: string[];
  correct_index: number;
  correct_indices?: number[];
  explanation: string | null;
  solution_md?: string | null;
  figure_url?: string | null;
  problem_number?: number | null;
  difficulty?: string | null;
};

const getCorrectIndices = (q: Q) => q.correct_indices?.length ? q.correct_indices : [q.correct_index];
const getAnswerIndices = (answer: number | number[] | undefined) => Array.isArray(answer) ? answer : answer === undefined ? [] : [answer];
const sameAnswers = (answer: number | number[] | undefined, correct: number[]) => {
  const picked = getAnswerIndices(answer).sort((a, b) => a - b);
  const expected = [...correct].sort((a, b) => a - b);
  return picked.length === expected.length && picked.every((value, index) => value === expected[index]);
};

function Page() {
  const { slug } = Route.useParams();
  const queryClient = useQueryClient();
  const fn = useServerFn(getQuiz);
  const { data, isLoading } = useQuery({
    queryKey: ["quiz", slug],
    queryFn: () => fn({ data: { slug } }),
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
  const nextFn = useServerFn(getNextSubjects);
  const subjectId = (data?.subject as any)?.id;
  const universityId = (data?.subject as any)?.university_id;
  const { data: nextData } = useQuery({
    queryKey: ["next-subjects", subjectId],
    queryFn: () => nextFn({ data: { currentSubjectId: subjectId, universityId } }),
    enabled: !!subjectId,
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });

  // Prefetch next quiz + its recommendations as soon as we know what's next
  useEffect(() => {
    if (!nextData?.recommendations?.length) return;
    for (const r of nextData.recommendations) {
      queryClient.prefetchQuery({
        queryKey: ["quiz", r.slug],
        queryFn: () => fn({ data: { slug: r.slug } }),
        staleTime: 5 * 60 * 1000,
      });
      queryClient.prefetchQuery({
        queryKey: ["next-subjects", r.id],
        queryFn: () => nextFn({ data: { currentSubjectId: r.id, universityId: r.university_id } }),
        staleTime: 10 * 60 * 1000,
      });
    }
  }, [nextData, queryClient, fn, nextFn]);

  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number | number[]>>({});
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const [done, setDone] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [emailOk, setEmailOk] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    try { return !!localStorage.getItem(EMAIL_GATE_KEY); } catch { return false; }
  });

  useEffect(() => { const t = setInterval(() => setSeconds((s) => s + 1), 1000); return () => clearInterval(t); }, []);

  const questions: Q[] = useMemo(() => (data?.questions ?? []).slice(0, 30) as Q[], [data]);
  const q = questions[idx];

  useEffect(() => {
    if (done && data?.subject) {
      const score = questions.reduce((acc, qq) => acc + (sameAnswers(answers[qq.id], getCorrectIndices(qq)) ? 1 : 0), 0);
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

  // Email gate: after the user has revealed 3 questions, require email to continue.
  const revealedCount = Object.keys(revealed).length;
  if (!emailOk && revealedCount >= 3 && !done) {
    return <EmailGate slug={slug} onDone={() => setEmailOk(true)} />;
  }

  if (done) {
    const score = questions.reduce((acc, qq) => acc + (sameAnswers(answers[qq.id], getCorrectIndices(qq)) ? 1 : 0), 0);
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
                {(next as any).universities?.short_name ?? ""} · pregătire recomandată
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
                            {r.universities?.short_name ?? ""} · grile recomandate
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
              const correct = getCorrectIndices(qq);
              const ok = sameAnswers(answers[qq.id], correct);
              return (
                <Card key={qq.id} className="p-4">
                  <div className="flex items-start gap-2">
                    {ok ? <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" /> : <XCircle className="h-5 w-5 text-destructive mt-0.5" />}
                    <div className="flex-1">
                      <div className="text-sm font-medium">
                      <span className="mr-1 font-semibold">Problema {qq.problem_number ?? i + 1}.</span>
                      <QuestionContent text={qq.question_text} figureUrl={qq.figure_url} />
                      </div>
                      <div className="mt-2 text-xs text-muted-foreground">
                        Corect: {correct.map((answerIndex) => `${String.fromCharCode(65 + answerIndex)}. ${qq.options[answerIndex]}`).join(" · ")}
                      </div>
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
  const correct = getCorrectIndices(q);
  const selectedIndices = getAnswerIndices(sel);
  const isMulti = correct.length > 1;
  const isWrong = isRevealed && !sameAnswers(sel, correct);
  const isRight = isRevealed && sameAnswers(sel, correct);

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
          <div className="mb-3 flex items-center gap-2 flex-wrap">
            <Badge variant="secondary">Problema {q.problem_number ?? idx + 1} / {questions.length}</Badge>
          </div>
          <div className="text-base font-medium leading-relaxed">
            <QuestionContent text={q.question_text} figureUrl={q.figure_url} />
          </div>
          <div className="mt-5 space-y-2">
            {q.options.map((opt, i) => {
              const isCorrect = correct.includes(i);
              const isSel = selectedIndices.includes(i);
              const cls = isRevealed
                ? isCorrect ? "border-green-600 bg-green-50 dark:bg-green-950/30"
                : isSel ? "border-destructive bg-destructive/10" : "opacity-60"
                : isSel ? "border-primary" : "hover:border-primary/40";
              const chooseAnswer = () => {
                if (!isMulti) {
                  setAnswers({ ...answers, [q.id]: i });
                  return;
                }
                const next = isSel ? selectedIndices.filter((value) => value !== i) : [...selectedIndices, i];
                setAnswers({ ...answers, [q.id]: next });
              };
              return (
                <div
                  key={i}
                  role="button"
                  tabIndex={isRevealed ? -1 : 0}
                  aria-disabled={isRevealed}
                  onClick={() => { if (!isRevealed) chooseAnswer(); }}
                  onKeyDown={(e) => { if (!isRevealed && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); chooseAnswer(); } }}
                  className={`flex w-full cursor-pointer items-start gap-3 rounded-md border p-3 text-left text-sm transition ${cls} ${isRevealed ? "pointer-events-none" : ""}`}
                >
                  <span className="font-bold text-primary">{String.fromCharCode(65 + i)})</span>
                  <div className="flex-1">
                    <QuestionContent text={opt} className="[&_p]:my-0" />
                  </div>
                </div>
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
                  {correct.map((answerIndex) => `${String.fromCharCode(65 + answerIndex)}) ${q.options[answerIndex]}`).join(" · ")}
                </span>
              </div>
              <div className="mt-3 border-t pt-3">
                <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Rezolvare pas cu pas</div>
                {q.solution_md?.trim() ? (
                  <QuestionContent text={q.solution_md} />
                ) : q.explanation?.trim() ? (
                  <div className="whitespace-pre-wrap text-foreground/90">{q.explanation}</div>
                ) : (
                  <div className="text-muted-foreground italic">Rezolvarea detaliată va fi adăugată curând. Răspunsul corect este marcat mai sus.</div>
                )}
              </div>
            </div>
          )}
          {isRevealed && <AdSlot className="mt-5" />}
          <div className="mt-6 flex justify-between">
            <Button variant="ghost" disabled={idx === 0} onClick={() => setIdx(idx - 1)}>Înapoi</Button>
            {!isRevealed ? (
              <Button disabled={!selectedIndices.length} onClick={() => setRevealed({ ...revealed, [q.id]: true })}>Verifică</Button>
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
