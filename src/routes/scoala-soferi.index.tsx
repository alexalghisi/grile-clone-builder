import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { AdLeaderboard, AdInArticle, StickyBottomAd } from "@/components/AdSlot";
import {
  DRIVING_QUESTIONS,
  DRIVING_CATEGORIES,
  DRIVING_CHAPTERS,
} from "@/lib/scoala-soferi/questions";

const TITLE = "Chestionare Școală Șoferi 2026 — 200 Grile Gratuite DRPCIV (Cat. B, A, C, D)";
const DESC =
  "Învață și exersează gratuit cu 200 de chestionare auto reale stil DRPCIV pentru categoriile B, A, C și D. Rezolvări explicate pe Codul Rutier (OUG 195/2002). Test 26 grile.";
const URL = "https://grileadmitere.ro/scoala-soferi";

export const Route = createFileRoute("/scoala-soferi/")({
  component: ScoalaSoferiPage,
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      {
        name: "keywords",
        content:
          "chestionare auto, scoala soferi, chestionare DRPCIV, grile permis auto, chestionare categoria B, chestionare categoria A, chestionare categoria C, chestionare categoria D, cod rutier 2026, test permis auto online gratuit, simulare examen auto, chestionare 2026",
      },
      { name: "robots", content: "index, follow, max-image-preview:large" },
      { name: "author", content: "GrileAdmitere.ro" },
      { httpEquiv: "Content-Language", content: "ro-RO" },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
      { property: "og:locale", content: "ro_RO" },
      { property: "og:site_name", content: "GrileAdmitere.ro" },
      { property: "og:url", content: URL },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESC },
    ],
    links: [{ rel: "canonical", href: URL }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: TITLE,
          description: DESC,
          inLanguage: "ro-RO",
          url: URL,
          about: DRIVING_CATEGORIES.map((c) => `${c.name} — ${c.desc}`),
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Acasă", item: "https://grileadmitere.ro/" },
            { "@type": "ListItem", position: 2, name: "Școală șoferi", item: URL },
          ],
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: [
            {
              "@type": "Question",
              name: "Câte grile conține chestionarul DRPCIV?",
              acceptedAnswer: {
                "@type": "Answer",
                text:
                  "Examenul oficial DRPCIV pentru categoria B conține 26 de întrebări; ai 30 de minute și trebuie să răspunzi corect la cel puțin 22.",
              },
            },
            {
              "@type": "Question",
              name: "Sunt grilele de pe acest site reale?",
              acceptedAnswer: {
                "@type": "Answer",
                text:
                  "Toate cele 200 de grile sunt formulate în baza Codului Rutier (OUG 195/2002) și a Regulamentului de aplicare, în stilul testelor oficiale DRPCIV.",
              },
            },
            {
              "@type": "Question",
              name: "Costă ceva accesul la chestionare?",
              acceptedAnswer: {
                "@type": "Answer",
                text:
                  "Nu. Toate chestionarele, explicațiile și testul de simulare sunt 100% gratuite și disponibile online.",
              },
            },
            {
              "@type": "Question",
              name: "Pentru ce categorii am chestionare?",
              acceptedAnswer: {
                "@type": "Answer",
                text:
                  "Categoria B (auto), Categoria A (moto), Categoria C (camion) și Categoria D (autobuz).",
              },
            },
          ],
        }),
      },
    ],
  }),
});

function ScoalaSoferiPage() {
  const total = DRIVING_QUESTIONS.length;
  const byCat = DRIVING_CATEGORIES.map((c) => ({
    ...c,
    count: DRIVING_QUESTIONS.filter((q) => q.category === c.code).length,
  }));

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <nav aria-label="Breadcrumb" className="mb-4 text-sm text-muted-foreground">
          <Link to="/" className="hover:underline">Acasă</Link>
          <span className="mx-2">/</span>
          <span className="text-foreground">Școală șoferi</span>
        </nav>

        <header className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-3">
            Chestionare Școală Șoferi 2026 — {total} grile gratuite
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl">
            Pregătire completă pentru examenul auto DRPCIV. {total} grile pentru categoriile B, A, C și D,
            cu explicații pas cu pas bazate pe <strong>Codul Rutier (OUG 195/2002)</strong> și Regulamentul de aplicare.
            Test gratuit de simulare cu 26 de întrebări, exact ca la examen.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/scoala-soferi/test"
              className="px-6 py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:opacity-90"
            >
              Începe testul de 26 grile
            </Link>
            <Link
              to="/scoala-soferi/$categorie"
              params={{ categorie: "b" }}
              className="px-6 py-3 rounded-lg border border-border font-semibold hover:bg-muted"
            >
              Vezi grilele Categoria B
            </Link>
          </div>
        </header>

        <AdLeaderboard className="my-6" />

        <section className="mb-10">
          <h2 className="text-2xl font-bold mb-4">Categorii de permis</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {byCat.map((c) => (
              <Link
                key={c.code}
                to="/scoala-soferi/$categorie"
                params={{ categorie: c.slug }}
                className="block p-5 rounded-xl border border-border hover:border-primary hover:shadow-md transition"
              >
                <div className="flex items-baseline justify-between">
                  <h3 className="text-xl font-bold">{c.name}</h3>
                  <span className="text-sm text-muted-foreground">{c.count} grile</span>
                </div>
                <p className="text-sm text-muted-foreground mt-2">{c.desc}</p>
              </Link>
            ))}
          </div>
        </section>

        <AdInArticle className="my-6" />

        <section className="mb-10">
          <h2 className="text-2xl font-bold mb-4">Capitole din Codul Rutier</h2>
          <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3">
            {DRIVING_CHAPTERS.map((ch) => (
              <Link
                key={ch.code}
                to="/scoala-soferi/$categorie"
                params={{ categorie: "b" }}
                hash={ch.code}
                className="p-3 rounded-lg border border-border hover:bg-muted text-sm"
              >
                <div className="font-semibold">{ch.name}</div>
                <div className="text-xs text-muted-foreground">{ch.desc}</div>
              </Link>
            ))}
          </div>
        </section>

        <section className="prose prose-slate dark:prose-invert max-w-none mb-10">
          <h2>De ce să exersezi cu chestionare online?</h2>
          <p>
            Examenul auto DRPCIV este compus din 26 de întrebări tip grilă rezolvate
            în 30 de minute. Pentru a promova, trebuie să răspunzi corect la cel puțin
            22 dintre ele. Exersarea zilnică pe o bază largă de grile crește semnificativ
            șansele de reușită din prima.
          </p>
          <h3>Ce găsești aici</h3>
          <ul>
            <li>{total} chestionare auto, distribuite pe cele 4 categorii principale (B, A, C, D)</li>
            <li>Explicații pas cu pas, cu referire la articolul din Cod / Regulament</li>
            <li>Filtrare pe capitole: semnalizare, prioritate, depășire, viteză, alcool, prim ajutor, vehicul</li>
            <li>Test de simulare cu 26 de întrebări, timer și grilă de răspunsuri ca la examen</li>
            <li>Acces 100% gratuit, fără înregistrare</li>
          </ul>
          <h3>Bazele legale</h3>
          <p>
            Întrebările respectă <a href="https://legislatie.just.ro/Public/DetaliiDocument/40297" target="_blank" rel="noopener noreferrer">OUG 195/2002 privind circulația pe drumurile publice</a>{" "}
            și Regulamentul de aplicare aprobat prin HG 1391/2006, în concordanță cu actualizările legislative din 2025–2026.
          </p>
        </section>

        <details className="mb-4 rounded-lg border border-border p-4">
          <summary className="font-semibold cursor-pointer">Cum se desfășoară examenul auto teoretic?</summary>
          <p className="mt-3 text-sm text-muted-foreground">
            Examenul se susține la sediul DRPCIV/SPCRPCIV. Conține 26 de întrebări cu trei variante de răspuns (una sau mai multe corecte).
            Timpul alocat este 30 de minute. Promovarea se face cu minim 22 răspunsuri corecte.
          </p>
        </details>
        <details className="mb-4 rounded-lg border border-border p-4">
          <summary className="font-semibold cursor-pointer">Care este alcoolemia legală la volan?</summary>
          <p className="mt-3 text-sm text-muted-foreground">
            În România, conducerea cu orice nivel de alcool în sânge este interzisă. Peste 0,80 g/l alcool pur în sânge,
            fapta devine infracțiune (art. 336 Cod Penal) cu pedeapsa de 1–5 ani închisoare.
          </p>
        </details>

        <StickyBottomAd />
      </main>
    </div>
  );
}