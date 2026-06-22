import { useState } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { AdInArticle, StickyBottomAd } from "@/components/AdSlot";
import {
  DRIVING_QUESTIONS,
  DRIVING_CATEGORIES,
  DRIVING_CHAPTERS,
  type DrivingQuestion,
} from "@/lib/scoala-soferi/questions";

export const Route = createFileRoute("/scoala-soferi/grila/$slug")({
  loader: ({ params }) => {
    const q: DrivingQuestion | undefined = DRIVING_QUESTIONS.find((x) => x.slug === params.slug);
    if (!q) throw notFound();
    const cat = DRIVING_CATEGORIES.find((c) => c.code === q.category)!;
    const ch = DRIVING_CHAPTERS.find((c) => c.code === q.chapter)!;
    return { q, cat, ch };
  },
  head: ({ params, loaderData }) => {
    const data = loaderData as { q: DrivingQuestion; cat: { name: string; slug: string }; ch: { name: string } } | undefined;
    if (!data) return { meta: [{ title: "Grilă școală șoferi" }] };
    const { q, cat, ch } = data;
    const title = `${q.question.slice(0, 70)} — Grilă ${cat.name} | Școală șoferi`;
    const desc = `${q.question} Răspuns corect și explicație pe Codul Rutier. Chestionar ${cat.name} — ${ch.name}.`;
    const url = `https://grileadmitere.ro/scoala-soferi/grila/${params.slug}`;
    return {
      meta: [
        { title },
        { name: "description", content: desc.slice(0, 158) },
        {
          name: "keywords",
          content: `chestionare ${cat.name}, ${ch.name}, scoala soferi, DRPCIV, ${q.question.slice(0, 50)}`,
        },
        { name: "robots", content: "index, follow, max-image-preview:large" },
        { property: "og:title", content: title },
        { property: "og:description", content: desc.slice(0, 200) },
        { property: "og:type", content: "article" },
        { property: "og:url", content: url },
        { property: "og:locale", content: "ro_RO" },
        { name: "twitter:card", content: "summary" },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "QAPage",
            mainEntity: {
              "@type": "Question",
              name: q.question,
              text: q.question,
              answerCount: 1,
              acceptedAnswer: {
                "@type": "Answer",
                text: `${q.correct.map((i) => q.choices[i]).join("; ")}. ${q.explain}`,
              },
              suggestedAnswer: q.choices.map((c, i) => ({
                "@type": "Answer",
                text: c,
                upvoteCount: q.correct.includes(i) ? 1 : 0,
              })),
            },
          }),
        },
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Acasă", item: "https://grileadmitere.ro/" },
              { "@type": "ListItem", position: 2, name: "Școală șoferi", item: "https://grileadmitere.ro/scoala-soferi" },
              { "@type": "ListItem", position: 3, name: cat.name, item: `https://grileadmitere.ro/scoala-soferi/${cat.slug}` },
              { "@type": "ListItem", position: 4, name: q.question.slice(0, 60), item: url },
            ],
          }),
        },
      ],
    };
  },
  component: GrilaPage,
  notFoundComponent: () => (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-3xl font-bold mb-2">Grilă inexistentă</h1>
        <Link to="/scoala-soferi" className="text-primary underline">Înapoi la chestionare</Link>
      </main>
    </div>
  ),
  errorComponent: ({ error }) => (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-12 text-center">
        <p className="text-destructive">{String(error)}</p>
      </main>
    </div>
  ),
});

function GrilaPage() {
  const { q, cat, ch } = Route.useLoaderData();
  const [selected, setSelected] = useState<number[]>([]);
  const [reveal, setReveal] = useState(false);

  function toggle(i: number) {
    if (reveal) return;
    setSelected((s) => (s.includes(i) ? s.filter((x) => x !== i) : [...s, i]));
  }

  const isCorrect =
    reveal &&
    selected.length === q.correct.length &&
    selected.every((i) => q.correct.includes(i));

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <nav aria-label="Breadcrumb" className="mb-4 text-sm text-muted-foreground">
          <Link to="/" className="hover:underline">Acasă</Link>
          <span className="mx-2">/</span>
          <Link to="/scoala-soferi" className="hover:underline">Școală șoferi</Link>
          <span className="mx-2">/</span>
          <Link to="/scoala-soferi/$categorie" params={{ categorie: cat.slug }} className="hover:underline">
            {cat.name}
          </Link>
          <span className="mx-2">/</span>
          <span className="text-foreground">Grila #{q.id}</span>
        </nav>

        <article>
          <header className="mb-6">
            <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">
              {cat.name} · {ch.name}
            </div>
            <h1 className="text-2xl md:text-3xl font-bold leading-snug">{q.question}</h1>
          </header>

          <ol className="space-y-2 mb-6">
            {q.choices.map((c: string, i: number) => {
              const sel = selected.includes(i);
              const right = q.correct.includes(i);
              const cls = !reveal
                ? sel
                  ? "border-primary bg-primary/5"
                  : "border-border hover:bg-muted"
                : right
                ? "border-green-600 bg-green-50 dark:bg-green-950"
                : sel
                ? "border-red-600 bg-red-50 dark:bg-red-950"
                : "border-border opacity-70";
              return (
                <li key={i}>
                  <button
                    type="button"
                    onClick={() => toggle(i)}
                    className={`w-full text-left p-4 rounded-lg border transition ${cls}`}
                  >
                    <span className="font-semibold mr-2">{String.fromCharCode(65 + i)}.</span>
                    {c}
                  </button>
                </li>
              );
            })}
          </ol>

          {!reveal ? (
            <button
              type="button"
              onClick={() => setReveal(true)}
              className="px-5 py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold"
            >
              Verifică răspunsul
            </button>
          ) : (
            <div
              className={`p-4 rounded-lg border ${
                isCorrect ? "border-green-600 bg-green-50 dark:bg-green-950" : "border-amber-600 bg-amber-50 dark:bg-amber-950"
              }`}
            >
              <div className="font-bold mb-1">
                {isCorrect ? "✓ Corect!" : "✗ Răspuns incorect"}
              </div>
              <div className="text-sm">
                <strong>Răspuns corect:</strong>{" "}
                {q.correct.map((i: number) => `${String.fromCharCode(65 + i)}) ${q.choices[i]}`).join(" + ")}
              </div>
              <div className="text-sm mt-2">
                <strong>Explicație:</strong> {q.explain}
              </div>
            </div>
          )}

          <AdInArticle className="my-8" />

          <section className="prose prose-slate dark:prose-invert max-w-none">
            <h2>Mai multe grile pe acest capitol</h2>
            <p>
              Continuă pregătirea cu alte chestionare de la capitolul <strong>{ch.name}</strong>,{" "}
              <Link
                to="/scoala-soferi/$categorie"
                params={{ categorie: cat.slug }}
                hash={ch.code}
              >
                vezi toate grilele {cat.name} →
              </Link>
            </p>
            <h3>Test cronometrat</h3>
            <p>
              <Link to="/scoala-soferi/test">Începe un test cu 26 de întrebări</Link>, ca la examenul oficial DRPCIV.
            </p>
          </section>
        </article>

        <StickyBottomAd />
      </main>
    </div>
  );
}