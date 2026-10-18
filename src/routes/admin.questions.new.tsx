import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { adminListSubjects, adminCreateQuestion, adminUploadFigure } from "@/lib/admin-questions.functions";
import { Header } from "@/components/Header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { QuestionContent } from "@/components/QuestionContent";
import { toast } from "sonner";
import { Eye, Save, Upload, ImageIcon, X } from "lucide-react";

export const Route = createFileRoute("/admin/questions/new")({
  head: () => ({ meta: [
      { name: "description", content: "Administrarea Admin · Adaugă grilă pe GrileAdmitere.ro." },
      { property: "og:title", content: "Admin · Adaugă grilă" },
      { property: "og:description", content: "Administrarea Admin · Adaugă grilă pe GrileAdmitere.ro." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },{ title: "Admin · Adaugă grilă" }, { name: "robots", content: "noindex, nofollow" }] }),
  component: Page,
});

const LABELS = ["A", "B", "C", "D", "E", "F"];

function Page() {
  const nav = useNavigate();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) { nav({ to: "/autentificare" }); return; }
      setReady(true);
    })();
  }, [nav]);

  const listFn = useServerFn(adminListSubjects);
  const createFn = useServerFn(adminCreateQuestion);
  const uploadFn = useServerFn(adminUploadFigure);

  const { data: subjects = [] } = useQuery({
    enabled: ready,
    queryKey: ["admin-subjects"],
    queryFn: () => listFn(),
  });

  const [subjectId, setSubjectId] = useState("");
  const [session, setSession] = useState("Admitere 2025");
  const [problemNumber, setProblemNumber] = useState<number | "">("");
  const [questionText, setQuestionText] = useState("");
  const [options, setOptions] = useState<string[]>(["", "", "", "", "", ""]);
  const [correctIndex, setCorrectIndex] = useState(0);
  const [solution, setSolution] = useState("");
  const [figureUrl, setFigureUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [preview, setPreview] = useState(false);

  const updateOpt = (i: number, v: string) => {
    const next = [...options];
    next[i] = v;
    setOptions(next);
  };

  const handleUpload = async (file: File) => {
    if (file.size > 5_000_000) { toast.error("Fișier prea mare (max 5MB)"); return; }
    setUploading(true);
    try {
      const buf = await file.arrayBuffer();
      const bytes = new Uint8Array(buf);
      let bin = "";
      for (let i = 0; i < bytes.byteLength; i++) bin += String.fromCharCode(bytes[i]);
      const b64 = btoa(bin);
      const res = await uploadFn({ data: { filename: file.name, contentBase64: b64, contentType: file.type as any } });
      setFigureUrl(res.url);
      toast.success("Figură încărcată");
    } catch (e: any) {
      toast.error(e.message || "Upload eșuat");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!subjectId) { toast.error("Alege materia"); return; }
    const cleanOptions = options.map((o) => o.trim()).filter(Boolean);
    if (cleanOptions.length < 2) { toast.error("Cel puțin 2 variante de răspuns"); return; }
    if (correctIndex >= cleanOptions.length) { toast.error("Răspunsul corect e în afara variantelor"); return; }
    setSubmitting(true);
    try {
      await createFn({
        data: {
          subject_id: subjectId,
          question_text: questionText.trim(),
          options: cleanOptions,
          correct_index: correctIndex,
          solution_md: solution.trim() || null,
          figure_url: figureUrl.trim() || null,
          session: session.trim() || null,
          problem_number: typeof problemNumber === "number" ? problemNumber : null,
        },
      });
      toast.success("Grilă adăugată!");
      // Reset form, keep subject + session
      setQuestionText("");
      setOptions(["", "", "", "", "", ""]);
      setCorrectIndex(0);
      setSolution("");
      setFigureUrl("");
      setProblemNumber(typeof problemNumber === "number" ? problemNumber + 1 : "");
    } catch (e: any) {
      toast.error(e.message || "Eroare la salvare");
    } finally {
      setSubmitting(false);
    }
  };

  if (!ready) {
    return <div className="min-h-screen bg-background"><Header /><div className="container py-10">Se încarcă…</div></div>;
  }

  return (
    <div className="min-h-screen bg-background"><Header />
      <main className="container mx-auto max-w-5xl px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Adaugă grilă nouă</h1>
          <Button variant="outline" onClick={() => setPreview(!preview)}>
            <Eye className="h-4 w-4 mr-1" /> {preview ? "Editează" : "Previzualizare"}
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Editor */}
          <Card className="p-5 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Materie</Label>
                <Select value={subjectId} onValueChange={setSubjectId}>
                  <SelectTrigger><SelectValue placeholder="Alege materia…" /></SelectTrigger>
                  <SelectContent>
                    {subjects.map((s: any) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.universities?.short_name ? `${s.universities.short_name} · ` : ""}{s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Sesiune</Label>
                <Input value={session} onChange={(e) => setSession(e.target.value)} placeholder="Admitere 2025" />
              </div>
              <div>
                <Label>Nr. problemă</Label>
                <Input type="number" min={1} value={problemNumber}
                  onChange={(e) => setProblemNumber(e.target.value ? Number(e.target.value) : "")} />
              </div>
            </div>

            <div>
              <Label>Enunț <span className="text-xs text-muted-foreground">(Markdown + LaTeX: <code>$x^2$</code> sau <code>$$\int_0^1 ...$$</code>)</span></Label>
              <Textarea rows={6} value={questionText} onChange={(e) => setQuestionText(e.target.value)}
                placeholder={"Fie funcția $f:\\mathbb{R}\\to\\mathbb{R}$, $f(x)=x^2-3x+2$. Calculați $\\int_0^2 f(x)\\,dx$."} />
            </div>

            <div>
              <Label>Figură (opțional)</Label>
              <div className="flex gap-2">
                <Input value={figureUrl} onChange={(e) => setFigureUrl(e.target.value)} placeholder="URL sau încarcă o imagine →" />
                <label className="cursor-pointer">
                  <input type="file" accept="image/*" className="hidden"
                    onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUpload(f); }} />
                  <Button type="button" variant="outline" disabled={uploading} asChild>
                    <span><Upload className="h-4 w-4 mr-1" />{uploading ? "Se încarcă…" : "Încarcă"}</span>
                  </Button>
                </label>
              </div>
              {figureUrl && (
                <div className="mt-2 relative inline-block">
                  <img src={figureUrl} alt="figure" className="max-h-40 rounded border" />
                  <button onClick={() => setFigureUrl("")} className="absolute -top-2 -right-2 bg-destructive text-white rounded-full p-1">
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}
            </div>

            <div>
              <Label>Variante de răspuns (până la 6)</Label>
              <div className="space-y-2">
                {options.map((opt, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <button
                      type="button"
                      onClick={() => setCorrectIndex(i)}
                      className={`mt-1 h-9 w-9 shrink-0 rounded-full border-2 font-bold text-sm transition ${
                        correctIndex === i ? "border-green-600 bg-green-50 text-green-700" : "border-muted-foreground/30 text-muted-foreground hover:border-primary"
                      }`}
                      title="Marchează ca răspuns corect"
                    >
                      {LABELS[i]}
                    </button>
                    <Textarea rows={1} value={opt} onChange={(e) => updateOpt(i, e.target.value)}
                      placeholder={`Varianta ${LABELS[i]} (suportă LaTeX)`} className="flex-1 min-h-9" />
                  </div>
                ))}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">Click pe litera A–F pentru a marca răspunsul corect (verde). Variantele goale sunt ignorate.</p>
            </div>

            <div>
              <Label>Rezolvare pas cu pas (Markdown + LaTeX)</Label>
              <Textarea rows={6} value={solution} onChange={(e) => setSolution(e.target.value)}
                placeholder={"**Pas 1.** Calculăm primitiva...\n$$F(x)=\\frac{x^3}{3}-\\frac{3x^2}{2}+2x$$\n**Pas 2.** Aplicăm Leibniz–Newton..."} />
            </div>

            <Button onClick={handleSubmit} disabled={submitting} size="lg" className="w-full">
              <Save className="h-4 w-4 mr-1" /> {submitting ? "Se salvează…" : "Salvează grila"}
            </Button>
          </Card>

          {/* Preview */}
          <Card className="p-5">
            <div className="mb-3 flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground font-semibold">
              <Eye className="h-3 w-3" /> Previzualizare live
            </div>
            <div className="rounded-lg border bg-card p-4">
              <div className="mb-2 text-xs text-muted-foreground">
                {session && <span>{session}</span>}
                {problemNumber && <span> · Problema {problemNumber}</span>}
              </div>
              {questionText ? (
                <QuestionContent text={questionText} figureUrl={figureUrl || null} />
              ) : (
                <div className="text-muted-foreground italic">Scrie enunțul…</div>
              )}
              <div className="mt-4 space-y-2">
                {options.map((opt, i) => opt.trim() && (
                  <div key={i} className={`flex items-start gap-3 rounded-md border p-3 text-sm ${i === correctIndex ? "border-green-600 bg-green-50 dark:bg-green-950/30" : ""}`}>
                    <span className="font-bold text-primary">{LABELS[i]})</span>
                    <div className="flex-1"><QuestionContent text={opt} className="[&_p]:my-0" /></div>
                  </div>
                ))}
              </div>
              {solution.trim() && (
                <div className="mt-4 rounded-md border border-green-600/40 bg-green-50 dark:bg-green-950/20 p-3">
                  <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Rezolvare</div>
                  <QuestionContent text={solution} />
                </div>
              )}
            </div>
          </Card>
        </div>

        <div className="mt-6 text-sm text-muted-foreground">
          <Link to="/admin/leads" className="underline">← Înapoi la admin</Link>
        </div>
      </main>
    </div>
  );
}