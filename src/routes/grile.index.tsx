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
  head: () => ({
    meta: [
      { title: "Grile Admitere — Toate Universitățile 2026 | GrileAdmitere.ro" },
      { name: "description", content: "Lista completă a universităților din România cu grile admitere 2026 rezolvate: UMF, UPB, UBB, ASE, UAIC, UTCN și 100+ instituții." },
      { property: "og:title", content: "Grile Admitere — Toate Universitățile 2026" },
      { property: "og:description", content: "Alege universitatea și începe pregătirea cu grile rezolvate pas cu pas." },
    ],
    links: [{ rel: "canonical", href: "https://grileadmitere.ro/grile" }],
  }),
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
        <h1 className="text-3xl font-bold">Toate universitățile</h1>
        <p className="mt-2 text-muted-foreground">{unis.length} universități · alege una pentru a vedea materiile</p>
        <Input className="mt-6 max-w-md" placeholder="Caută universitate sau oraș…" value={q} onChange={(e) => setQ(e.target.value)} />
        <AdSlot className="my-6" />
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
      </main>
    </div>
  );
}
