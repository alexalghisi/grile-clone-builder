import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { tutoriale, materii } from "@/lib/tutoriale/data";
import { useState, useMemo } from "react";
import { listArticole } from "@/lib/articole.functions";

export const Route = createFileRoute("/tutoriale/")({
  head: () => ({
    meta: [
      { title: "Tutoriale Admitere 2026 — 140+ Ghiduri pe Materii | grileadmitere.ro" },
      { name: "description", content: "Peste 140 de tutoriale gratuite pentru admitere și BAC 2026: matematică, fizică, chimie, biologie, română, informatică, anatomie, logică, economie, geografie. Ghiduri pas cu pas scrise de profesori." },
      { property: "og:title", content: "Tutoriale Admitere 2026 — 140+ Ghiduri pe Materii" },
      { property: "og:description", content: "Ghiduri pas cu pas pentru fiecare materie de la admitere și BAC: matematică, biologie, chimie, fizică, română, informatică." },
      { property: "og:url", content: "https://grileadmitere.ro/tutoriale" },
    ],
    links: [{ rel: "canonical", href: "https://grileadmitere.ro/tutoriale" }],
    scripts: [{
      type: "application/ld+json",
      children: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: "Tutoriale Admitere 2026",
        url: "https://grileadmitere.ro/tutoriale",
        description: "Colecție de tutoriale gratuite pentru pregătirea admiterii și BAC-ului 2026.",
        hasPart: tutoriale.slice(0, 50).map(t => ({
          "@type": "Article",
          headline: t.title,
          url: `https://grileadmitere.ro/tutoriale/${t.slug}`,
          about: t.materie,
        })),
      }),
    }],
  }),
  loader: () => listArticole(),
  component: TutorialeIndex,
});

function TutorialeIndex() {
  const noi = Route.useLoaderData();
  const [q, setQ] = useState("");
  const [mat, setMat] = useState<string>("toate");
  const filtered = useMemo(() => {
    return tutoriale.filter(t =>
      (mat === "toate" || t.materie === mat) &&
      (q === "" || (t.title + " " + t.keywords).toLowerCase().includes(q.toLowerCase()))
    );
  }, [q, mat]);
  const grouped = useMemo(() => {
    const g: Record<string, typeof tutoriale> = {};
    for (const t of filtered) (g[t.materie] ||= []).push(t);
    return g;
  }, [filtered]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto max-w-5xl px-4 py-10">
        <nav aria-label="Breadcrumb" className="mb-4 text-sm text-muted-foreground">
          <Link to="/" className="hover:underline">Acasă</Link> / <span>Tutoriale</span>
        </nav>
        <h1 className="text-4xl font-bold tracking-tight">Tutoriale Admitere 2026 & BAC</h1>
        <p className="mt-3 text-lg text-muted-foreground max-w-3xl">
          Peste {tutoriale.length} ghiduri pas cu pas, scrise pentru elevii care se pregătesc de admitere la facultate și de examenul de bacalaureat. Algoritmi, formule, scheme de rezolvare, tehnici de memorare și strategii de examen — toate gratuit.
        </p>

        {noi.length > 0 && (
          <section className="mt-8">
            <h2 className="text-2xl font-semibold border-b pb-2">Articole noi</h2>
            <ul className="mt-4 grid sm:grid-cols-2 gap-3">
              {noi.slice(0, 12).map(a => (
                <li key={a.slug}>
                  <Link to="/tutoriale/$slug" params={{ slug: a.slug }} className="block p-4 rounded-lg border hover:border-primary transition">
                    <p className="text-xs uppercase tracking-wide text-primary">{a.materie} · {new Date(a.published_at).toLocaleDateString("ro-RO")}</p>
                    <h3 className="mt-1 font-medium leading-snug">{a.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{a.description}</p>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Caută în tutoriale (ex: derivate, mitoză, Eminescu)..."
            className="flex-1 px-4 py-2 rounded-md border bg-background"
          />
          <select
            value={mat}
            onChange={(e) => setMat(e.target.value)}
            className="px-4 py-2 rounded-md border bg-background"
          >
            <option value="toate">Toate materiile</option>
            {materii.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>

        <div className="mt-10 space-y-10">
          {Object.entries(grouped).map(([materie, list]) => (
            <section key={materie}>
              <h2 className="text-2xl font-semibold border-b pb-2">{materie}</h2>
              <ul className="mt-4 grid sm:grid-cols-2 gap-3">
                {list.map(t => (
                  <li key={t.slug}>
                    <Link
                      to="/tutoriale/$slug"
                      params={{ slug: t.slug }}
                      className="block p-4 rounded-lg border hover:border-primary hover:shadow-sm transition"
                    >
                      <h3 className="font-medium leading-snug">{t.title}</h3>
                      <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{t.intro}</p>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
          {filtered.length === 0 && (
            <p className="text-muted-foreground">Niciun tutorial nu corespunde căutării.</p>
          )}
        </div>

        <section className="mt-16 prose dark:prose-invert max-w-none">
          <h2>De ce să folosești tutorialele de pe grileadmitere.ro</h2>
          <p>
            Fiecare tutorial e construit în jurul programei oficiale de admitere și BAC. Găsești scheme de rezolvare, formule cheie, exemple rezolvate și capcane frecvente. Tutorialele se completează perfect cu grilele de pe site — citește teoria, apoi exersează cu sute de grile pe aceeași materie.
          </p>
          <h2>Cum studiezi eficient cu aceste tutoriale</h2>
          <ol>
            <li>Alege materia și subiectul slab.</li>
            <li>Citește tutorialul activ — notează formulele și exemplele cu mâna.</li>
            <li>Rezolvă imediat 10-20 grile pe acel subiect la <Link to="/grile">grile online</Link>.</li>
            <li>Revino peste 3 zile (repetiție spațiată) ca să consolidezi.</li>
          </ol>
        </section>
      </main>
    </div>
  );
}
