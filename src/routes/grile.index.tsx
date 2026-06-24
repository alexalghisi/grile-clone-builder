import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { listUniversities } from "@/lib/db.functions";
import { Header } from "@/components/Header";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { GraduationCap } from "lucide-react";
import { AdSlot } from "@/components/AdSlot";

export const Route = createFileRoute("/grile/")({
  head: () => {
    const title = "Grile Admitere 2026 — Cea Mai Mare Bază de Grile + Profesori Verificați";
    const description =
      "Grile admitere 2026 rezolvate pas cu pas de profesori cu experiență: UMF, UPB, UBB, ASE, UAIC, UTCN și 100+ facultăți. Mii de grile + profesori verificați. 100% gratuit.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { name: "keywords", content: "grile, grile admitere, grile online, grile rezolvate, grile facultate, grile UMF, grile UPB, grile ASE, grile UBB, grile UAIC, grile UTCN, grile medicina, grile informatica, grile matematica, grile biologie, grile chimie, grile profesori, profesori grile, grile cu profesori, admitere 2026, teste admitere" },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { property: "og:url", content: "https://grileadmitere.ro/grile" },
      ],
      links: [{ rel: "canonical", href: "https://grileadmitere.ro/grile" }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Acasă", item: "https://grileadmitere.ro/" },
              { "@type": "ListItem", position: 2, name: "Grile Admitere", item: "https://grileadmitere.ro/grile" },
            ],
          }),
        },
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: title,
            description,
            url: "https://grileadmitere.ro/grile",
            inLanguage: "ro-RO",
            isPartOf: { "@type": "WebSite", name: "GrileAdmitere.ro", url: "https://grileadmitere.ro" },
          }),
        },
      ],
    };
  },
  component: Page,
});

function Page() {
  const fn = useServerFn(listUniversities);
  const { data: unis = [] } = useQuery({ queryKey: ["unis"], queryFn: () => fn() });
  const [q, setQ] = useState("");
  const filtered = useMemo(
    () => unis.filter((u: any) => `${u.short_name} ${u.name} ${u.city}`.toLowerCase().includes(q.toLowerCase())),
    [unis, q]
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-10">
        <nav aria-label="Breadcrumb" className="mb-3 text-xs text-muted-foreground">
          <Link to="/" className="hover:underline">Acasă</Link>
          <span className="mx-1">/</span>
          <span>Grile Admitere</span>
        </nav>
        <h1 className="text-3xl font-bold">Grile Admitere 2026 — Toate Universitățile + Profesori Verificați</h1>
        <p className="mt-2 text-muted-foreground">
          {unis.length} universități · mii de <strong>grile</strong> admitere rezolvate pas cu pas de <strong>profesori</strong> verificați — Medicină (UMF), Politehnică (UPB, UTCN), Drept, Informatică, ASE, UBB, UAIC și multe altele.
        </p>
        <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
          Alege universitatea ta și exersează gratuit cu mii de grile reale din anii precedenți, cu explicații detaliate pentru fiecare răspuns. Ideal pentru pregătirea admiterii 2026 la facultate.
        </p>
        <Input className="mt-6 max-w-md" placeholder="Caută universitate sau oraș…" value={q} onChange={(e) => setQ(e.target.value)} />
        <AdSlot className="my-6" />
        <h2 className="mb-3 text-lg font-semibold">Lista universităților</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((u: any) => (
            <Link key={u.id} to="/grile/$uniSlug" params={{ uniSlug: u.slug }}>
              <Card className="p-5 h-full transition hover:border-primary/40 hover:shadow">
                <div className="flex items-start gap-3">
                  <GraduationCap className="h-5 w-5 text-primary mt-1" />
                  <div className="min-w-0">
                    <div className="font-semibold truncate">{u.short_name}</div>
                    <div className="text-xs text-muted-foreground line-clamp-2">{u.name}</div>
                    <div className="mt-1 text-xs text-muted-foreground">{u.city}</div>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
        <section className="mt-10 max-w-3xl text-sm text-muted-foreground space-y-3">
          <h2 className="text-lg font-semibold text-foreground">De ce să te pregătești cu GrileAdmitere.ro</h2>
          <p>Platforma noastră adună <strong>grile</strong> reale de admitere de la cele mai importante universități din România. Fiecare <strong>grilă</strong> vine cu explicații pas cu pas scrise de <strong>profesori</strong>, ca să înțelegi raționamentul, nu doar răspunsul corect.</p>
          <p>Indiferent dacă cauți <strong>grile</strong> de Medicină la UMF Carol Davila, <strong>grile</strong> de Informatică la Politehnică sau <strong>grile</strong> de Drept la Universitatea București — și indiferent dacă vrei <strong>profesori</strong> de matematică, biologie, chimie sau română — găsești aici totul pentru admitere 2026, complet gratuit.</p>
          <p>Vezi și <Link to="/profesori" className="text-primary underline">directorul de profesori pe materii</Link> — profesori particulari care publică grile rezolvate pas cu pas.</p>
          <h3 className="pt-3 text-base font-semibold text-foreground">Grile pe categorii</h3>
          <ul className="grid grid-cols-1 gap-1 sm:grid-cols-2">
            <li>• Grile admitere medicină (UMF)</li>
            <li>• Grile admitere politehnică (UPB, UTCN)</li>
            <li>• Grile admitere informatică (UBB, UAIC, UPB)</li>
            <li>• Grile admitere ASE și cibernetică</li>
            <li>• Grile admitere drept</li>
            <li>• Grile BAC pe materii</li>
            <li>• Grile cu profesori verificați</li>
            <li>• Grile rezolvate pas cu pas — gratuit</li>
          </ul>
        </section>
      </main>
    </div>
  );
}
