import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { listUniversities } from "@/lib/db.functions";
import { Header } from "@/components/Header";
import { AdSlot } from "@/components/AdSlot";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, BookOpen, Trophy, Sparkles } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const fn = useServerFn(listUniversities);
  const { data: unis = [] } = useQuery({ queryKey: ["unis"], queryFn: () => fn() });

  const groups = [
    { title: "Universități Tehnice", match: ["upb","upt","utcn","tuiasi","utbv","upit","upg"] },
    { title: "Medicină", match: ["umf"] },
    { title: "Economie & Drept", match: ["ase","unibuc","ubb","uvt"] },
    { title: "Toate universitățile", match: null as null | string[] },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <section className="border-b border-border bg-gradient-to-br from-primary/10 via-background to-background">
        <div className="container mx-auto px-4 py-16 text-center">
          <Badge variant="secondary" className="mb-4">Admitere 2026</Badge>
          <h1 className="mx-auto max-w-3xl text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Grile cu explicații pas cu pas pentru admitere și BAC
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            UPB, UBB, UTCN, UMF, UAIC, ASE și alte universități din România.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/grile"><Button size="lg"><BookOpen className="mr-2 h-4 w-4" />Vezi grile</Button></Link>
            <Link to="/simulare"><Button size="lg" variant="outline"><Trophy className="mr-2 h-4 w-4" />Simulare</Button></Link>
          </div>
          <div className="mt-10 grid grid-cols-3 gap-4 max-w-md mx-auto text-sm">
            <div><div className="text-2xl font-bold text-primary">{unis.length}</div><div className="text-muted-foreground">Universități</div></div>
            <div><div className="text-2xl font-bold text-primary">265+</div><div className="text-muted-foreground">Materii</div></div>
            <div><div className="text-2xl font-bold text-primary">74k+</div><div className="text-muted-foreground">Grile</div></div>
          </div>
        </div>
      </section>

      <main className="container mx-auto px-4 py-10 space-y-12">
        <AdSlot className="my-4" />

        {groups.map((g) => {
          const list = g.match
            ? unis.filter((u: any) => g.match!.some((m) => u.slug.startsWith(m)))
            : unis;
          if (!list.length) return null;
          return (
            <section key={g.title}>
              <h2 className="mb-4 flex items-center gap-2 text-2xl font-semibold">
                <Sparkles className="h-5 w-5 text-primary" />{g.title}
              </h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {list.map((u: any) => (
                  <Link key={u.id} to="/grile/$uniSlug" params={{ uniSlug: u.slug }}>
                    <Card className="p-5 h-full transition-shadow hover:shadow-lg hover:border-primary/40">
                      <div className="flex items-start gap-3">
                        <div className="rounded-md bg-primary/10 p-2"><GraduationCap className="h-5 w-5 text-primary" /></div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold truncate">{u.short_name}</div>
                          <div className="text-xs text-muted-foreground truncate">{u.name}</div>
                          <div className="mt-1 text-xs text-muted-foreground">{u.city}</div>
                        </div>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            </section>
          );
        })}

        <AdSlot className="my-4" />
      </main>

      <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">
        © 2026 GrileAdmitere.ro — Grile cu explicații pas cu pas
      </footer>
    </div>
  );
}
