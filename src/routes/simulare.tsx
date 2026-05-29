import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { listSimulations } from "@/lib/db.functions";
import { Header } from "@/components/Header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trophy, Clock, Lock, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/simulare")({
  head: () => ({
    meta: [
      { title: "Simulări Admitere 2026 — Format Real Cronometrat" },
      { name: "description", content: "Simulări admitere 2026 cronometrate, cu 6 variante de răspuns A-F, formule matematice și figuri, în format identic cu examenul real UPB/UB." },
      { property: "og:title", content: "Simulare Admitere 2026 — Test Cronometrat Gratuit" },
      { property: "og:description", content: "Simulări cronometrate în format real, feedback instant și rezolvare pas cu pas." },
    ],
    links: [{ rel: "canonical", href: "https://grileadmitere.ro/simulare" }],
  }),
  component: Page,
});

function Page() {
  const fn = useServerFn(listSimulations);
  const { data: sims = [], isLoading } = useQuery({
    queryKey: ["simulations"],
    queryFn: () => fn(),
    staleTime: 5 * 60 * 1000,
  });

  return (
    <div className="min-h-screen bg-background"><Header />
      <main className="container mx-auto max-w-5xl px-4 py-12">
        <div className="text-center mb-10">
          <Trophy className="mx-auto h-12 w-12 text-primary" />
          <h1 className="mt-4 text-3xl md:text-4xl font-bold">Simulări admitere 2026</h1>
          <p className="mt-2 text-muted-foreground max-w-xl mx-auto">
            Format real: 6 variante A–F, formule matematice, figuri, cronometru. Rezolvare pas cu pas la final.
          </p>
        </div>

        {isLoading ? (
          <div className="text-center text-muted-foreground py-12">Se încarcă simulările…</div>
        ) : sims.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground">Simulările sunt în pregătire. Revino curând!</p>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {sims.map((s: any) => (
              <Card key={s.id} className="p-6 transition hover:border-primary/40 hover:shadow-md">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex flex-wrap items-center gap-2">
                    {s.universities?.short_name && <Badge variant="outline">{s.universities.short_name}</Badge>}
                    {s.session && <Badge variant="secondary">{s.session}</Badge>}
                  </div>
                  {s.is_premium && (
                    <Badge className="bg-amber-500 text-white"><Lock className="mr-1 h-3 w-3" />Premium</Badge>
                  )}
                </div>
                <h2 className="text-lg font-bold">{s.title}</h2>
                {s.description && <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{s.description}</p>}
                <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1"><Clock className="h-4 w-4" />{s.duration_minutes} min</span>
                  <span className="flex items-center gap-1"><Trophy className="h-4 w-4" />{s.total_questions} probleme</span>
                </div>
                <Link to="/simulare/$slug" params={{ slug: s.slug }} className="mt-4 block">
                  <Button className="w-full">Începe <ArrowRight className="ml-2 h-4 w-4" /></Button>
                </Link>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
