import { useMemo, useState, useEffect } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { z } from "zod";
import { Header } from "@/components/Header";
import { AdInArticle, StickyBottomAd } from "@/components/AdSlot";
import {
  DRIVING_QUESTIONS,
  DRIVING_CATEGORIES,
  type DrivingCategory,
  type DrivingQuestion,
} from "@/lib/scoala-soferi/questions";

const searchSchema = z.object({
  cat: z.enum(["a", "b", "c", "d"]).optional().default("b"),
});

const TITLE = "Test Auto 26 Grile — Simulare Examen DRPCIV | Școală șoferi";
const DESC =
  "Simulare gratuită a examenului auto DRPCIV: 26 de întrebări, 30 de minute, exact ca la examenul real. Test cronometrat cu rezultate și explicații.";
const URL = "https://grileadmitere.ro/scoala-soferi/test";

export const Route = createFileRoute("/scoala-soferi/test")({
  validateSearch: searchSchema,
  component: TestPage,
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      {
        name: "keywords",
        content: "test auto, simulare DRPCIV, examen auto 26 grile, chestionare auto online, test permis B",
      },
      { name: "robots", content: "index, follow" },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
      { property: "og:url", content: URL },
      { property: "og:locale", content: "ro_RO" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: URL }],
  }),
});

function pickRandom<T>(arr: T[], n: number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a.slice(0, n);
}

function TestPage() {
  const { cat } = Route.useSearch();
  const category = DRIVING_CATEGORIES.find((c) => c.slug === cat)!;
  const code = category.code as DrivingCategory;

  const [seed, setSeed] = useState(0);
  const questions = useMemo<DrivingQuestion[]>(() => {
    const pool = DRIVING_QUESTIONS.filter((q) => q.category === code);
    return pickRandom(pool, Math.min(26, pool.length));
  }, [code, seed]);

  const [answers, setAnswers] = useState<Record<number, number[]>>({});
  const [submitted, setSubmitted] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(30 * 60);

  useEffect(() => {
    if (submitted) return;
    const t = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(t);
          setSubmitted(true);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [submitted, seed]);

  function toggle(qid: number, idx: number) {
    if (submitted) return;
    setAnswers((a) => {
      const cur = a[qid] ?? [];
      const next = cur.includes(idx) ? cur.filter((x) => x !== idx) : [...cur, idx];
      return { ...a, [qid]: next };
    });
  }

  function restart() {
    setAnswers({});
    setSubmitted(false);
    setSecondsLeft(30 * 60);
    setSeed((s) => s + 1);
  }

  const score = questions.filter((q) => {
    const a = answers[q.id] ?? [];
    return a.length === q.correct.length && a.every((i) => q.correct.includes(i));
  }).length;
  const passed = score >= 22;

  const mm = Math.floor(secondsLeft / 60).toString().padStart(2, "0");
  const ss = (secondsLeft % 60).toString().padStart(2, "0");

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <nav aria-label="Breadcrumb" className="mb-4 text-sm text-muted-foreground">
          <Link to="/" className="hover:underline">Acasă</Link>
          <span className="mx-2">/</span>
          <Link to="/scoala-soferi" className="hover:underline">Școală șoferi</Link>
          <span className="mx-2">/</span>
          <span className="text-foreground">Test 26 grile</span>
        </nav>

        <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold">Test {category.name} — {questions.length} grile</h1>
            <p className="text-sm text-muted-foreground">
              Pragul de promovare: <strong>22 corecte din 26</strong>. Timp alocat: 30 min.
            </p>
          </div>
          <div className="text-right">
            <div className="font-mono text-2xl font-bold">{mm}:{ss}</div>
            <div className="text-xs text-muted-foreground">Timp rămas</div>
          </div>
        </header>

        {submitted && (
          <div className={`mb-6 p-5 rounded-xl border-2 ${passed ? "border-green-600 bg-green-50 dark:bg-green-950" : "border-red-600 bg-red-50 dark:bg-red-950"}`}>
            <h2 className="text-2xl font-bold mb-1">
              {passed ? "✓ Felicitări — ai promovat!" : "✗ Nepromovat"}
            </h2>
            <p className="text-lg">Scor: <strong>{score} / {questions.length}</strong></p>
            <button onClick={restart} className="mt-3 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-semibold">
              Începe alt test
            </button>
          </div>
        )}

        <ol className="space-y-6">
          {questions.map((q, qi) => (
            <li key={q.id} className="rounded-lg border border-border p-4">
              <div className="font-semibold mb-3">
                {qi + 1}. {q.question}
              </div>
              <div className="space-y-2">
                {q.choices.map((c: string, i: number) => {
                  const sel = (answers[q.id] ?? []).includes(i);
                  const right = q.correct.includes(i);
                  const cls = !submitted
                    ? sel ? "border-primary bg-primary/5" : "border-border hover:bg-muted"
                    : right ? "border-green-600 bg-green-50 dark:bg-green-950"
                    : sel ? "border-red-600 bg-red-50 dark:bg-red-950"
                    : "border-border opacity-70";
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => toggle(q.id, i)}
                      className={`w-full text-left p-3 rounded-md border ${cls}`}
                    >
                      <span className="font-semibold mr-2">{String.fromCharCode(65 + i)}.</span>{c}
                    </button>
                  );
                })}
              </div>
              {submitted && (
                <div className="mt-2 text-sm text-muted-foreground">
                  <strong>Explicație:</strong> {q.explain}
                </div>
              )}
            </li>
          ))}
        </ol>

        {!submitted && (
          <button
            onClick={() => setSubmitted(true)}
            className="mt-6 w-full py-3 rounded-lg bg-primary text-primary-foreground font-bold text-lg"
          >
            Termină testul și vezi rezultatul
          </button>
        )}

        <AdInArticle className="my-8" />
        <StickyBottomAd />
      </main>
    </div>
  );
}