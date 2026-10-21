import { createFileRoute, Link, notFound } from "@tanstack/react-router";
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

const SLUG_WORDS: Record<string, string> = {
  med: "Medicină", bio: "Biologie", chim: "Chimie", chimie: "Chimie", fiz: "Fizică", fizica: "Fizică",
  mate: "Matematică", mat: "Matematică", info: "Informatică", inf: "Informatică", ro: "Română",
  rom: "Română", ist: "Istorie", geo: "Geografie", eco: "Economie", log: "Logică", anat: "Anatomie",
  stom: "Stomatologie", farm: "Farmacie", drept: "Drept", fmi: "FMI", csie: "CSIE", ac: "Automatică",
};
function readableSlug(slug: string) {
  const parts = slug.split("-");
  const uni = parts[0].toUpperCase();
  const rest = parts.slice(1).map((p) => SLUG_WORDS[p] ?? p.charAt(0).toUpperCase() + p.slice(1));
  return { uni, label: [uni, ...rest].join(" ") };
}

const stripMd = (t: string) => t.replace(/\$[^$]*\$/g, " ").replace(/```[\s\S]*?```/g, " ").replace(/[*_`#>\[\]]/g, "").replace(/\s+/g, " ").trim();

export const Route = createFileRoute("/quiz/$slug")({
  loader: async ({ params }) => {
    const data = await getQuiz({ data: { slug: params.slug } });
    if (!data) throw notFound();
    const subject = data.subject as any;
    const next = await getNextSubjects({ data: { currentSubjectId: subject.id, universityId: subject.university_id } });
    return { quiz: data, next };
  },
  staleTime: 5 * 60 * 1000,
  head: ({ params, loaderData }) => {
    const subject = (loaderData?.quiz?.subject ?? null) as any;
    const uni = String(subject?.universities?.short_name ?? subject?.universities?.name ?? readableSlug(params.slug).uni).replace(/\s*20\d\d\s*$/, "").trim();
    const label = subject ? `${subject.name} ${uni}` : readableSlug(params.slug).label;
    const count = loaderData?.quiz?.questions?.length ?? 0;
    const title = `Grile ${label} Admitere 2026 Rezolvate${count ? ` — ${count} Întrebări` : ""} | GrileAdmitere.ro`;
    const description = `Grile admitere ${label} 2026 rezolvate pas cu pas: ${count ? `${count} întrebări` : "întrebări"} cu răspunsuri și explicații detaliate, gratuit și nelimitat. Testează-te online acum.`;
    const url = `https://grileadmitere.ro/quiz/${params.slug}`;
    const questions = ((loaderData?.quiz?.questions ?? []) as Q[]).slice(0, 10);
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:url", content: url },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: description },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [{
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Quiz",
          name: title,
          description,
          url,
          inLanguage: "ro-RO",
          educationalUse: "Assessment",
          learningResourceType: "Quiz",
          isAccessibleForFree: true,
          about: { "@type": "Thing", name: subject?.name ?? label },
          educationalAlignment: { "@type": "AlignmentObject", alignmentType: "educationalSubject", targetName: subject?.name ?? label },
          hasPart: questions.map((q) => {
            const correct = getCorrectIndices(q);
            return {
              "@type": "Question",
              eduQuestionType: "Multiple choice",
              name: stripMd(q.question_text).slice(0, 200),
              text: stripMd(q.question_text),
              acceptedAnswer: { "@type": "Answer", text: correct.map((i) => stripMd(q.options[i] ?? "")).join(" · ") },
              suggestedAnswer: q.options.filter((_, i) => !correct.includes(i)).map((o) => ({ "@type": "Answer", text: stripMd(o) })),
            };
          }),
        }),
      }, {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Acasă", item: "https://grileadmitere.ro/" },
            { "@type": "ListItem", position: 2, name: "Grile Admitere", item: "https://grileadmitere.ro/grile" },
            ...(subject?.universities?.slug ? [{ "@type": "ListItem", position: 3, name: uni, item: `https://grileadmitere.ro/grile/${subject.universities.slug}` }] : []),
            { "@type": "ListItem", position: subject?.universities?.slug ? 4 : 3, name: subject?.name ?? label, item: url },
          ],
        }),
      }],
    };
  },
  notFoundComponent: () => (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto max-w-2xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold">Setul de grile nu există</h1>
        <p className="mt-3 text-muted-foreground">Alege o universitate și o materie din lista completă.</p>
        <Link to="/grile" className="mt-6 inline-block underline">Toate grilele de admitere</Link>
      </main>
    </div>
  ),
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
  const loaded = Route.useLoaderData();
  const queryClient = useQueryClient();
  const fn = useServerFn(getQuiz);
  const { data, isLoading } = useQuery({
    queryKey: ["quiz", slug],
    queryFn: () => fn({ data: { slug } }),
    initialData: loaded.quiz,
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
    initialData: loaded.next,
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
              <Button asChild variant="outline">
                <Link to="/grile/$uniSlug" params={{ uniSlug: (data.subject as any).universities?.slug ?? "" }}>Înapoi</Link>
              </Button>
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
              <Button asChild size="lg" className="mt-4 w-full">
                <Link to="/quiz/$slug" params={{ slug: next.slug }}>
                  Grila următoare <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
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
        <SeoContent subject={data.subject as any} questions={(data.questions ?? []) as Q[]} recs={nextData?.recommendations ?? []} slug={slug} />
      </main>
    </div>
  );
}

function SeoContent({ subject, questions, recs, slug }: { subject: any; questions: Q[]; recs: any[]; slug: string }) {
  const uni = String(subject?.universities?.short_name ?? subject?.universities?.name ?? "").replace(/\s*20\d\d\s*$/, "").trim();
  const uniSlug = subject?.universities?.slug as string | undefined;
  const label = `${subject?.name ?? ""} ${uni}`.trim();
  const total = questions.length;
  const shown = questions.slice(0, 50);
  return (
    <article className="mt-10 max-w-3xl">
      <nav aria-label="Breadcrumb" className="text-xs text-muted-foreground">
        <Link to="/" className="hover:underline">Acasă</Link>
        <span className="mx-1">/</span>
        <Link to="/grile" className="hover:underline">Grile Admitere</Link>
        {uniSlug && (<><span className="mx-1">/</span><Link to="/grile/$uniSlug" params={{ uniSlug }} className="hover:underline">{uni}</Link></>)}
        <span className="mx-1">/</span>
        <span>{subject?.name}</span>
      </nav>
      <h1 className="mt-2 text-2xl font-bold">Grile {label} — Admitere 2026, rezolvate pas cu pas</h1>
      <p className="mt-3 text-sm text-muted-foreground">
        Această pagină conține {total} grile de admitere la {subject?.name} pentru {uni}, fiecare cu răspunsul corect și explicație detaliată.
        Rezolvă testul interactiv de mai sus (30 de întrebări per sesiune, cronometrate) sau parcurge mai jos toate întrebările cu rezolvări.
        Grilele sunt gratuite și nelimitate; nu reprezintă subiecte oficiale ale universității, ci material de antrenament în formatul examenului.
      </p>
      {subject?.description && <p className="mt-2 text-sm text-muted-foreground">{subject.description}</p>}

      <h2 className="mt-8 text-xl font-semibold">Toate grilele {label} cu răspunsuri și explicații</h2>
      <ol className="mt-4 space-y-3">
        {shown.map((qq, i) => {
          const correct = getCorrectIndices(qq);
          return (
            <li key={qq.id} id={`grila-${i + 1}`}>
              <details className="rounded-md border p-4">
                <summary className="cursor-pointer text-sm font-medium">
                  <span className="mr-1 font-semibold">Grila {i + 1}.</span>
                  <span className="inline-block align-top [&_p]:inline"><QuestionContent text={qq.question_text} figureUrl={qq.figure_url} /></span>
                </summary>
                <ul className="mt-3 space-y-1 text-sm">
                  {qq.options.map((opt, j) => (
                    <li key={j} className={correct.includes(j) ? "font-semibold text-green-700 dark:text-green-400" : ""}>
                      <span className="mr-1">{String.fromCharCode(65 + j)})</span>
                      <span className="inline-block align-top [&_p]:my-0 [&_p]:inline"><QuestionContent text={opt} /></span>
                    </li>
                  ))}
                </ul>
                <div className="mt-3 text-sm">
                  <span className="font-medium">Răspuns corect: </span>
                  {correct.map((c) => String.fromCharCode(65 + c)).join(", ")}
                </div>
                {(qq.solution_md?.trim() || qq.explanation?.trim()) && (
                  <div className="mt-2 text-sm text-foreground/90">
                    <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Rezolvare</div>
                    <QuestionContent text={(qq.solution_md?.trim() || qq.explanation) as string} />
                  </div>
                )}
              </details>
            </li>
          );
        })}
      </ol>
      {total > shown.length && <p className="mt-3 text-sm text-muted-foreground">Sunt afișate primele {shown.length} din {total} grile. Restul le găsești în testul interactiv de mai sus.</p>}

      <h2 className="mt-10 text-xl font-semibold">Cum te pregătești eficient la {subject?.name} pentru {uni}</h2>
      <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
        <li>Rezolvă grilele cronometrat, apoi citește explicația la fiecare întrebare, inclusiv la cele nimerite.</li>
        <li>Notează capitolele unde greșești și revino la ele după 2–3 zile (repetare spațiată).</li>
        <li>O dată pe săptămână fă o <Link to="/simulare" className="underline">simulare completă</Link> în format de examen.</li>
        <li>Exersează zilnic cu <Link to="/grila-zilei" className="underline">grila zilei</Link> și citește <Link to="/tutoriale" className="underline">ghidurile pe materii</Link>.</li>
      </ul>

      <h2 className="mt-10 text-xl font-semibold">Întrebări frecvente</h2>
      <div className="mt-3 space-y-3 text-sm">
        <div><h3 className="font-semibold">Grilele {label} sunt gratuite?</h3><p className="text-muted-foreground">Da. Toate grilele de pe grileadmitere.ro sunt gratuite și nelimitate, cu răspunsuri și explicații pas cu pas.</p></div>
        <div><h3 className="font-semibold">Sunt acestea subiectele oficiale de admitere {uni}?</h3><p className="text-muted-foreground">Nu. Sunt întrebări de antrenament construite după structura și capitolele examenului. Pentru subiectele oficiale consultă <Link to="/subiecte-admitere" className="underline">arhiva de subiecte</Link> și site-ul universității.</p></div>
        <div><h3 className="font-semibold">Câte grile sunt în acest set?</h3><p className="text-muted-foreground">Setul conține {total} grile la {subject?.name}, iar testul interactiv îți servește 30 de întrebări pe sesiune. Se adaugă grile noi zilnic.</p></div>
      </div>

      {recs.length > 0 && (
        <>
          <h2 className="mt-10 text-xl font-semibold">Alte seturi de grile recomandate</h2>
          <ul className="mt-3 grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
            {recs.map((r: any) => (
              <li key={r.id}><Link to="/quiz/$slug" params={{ slug: r.slug }} className="underline">Grile {r.name} {r.universities?.short_name ?? ""}</Link></li>
            ))}
            {uniSlug && <li><Link to="/grile/$uniSlug" params={{ uniSlug }} className="underline">Toate materiile {uni}</Link></li>}
            <li><Link to="/grile" className="underline">Toate universitățile</Link></li>
          </ul>
        </>
      )}
      <p className="mt-8 text-xs text-muted-foreground">URL: grileadmitere.ro/quiz/{slug}</p>
    </article>
  );
}
