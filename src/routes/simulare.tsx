import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { simulationQuestions } from "@/lib/db.functions";
import { Header } from "@/components/Header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { AdSlot } from "@/components/AdSlot";
import { Trophy, Clock } from "lucide-react";

export const Route = createFileRoute("/simulare")({ component: Page });

function Page() {
  const fn = useServerFn(simulationQuestions);
  const [started, setStarted] = useState(false);
  const { data: qs = [], refetch } = useQuery({ queryKey: ["sim"], queryFn: () => fn({ data: { count: 30 } }), enabled: started });
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [done, setDone] = useState(false);
  const [seconds, setSeconds] = useState(1800);

  useEffect(() => {
    if (!started || done) return;
    const t = setInterval(() => setSeconds((s) => { if (s <= 1) { setDone(true); return 0; } return s - 1; }), 1000);
    return () => clearInterval(t);
  }, [started, done]);

  if (!started) return (
    <div className="min-h-screen bg-background"><Header />
      <main className="container mx-auto max-w-2xl px-4 py-16 text-center">
        <Trophy className="mx-auto h-12 w-12 text-primary" />
        <h1 className="mt-4 text-3xl font-bold">Simulare admitere</h1>
        <p className="mt-2 text-muted-foreground">30 de grile aleatorii · 30 minute · evaluare la final.</p>
        <Button size="lg" className="mt-6" onClick={() => { setStarted(true); refetch(); }}>Începe simularea</Button>
        <AdSlot className="my-8" />
      </main>
    </div>
  );

  if (!qs.length) return <div className="min-h-screen bg-background"><Header /><div className="container py-10">Se încarcă…</div></div>;

  if (done) {
    const score = qs.reduce((acc: number, q: any) => acc + (answers[q.id] === q.correct_index ? 1 : 0), 0);
    return (
      <div className="min-h-screen bg-background"><Header />
        <main className="container mx-auto max-w-xl px-4 py-10 text-center">
          <Card className="p-8">
            <h1 className="text-2xl font-bold">Simulare terminată</h1>
            <div className="my-6 text-5xl font-bold text-primary">{score}/{qs.length}</div>
            <Button onClick={() => { setStarted(false); setDone(false); setIdx(0); setAnswers({}); setSeconds(1800); }}>Încă o dată</Button>
          </Card>
        </main>
      </div>
    );
  }

  const q: any = qs[idx];
  return (
    <div className="min-h-screen bg-background"><Header />
      <main className="container mx-auto max-w-3xl px-4 py-8">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span>Simulare</span>
          <span className="flex items-center gap-1 text-muted-foreground"><Clock className="h-4 w-4" />{Math.floor(seconds/60)}:{String(seconds%60).padStart(2,"0")}</span>
        </div>
        <Progress value={((idx + 1) / qs.length) * 100} className="mb-6" />
        <Card className="p-6">
          <div className="text-sm text-muted-foreground mb-2">Întrebarea {idx + 1} / {qs.length}</div>
          <div className="text-base font-medium whitespace-pre-wrap">{q.question_text}</div>
          <div className="mt-4 space-y-2">
            {q.options.map((opt: string, i: number) => (
              <button key={i} onClick={() => setAnswers({ ...answers, [q.id]: i })}
                className={`w-full rounded-md border p-3 text-left text-sm transition ${answers[q.id] === i ? "border-primary bg-primary/5" : "hover:border-primary/40"}`}>
                <span className="mr-2 font-semibold">{String.fromCharCode(65 + i)}.</span>{opt}
              </button>
            ))}
          </div>
          <div className="mt-6 flex justify-between">
            <Button variant="ghost" disabled={idx === 0} onClick={() => setIdx(idx - 1)}>Înapoi</Button>
            {idx < qs.length - 1
              ? <Button onClick={() => setIdx(idx + 1)}>Următoarea →</Button>
              : <Button onClick={() => setDone(true)}>Termină</Button>}
          </div>
        </Card>
      </main>
    </div>
  );
}
