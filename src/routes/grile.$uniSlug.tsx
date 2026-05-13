import { createFileRoute, Link, useServerFn } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getUniversity } from "@/lib/db.functions";
import { Header } from "@/components/Header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AdSlot } from "@/components/AdSlot";
import { BookOpen } from "lucide-react";

export const Route = createFileRoute("/grile/$uniSlug")({ component: Page });

function Page() {
  const { uniSlug } = Route.useParams();
  const fn = useServerFn(getUniversity);
  const { data, isLoading } = useQuery({ queryKey: ["uni", uniSlug], queryFn: () => fn({ data: { slug: uniSlug } }) });

  if (isLoading) return (<div className="min-h-screen bg-background"><Header /><div className="container py-10">Se încarcă…</div></div>);
  if (!data) return (<div className="min-h-screen bg-background"><Header /><div className="container py-10">Universitate negăsită.</div></div>);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-10">
        <Link to="/grile" className="text-sm text-muted-foreground hover:underline">← Toate universitățile</Link>
        <h1 className="mt-2 text-3xl font-bold">{data.name}</h1>
        <p className="text-muted-foreground">{data.city} · {data.subjects.length} materii</p>
        {data.description && <p className="mt-4 max-w-2xl text-sm text-muted-foreground">{data.description}</p>}
        <AdSlot className="my-6" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 mt-6">
          {data.subjects.map((s: any) => (
            <Link key={s.id} to="/quiz/$slug" params={{ slug: s.slug }}>
              <Card className="p-5 h-full transition hover:border-primary/40 hover:shadow">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex gap-3">
                    <BookOpen className="h-5 w-5 text-primary mt-1" />
                    <div>
                      <div className="font-semibold">{s.name}</div>
                      <div className="text-xs text-muted-foreground">{s.slug}</div>
                    </div>
                  </div>
                  <Badge variant="secondary">{s.question_count} grile</Badge>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
