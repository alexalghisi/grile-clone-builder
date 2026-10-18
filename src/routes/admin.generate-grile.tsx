import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Sparkles, Loader2, Square } from "lucide-react";
import {
  listSubjectsWithAdvancedCount,
  generateAdvancedBatch,
  resetSubjectQuestions,
} from "@/lib/ai-grile.functions";

export const Route = createFileRoute("/admin/generate-grile")({
  head: () => ({
    meta: [
      { name: "description", content: "Administrarea Admin · Generare AI Grile Avansate pe GrileAdmitere.ro." },
      { property: "og:title", content: "Admin · Generare AI Grile Avansate" },
      { property: "og:description", content: "Administrarea Admin · Generare AI Grile Avansate pe GrileAdmitere.ro." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Admin · Generare AI Grile Avansate" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: Page,
});

const TARGET = 200;
const BATCH = 20;

function Page() {
  const nav = useNavigate();
  const qc = useQueryClient();
  const [ready, setReady] = useState(false);
  const [search, setSearch] = useState("");
  const [running, setRunning] = useState<Record<string, number>>({}); // subjectId -> inserted in this session
  const [bulkActive, setBulkActive] = useState(false);
  const [stopFlag, setStopFlag] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) { nav({ to: "/autentificare" }); return; }
      setReady(true);
    })();
  }, [nav]);

  const listFn = useServerFn(listSubjectsWithAdvancedCount);
  const genFn = useServerFn(generateAdvancedBatch);
  const resetFn = useServerFn(resetSubjectQuestions);

  const { data: subjects = [] } = useQuery({
    queryKey: ["admin-subjects-advanced"],
    queryFn: () => listFn(),
    enabled: ready,
  });

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return subjects;
    return subjects.filter((s: any) =>
      s.name.toLowerCase().includes(q) || s.university.toLowerCase().includes(q)
    );
  }, [subjects, search]);

  async function generateForSubject(subjectId: string, label: string) {
    setRunning((p) => ({ ...p, [subjectId]: 0 }));
    const subj = subjects.find((s: any) => s.id === subjectId);
    const already = subj?.advanced ?? 0;
    let totalNew = 0;
    const needed = Math.max(0, TARGET - already);
    if (needed === 0) {
      toast.info(`${label}: deja are ${already}/${TARGET}`);
      setRunning((p) => { const n = { ...p }; delete n[subjectId]; return n; });
      return;
    }
    const batches = Math.ceil(needed / BATCH);
    for (let i = 0; i < batches; i++) {
      if (stopFlag) break;
      try {
        const r = await genFn({ data: { subjectId, batchSize: BATCH } });
        totalNew += r.inserted;
        setRunning((p) => ({ ...p, [subjectId]: totalNew }));
      } catch (e: any) {
        toast.error(`${label}: ${e.message}`);
        break;
      }
    }
    toast.success(`${label}: +${totalNew} grile noi`);
    setRunning((p) => { const n = { ...p }; delete n[subjectId]; return n; });
    qc.invalidateQueries({ queryKey: ["admin-subjects-advanced"] });
  }

  async function generateAll() {
    if (!confirm(`Vei genera până la ${TARGET} grile avansate pentru ${filtered.length} materii. Poate dura ore. Continui?`)) return;
    setBulkActive(true);
    setStopFlag(false);
    for (const s of filtered as any[]) {
      if (stopFlag) break;
      if ((s.advanced ?? 0) >= TARGET) continue;
      await generateForSubject(s.id, `${s.university} · ${s.name}`);
    }
    setBulkActive(false);
    toast.success("Generare bulk încheiată");
  }

  async function resetSubject(subjectId: string, label: string) {
    if (!confirm(`ȘTERGI TOATE grilele pentru "${label}"? Nu se poate anula.`)) return;
    try {
      const r = await resetFn({ data: { subjectId, onlyAiGenerated: false } });
      toast.success(`${label}: șterse ${r.deleted} grile`);
      qc.invalidateQueries({ queryKey: ["admin-subjects-advanced"] });
    } catch (e: any) {
      toast.error(`Reset eșuat: ${e.message}`);
    }
  }

  if (!ready) return null;

  return (
    <>
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Sparkles className="w-7 h-7 text-primary" /> Generare AI · Grile Avansate
            </h1>
            <p className="text-muted-foreground mt-1">
              Target: <b>{TARGET}</b> grile avansate per materie · sesiune <code>"Generat AI · Avansat"</code>
            </p>
          </div>
          <div className="flex gap-2">
            {bulkActive ? (
              <Button variant="destructive" onClick={() => setStopFlag(true)}>
                <Square className="w-4 h-4 mr-1" /> Oprește
              </Button>
            ) : (
              <Button onClick={generateAll} disabled={Object.keys(running).length > 0}>
                <Sparkles className="w-4 h-4 mr-1" /> Generează pentru TOATE ({filtered.length})
              </Button>
            )}
          </div>
        </div>

        <Input
          placeholder="Caută după materie sau facultate..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mb-4"
        />

        <div className="space-y-2">
          {(filtered as any[]).map((s) => {
            const inProgress = running[s.id];
            const advanced = s.advanced + (inProgress ?? 0);
            const pct = Math.min(100, Math.round((advanced / TARGET) * 100));
            const done = advanced >= TARGET;
            return (
              <Card key={s.id} className="p-3">
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{s.name}</div>
                    <div className="text-xs text-muted-foreground truncate">{s.university}</div>
                  </div>
                  <Badge variant={done ? "default" : "secondary"}>
                    {advanced}/{TARGET} avansate
                  </Badge>
                  <Badge variant="outline">{s.total} total</Badge>
                  <div className="w-32"><Progress value={pct} /></div>
                  <Button
                    size="sm"
                    disabled={inProgress !== undefined || done}
                    onClick={() => generateForSubject(s.id, `${s.university} · ${s.name}`)}
                  >
                    {inProgress !== undefined ? (
                      <><Loader2 className="w-4 h-4 mr-1 animate-spin" /> {inProgress} noi…</>
                    ) : done ? "Complet" : "Generează 200"}
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    disabled={inProgress !== undefined}
                    onClick={() => resetSubject(s.id, `${s.university} · ${s.name}`)}
                    title="Șterge toate grilele acestei materii"
                  >
                    Reset
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      </main>
    </>
  );
}