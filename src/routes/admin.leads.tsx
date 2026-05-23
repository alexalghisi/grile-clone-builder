import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { listEmailLeads } from "@/lib/leads.functions";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Mail, Download, Filter } from "lucide-react";

export const Route = createFileRoute("/admin/leads")({
  head: () => ({
    meta: [
      { title: "Admin · Leaduri email | GrileAdmitere" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: Page,
});

type Lead = {
  id: string;
  email: string;
  quiz_slug: string | null;
  source: string | null;
  created_at: string;
};

function toIsoOrNull(v: string): string | null {
  if (!v) return null;
  const d = new Date(v);
  return isNaN(d.getTime()) ? null : d.toISOString();
}

function Page() {
  const nav = useNavigate();
  const [ready, setReady] = useState(false);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        nav({ to: "/autentificare" });
        return;
      }
      setAuthed(true);
      setReady(true);
    })();
  }, [nav]);

  const [quizSlug, setQuizSlug] = useState<string>("all");
  const [from, setFrom] = useState<string>("");
  const [to, setTo] = useState<string>("");

  const fn = useServerFn(listEmailLeads);
  const query = useQuery({
    enabled: ready && authed,
    queryKey: ["admin-leads", quizSlug, from, to],
    queryFn: () =>
      fn({
        data: {
          quiz_slug: quizSlug === "all" ? null : quizSlug,
          from: from ? toIsoOrNull(from) : null,
          to: to ? toIsoOrNull(to + "T23:59:59") : null,
        },
      }),
  });

  const isForbidden =
    query.isError && String((query.error as any)?.message || "").toLowerCase().includes("forbidden");

  const rows: Lead[] = (query.data?.rows as Lead[]) ?? [];
  const quizSlugs: string[] = query.data?.quizSlugs ?? [];

  const stats = useMemo(() => {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const week = new Date(); week.setDate(week.getDate() - 7);
    const todayN = rows.filter((r) => new Date(r.created_at) >= today).length;
    const weekN = rows.filter((r) => new Date(r.created_at) >= week).length;
    return { total: rows.length, today: todayN, week: weekN };
  }, [rows]);

  const downloadCsv = () => {
    const header = "email,quiz_slug,source,created_at\n";
    const body = rows
      .map((r) =>
        [r.email, r.quiz_slug ?? "", r.source ?? "", r.created_at]
          .map((v) => `"${String(v).replace(/"/g, '""')}"`)
          .join(",")
      )
      .join("\n");
    const blob = new Blob([header + body], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `leads-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-2">
          <Mail className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Leaduri email</h1>
        </div>
        <p className="text-sm text-muted-foreground mb-6">
          Toate emailurile colectate din quiz gate. Acces restricționat doar admin.
        </p>

        {!ready ? (
          <Card className="p-8 text-center text-muted-foreground">Se încarcă…</Card>
        ) : isForbidden ? (
          <Card className="p-8 text-center">
            <h2 className="text-lg font-semibold">Acces interzis</h2>
            <p className="text-sm text-muted-foreground mt-2">
              Contul tău nu are rol de administrator.
            </p>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-3 mb-6">
              <Card className="p-4">
                <div className="text-xs text-muted-foreground">Total (filtru curent)</div>
                <div className="text-2xl font-bold">{stats.total}</div>
              </Card>
              <Card className="p-4">
                <div className="text-xs text-muted-foreground">Ultima săptămână</div>
                <div className="text-2xl font-bold">{stats.week}</div>
              </Card>
              <Card className="p-4">
                <div className="text-xs text-muted-foreground">Azi</div>
                <div className="text-2xl font-bold">{stats.today}</div>
              </Card>
            </div>

            <Card className="p-4 mb-4">
              <div className="flex items-center gap-2 mb-3 text-sm font-semibold">
                <Filter className="h-4 w-4" /> Filtre
              </div>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
                <div>
                  <label className="text-xs text-muted-foreground">Quiz</label>
                  <Select value={quizSlug} onValueChange={setQuizSlug}>
                    <SelectTrigger><SelectValue placeholder="Toate" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toate</SelectItem>
                      {quizSlugs.map((s) => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">De la</label>
                  <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Până la</label>
                  <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
                </div>
                <div className="flex items-end gap-2">
                  <Button variant="outline" onClick={() => { setQuizSlug("all"); setFrom(""); setTo(""); }}>
                    Resetează
                  </Button>
                  <Button onClick={downloadCsv} disabled={rows.length === 0}>
                    <Download className="h-4 w-4 mr-1" /> CSV
                  </Button>
                </div>
              </div>
            </Card>

            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
                    <tr>
                      <th className="text-left px-4 py-2">Email</th>
                      <th className="text-left px-4 py-2">Quiz</th>
                      <th className="text-left px-4 py-2">Sursă</th>
                      <th className="text-left px-4 py-2">Data</th>
                    </tr>
                  </thead>
                  <tbody>
                    {query.isLoading ? (
                      <tr><td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">Se încarcă…</td></tr>
                    ) : rows.length === 0 ? (
                      <tr><td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">Niciun lead pentru filtrele selectate.</td></tr>
                    ) : rows.map((r) => (
                      <tr key={r.id} className="border-t border-border hover:bg-muted/30">
                        <td className="px-4 py-2 font-medium">{r.email}</td>
                        <td className="px-4 py-2 text-muted-foreground">{r.quiz_slug ?? "-"}</td>
                        <td className="px-4 py-2 text-muted-foreground">{r.source ?? "-"}</td>
                        <td className="px-4 py-2 text-muted-foreground whitespace-nowrap">
                          {new Date(r.created_at).toLocaleString("ro-RO")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </>
        )}
      </main>
    </div>
  );
}
