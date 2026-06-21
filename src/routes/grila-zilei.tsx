import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { simulationQuestions } from "@/lib/db.functions";
import { Header } from "@/components/Header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, CheckCircle2, XCircle } from "lucide-react";
import { AdInArticle } from "@/components/AdSlot";

export const Route = createFileRoute("/grila-zilei")({
  head: () => ({
    meta: [
      { title: "Grila Zilei — GrileAdmitere.ro" },
      { name: "description", content: "Revino zilnic pentru a rezolva grila zilei și a-ți testa cunoștințele!" },
    ],
    links: [{ rel: "canonical", href: "https://grileadmitere.ro/grila-zilei" }],
  }),
  component: Page,
});

function Page() {
  const fn = useServerFn(simulationQuestions);
  const today = new Date().toISOString().slice(0, 10);
  const { data: qs = [] } = useQuery({
    queryKey: ["grila-zilei", today],
    queryFn: () => fn({ data: { count: 1 } }),
  });
  const q: any = qs[0];
  const [picked, setPicked] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto max-w-2xl px-4 py-10">
        <Badge variant="secondary" className="mb-3"><CalendarDays className="mr-1 h-3 w-3" /> {today}</Badge>
        <h1 className="text-3xl font-bold sm:text-4xl">Grila Zilei</h1>
        <p className="mt-2 text-muted-foreground">Revino zilnic pentru a rezolva grila zilei și a-ți testa cunoștințele!</p>

        {!q ? (
          <Card className="mt-8 p-6 text-center text-muted-foreground">Se încarcă grila…</Card>
        ) : (
          <Card className="mt-8 p-6">
            <h2 className="text-lg font-semibold leading-relaxed">{q.question_text}</h2>
            <div className="mt-5 space-y-2">
              {(q.options as string[]).map((opt, i) => {
                const isCorrect = picked !== null && i === q.correct_index;
                const isWrong = picked === i && i !== q.correct_index;
                return (
                  <button
                    key={i}
                    disabled={picked !== null}
                    onClick={() => setPicked(i)}
                    className={`flex w-full items-center justify-between rounded-md border px-4 py-3 text-left text-sm transition ${
                      isCorrect ? "border-emerald-400 bg-emerald-50 dark:bg-emerald-950/30" :
                      isWrong ? "border-red-400 bg-red-50 dark:bg-red-950/30" :
                      "hover:bg-muted"
                    }`}
                  >
                    <span>{opt}</span>
                    {isCorrect && <CheckCircle2 className="h-4 w-4 text-emerald-600" />}
                    {isWrong && <XCircle className="h-4 w-4 text-red-600" />}
                  </button>
                );
              })}
            </div>
            {picked !== null && q.explanation && (
              <div className="mt-5 rounded-md border border-border bg-muted/40 p-4 text-sm">
                <div className="font-semibold">Explicație</div>
                <p className="mt-1 text-muted-foreground">{q.explanation}</p>
              </div>
            )}
          </Card>
        )}

        {picked !== null && <AdInArticle />}

        <div className="mt-8 text-center">
          <Link to="/subiecte-admitere"><Button variant="outline">Subiecte Admitere</Button></Link>
        </div>
      </main>
    </div>
  );
}