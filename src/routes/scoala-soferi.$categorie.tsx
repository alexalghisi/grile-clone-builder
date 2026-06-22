import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { AdLeaderboard, AdInArticle, StickyBottomAd } from "@/components/AdSlot";
import {
  DRIVING_QUESTIONS,
  DRIVING_CATEGORIES,
  DRIVING_CHAPTERS,
  type DrivingQuestion,
} from "@/lib/scoala-soferi/questions";

function findCategory(slug: string) {
  return DRIVING_CATEGORIES.find((c) => c.slug === slug.toLowerCase());
}

export const Route = createFileRoute("/scoala-soferi/$categorie")({
  loader: ({ params }) => {
    const cat = findCategory(params.categorie);
    if (!cat) throw notFound();
    const qs: DrivingQuestion[] = DRIVING_QUESTIONS.filter((q) => q.category === cat.code);
    return { cat, qs };
  },
  head: ({ params }) => {
    const cat = findCategory(params.categorie);
    const slug = params.categorie.toLowerCase();
    if (!cat) {
      return { meta: [{ title: "Categorie inexistentă" }, { name: "robots", content: "noindex" }] };
    }
    const count = DRIVING_QUESTIONS.filter((q) => q.category === cat.code).length;
    const title = `Chestionare ${cat.name} 2026 — ${count} grile gratuite | Școală șoferi`;
    const desc = `${count} chestionare ${cat.name} (${cat.desc}) cu explicații pe Codul Rutier. Pregătire DRPCIV gratuită. Exersează online, fără înregistrare.`;
    const url = `https://grileadmitere.ro/scoala-soferi/${slug}`;
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        {
          name: "keywords",
          content: `chestionare ${cat.name}, chestionare auto ${cat.code}, scoala soferi ${cat.code}, DRPCIV ${cat.code}, grile permis ${cat.code}, cod rutier ${cat.code}`,
        },
        { name: "robots", content: "index, follow, max-image-preview:large" },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:type", content: "website" },
        { property: "og:url", content: url },
        { property: "og:locale", content: "ro_RO" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Acasă", item: "https://grileadmitere.ro/" },
              { "@type": "ListItem", position: 2, name: "Școală șoferi", item: "https://grileadmitere.ro/scoala-soferi" },
              { "@type": "ListItem", position: 3, name: cat.name, item: url },
            ],
          }),
        },
      ],
    };
  },
  component: CategoryPage,
  notFoundComponent: () => (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-3xl font-bold mb-2">Categorie inexistentă</h1>
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

function CategoryPage() {
  const { cat, qs } = Route.useLoaderData();
  const byChapter = DRIVING_CHAPTERS.map((ch) => ({
    ...ch,
    items: qs.filter((q: DrivingQuestion) => q.chapter === ch.code),
  })).filter((g) => g.items.length > 0);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <nav aria-label="Breadcrumb" className="mb-4 text-sm text-muted-foreground">
          <Link to="/" className="hover:underline">Acasă</Link>
          <span className="mx-2">/</span>
          <Link to="/scoala-soferi" className="hover:underline">Școală șoferi</Link>
          <span className="mx-2">/</span>
          <span className="text-foreground">{cat.name}</span>
        </nav>

        <header className="mb-6">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            Chestionare {cat.name} — {qs.length} grile
          </h1>
          <p className="text-muted-foreground max-w-3xl">{cat.desc}. Exersează gratuit cu grile reale și explicații complete.</p>
          <div className="mt-4">
            <Link
              to="/scoala-soferi/test"
              search={{ cat: cat.slug as "a"|"b"|"c"|"d" }}
              className="inline-block px-5 py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold"
            >
              Începe test {cat.name}
            </Link>
          </div>
        </header>

        <AdLeaderboard className="my-5" />

        {byChapter.map((g, idx) => (
          <section key={g.code} id={g.code} className="mb-8">
            <h2 className="text-2xl font-bold mb-3">{g.name}</h2>
            <p className="text-sm text-muted-foreground mb-4">{g.desc}</p>
            <ol className="space-y-3">
              {g.items.map((q: DrivingQuestion, i: number) => (
                <li key={q.id} className="rounded-lg border border-border p-4">
                  <Link
                    to="/scoala-soferi/grila/$slug"
                    params={{ slug: q.slug }}
                    className="font-medium hover:text-primary"
                  >
                    {i + 1}. {q.question}
                  </Link>
                </li>
              ))}
            </ol>
            {idx === 1 && <AdInArticle className="my-6" />}
          </section>
        ))}

        <StickyBottomAd />
      </main>
    </div>
  );
}