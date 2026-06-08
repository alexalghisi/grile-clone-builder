import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Trash2, Upload, Save, FileText } from "lucide-react";
import { toast } from "sonner";
import {
  adminCreateSubiectBac,
  adminDeleteSubiectBac,
  adminUploadBacPdf,
  listSubiecteBac,
  adminBulkImportBac,
} from "@/lib/subiecte-bac.functions";

export const Route = createFileRoute("/admin/subiecte-bac")({
  head: () => ({
    meta: [
      { title: "Admin · Subiecte BAC" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: Page,
});

const SESIUNI = [
  { value: "simulare", label: "Simulare" },
  { value: "iunie-iulie", label: "Iunie–Iulie" },
  { value: "august-septembrie", label: "August–Septembrie" },
  { value: "rezerva", label: "Rezervă" },
];
const TIPURI = [
  { value: "subiect", label: "Subiect" },
  { value: "barem", label: "Barem" },
];
const ANI = Array.from({ length: 2026 - 2010 + 1 }, (_, i) => 2026 - i);

function Page() {
  const nav = useNavigate();
  const qc = useQueryClient();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) { nav({ to: "/autentificare" }); return; }
      setReady(true);
    })();
  }, [nav]);

  const createFn = useServerFn(adminCreateSubiectBac);
  const uploadFn = useServerFn(adminUploadBacPdf);
  const deleteFn = useServerFn(adminDeleteSubiectBac);
  const bulkFn = useServerFn(adminBulkImportBac);

  const { data: rows = [] } = useQuery({
    enabled: ready,
    queryKey: ["admin-bac-rows"],
    queryFn: () => listSubiecteBac({ data: {} }),
  });

  const [year, setYear] = useState<number>(2026);
  const [session, setSession] = useState("iunie-iulie");
  const [subjectName, setSubjectName] = useState("");
  const [profil, setProfil] = useState("");
  const [paperType, setPaperType] = useState("subiect");
  const [title, setTitle] = useState("");
  const [pdfUrl, setPdfUrl] = useState("");
  const [storagePath, setStoragePath] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [variant, setVariant] = useState("");
  const [description, setDescription] = useState("");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const reset = () => {
    setSubjectName(""); setProfil(""); setTitle(""); setPdfUrl(""); setStoragePath("");
    setSourceUrl(""); setVariant(""); setDescription("");
  };

  const handleUpload = async (file: File) => {
    if (file.size > 18_000_000) { toast.error("Fișier prea mare (max 18MB)"); return; }
    if (file.type !== "application/pdf") { toast.error("Doar PDF"); return; }
    setUploading(true);
    try {
      const buf = await file.arrayBuffer();
      const bytes = new Uint8Array(buf);
      let bin = "";
      for (let i = 0; i < bytes.byteLength; i++) bin += String.fromCharCode(bytes[i]);
      const b64 = btoa(bin);
      const res = await uploadFn({ data: { filename: file.name, contentBase64: b64 } });
      setPdfUrl(res.url); setStoragePath(res.path);
      toast.success("PDF încărcat");
    } catch (e: any) {
      toast.error(e.message || "Upload eșuat");
    } finally { setUploading(false); }
  };

  const handleSave = async () => {
    if (!subjectName.trim() || !title.trim()) { toast.error("Completează materie și titlu"); return; }
    if (!pdfUrl) { toast.error("Adaugă un PDF (link sau încărcat)"); return; }
    setSaving(true);
    try {
      await createFn({ data: {
        year, session: session as any, subject_name: subjectName.trim(),
        profil: profil.trim() || null, paper_type: paperType as any, title: title.trim(),
        pdf_url: pdfUrl || null, storage_path: storagePath || null,
        source_url: sourceUrl.trim() || null, variant: variant.trim() || null,
        description: description.trim() || null,
      } as any });
      toast.success("Subiect salvat");
      reset();
      qc.invalidateQueries({ queryKey: ["admin-bac-rows"] });
      qc.invalidateQueries({ queryKey: ["bac-filters"] });
      qc.invalidateQueries({ queryKey: ["bac-rows"] });
    } catch (e: any) {
      toast.error(e.message || "Eroare la salvare");
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Sigur ștergi subiectul?")) return;
    try {
      await deleteFn({ data: { id } });
      toast.success("Șters");
      qc.invalidateQueries({ queryKey: ["admin-bac-rows"] });
      qc.invalidateQueries({ queryKey: ["bac-filters"] });
      qc.invalidateQueries({ queryKey: ["bac-rows"] });
    } catch (e: any) { toast.error(e.message); }
  };

  const [bulkUrls, setBulkUrls] = useState("");
  const [bulkRehost, setBulkRehost] = useState(true);
  const [bulkYear, setBulkYear] = useState<string>("");
  const [bulkSession, setBulkSession] = useState<string>("");
  const [bulkBusy, setBulkBusy] = useState(false);
  const [bulkResults, setBulkResults] = useState<Array<{ url: string; ok: boolean; message: string }>>([]);

  const handleBulk = async () => {
    const urls = bulkUrls.split(/\s+/).map((s) => s.trim()).filter((s) => /^https?:\/\//.test(s));
    if (urls.length === 0) { toast.error("Lipsesc URL-uri valide"); return; }
    setBulkBusy(true); setBulkResults([]);
    try {
      const res: any = await bulkFn({ data: {
        urls, rehost: bulkRehost,
        defaultYear: bulkYear ? Number(bulkYear) : null,
        defaultSession: (bulkSession || null) as any,
      } });
      setBulkResults(res.results);
      toast.success(`Import: ${res.ok} OK · ${res.fail} eșuate`);
      qc.invalidateQueries({ queryKey: ["admin-bac-rows"] });
      qc.invalidateQueries({ queryKey: ["bac-filters"] });
      qc.invalidateQueries({ queryKey: ["bac-rows"] });
    } catch (e: any) {
      toast.error(e.message || "Import eșuat");
    } finally { setBulkBusy(false); }
  };

  if (!ready) return null;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold">Admin · Subiecte Bacalaureat</h1>
        <p className="text-sm text-muted-foreground">Adaugă subiecte și bareme oficiale (PDF) — încărcare directă sau link extern.</p>

        <Card className="mt-6 p-5">
          <h2 className="text-lg font-semibold">Adaugă subiect</h2>
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <Label>An</Label>
              <Select value={String(year)} onValueChange={(v) => setYear(Number(v))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{ANI.map((y) => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Sesiune</Label>
              <Select value={session} onValueChange={setSession}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{SESIUNI.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Materie *</Label>
              <Input value={subjectName} onChange={(e) => setSubjectName(e.target.value)} placeholder="ex: Matematică M1" />
            </div>
            <div>
              <Label>Profil / specializare</Label>
              <Input value={profil} onChange={(e) => setProfil(e.target.value)} placeholder="ex: real, uman, mate-info, științe ale naturii" />
            </div>
            <div>
              <Label>Tip</Label>
              <Select value={paperType} onValueChange={setPaperType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{TIPURI.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Variantă (opțional)</Label>
              <Input value={variant} onChange={(e) => setVariant(e.target.value)} placeholder="ex: 1, 2, model" />
            </div>
            <div className="md:col-span-2">
              <Label>Titlu *</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="ex: BAC Matematică M1 — Iunie 2024, varianta oficială" />
            </div>
            <div className="md:col-span-2">
              <Label>Descriere (opțional)</Label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} />
            </div>
            <div className="md:col-span-2">
              <Label>PDF</Label>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <Input type="file" accept="application/pdf" onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])} disabled={uploading} className="max-w-xs" />
                <span className="text-xs text-muted-foreground">sau link direct:</span>
                <Input value={pdfUrl} onChange={(e) => { setPdfUrl(e.target.value); setStoragePath(""); }} placeholder="https://subiecte.edu.ro/…/subiect.pdf" className="flex-1 min-w-[280px]" />
              </div>
              {pdfUrl && <p className="mt-2 text-xs text-muted-foreground"><FileText className="inline h-3 w-3" /> {storagePath ? "Fișier încărcat la noi" : "Link extern"}</p>}
            </div>
            <div className="md:col-span-2">
              <Label>URL sursă oficială (opțional)</Label>
              <Input value={sourceUrl} onChange={(e) => setSourceUrl(e.target.value)} placeholder="https://subiecte.edu.ro/2024/…" />
            </div>
          </div>
          <div className="mt-5 flex gap-2">
            <Button onClick={handleSave} disabled={saving || uploading}>
              <Save className="mr-1 h-4 w-4" />{saving ? "Se salvează…" : "Salvează"}
            </Button>
            {uploading && <span className="text-sm text-muted-foreground"><Upload className="inline h-3 w-3 animate-pulse" /> Se încarcă PDF-ul…</span>}
          </div>
        </Card>

        <Card className="mt-6 p-5">
          <h2 className="text-lg font-semibold">Import în masă (URL-uri)</h2>
          <p className="text-sm text-muted-foreground">Lipește mai multe URL-uri oficiale (subiecte.edu.ro, variante.edu.ro, mateinfo.ro etc.) — câte unul pe linie. Sistemul detectează automat materia, anul, sesiunea, varianta și tipul (subiect/barem), descarcă PDF-ul și îl rehostează la noi pentru SEO și monetizare.</p>
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="md:col-span-3">
              <Label>URL-uri PDF (unul pe linie)</Label>
              <Textarea value={bulkUrls} onChange={(e) => setBulkUrls(e.target.value)} rows={8}
                placeholder={"https://subiecte.edu.ro/2024/bacalaureat/.../E_c_matematica_M_mate-info_2024_var_01_LRO.pdf\nhttps://subiecte.edu.ro/2024/bacalaureat/.../E_c_matematica_M_mate-info_2024_var_01_LRO_bar.pdf"} />
            </div>
            <div>
              <Label>An implicit (dacă lipsește din URL)</Label>
              <Select value={bulkYear || "__none"} onValueChange={(v) => setBulkYear(v === "__none" ? "" : v)}>
                <SelectTrigger><SelectValue placeholder="Detectează din URL" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none">Detectează din URL</SelectItem>
                  {ANI.map((y) => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Sesiune implicită</Label>
              <Select value={bulkSession || "__none"} onValueChange={(v) => setBulkSession(v === "__none" ? "" : v)}>
                <SelectTrigger><SelectValue placeholder="Detectează din URL" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none">Detectează din URL</SelectItem>
                  {SESIUNI.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={bulkRehost} onChange={(e) => setBulkRehost(e.target.checked)} />
                Rehost PDF la noi (recomandat)
              </label>
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <Button onClick={handleBulk} disabled={bulkBusy}>
              <Upload className="mr-1 h-4 w-4" />{bulkBusy ? "Se importă…" : "Importă"}
            </Button>
          </div>
          {bulkResults.length > 0 && (
            <div className="mt-4 max-h-80 overflow-auto rounded border text-xs">
              {bulkResults.map((r, i) => (
                <div key={i} className={`flex gap-2 border-b p-2 ${r.ok ? "" : "bg-destructive/10"}`}>
                  <span className={r.ok ? "text-green-600" : "text-destructive"}>{r.ok ? "OK" : "ERR"}</span>
                  <span className="truncate">{r.message}</span>
                  <span className="ml-auto truncate text-muted-foreground max-w-md">{r.url}</span>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="mt-6 p-5">
          <h2 className="text-lg font-semibold">Subiecte existente ({rows.length})</h2>
          <div className="mt-3 divide-y">
            {rows.length === 0 && <p className="py-4 text-sm text-muted-foreground">Niciun subiect încă.</p>}
            {rows.map((r: any) => (
              <div key={r.id} className="flex flex-wrap items-center gap-2 py-2">
                <Badge variant="secondary">{r.year}</Badge>
                <Badge variant="outline">{r.session}</Badge>
                <Badge variant="outline">{r.paper_type}</Badge>
                {r.profil && <Badge variant="outline">{r.profil}</Badge>}
                <span className="text-sm font-medium">{r.subject_name}</span>
                <span className="text-xs text-muted-foreground truncate max-w-md">{r.title}</span>
                <div className="ml-auto flex gap-1">
                  {r.pdf_url && <a href={r.pdf_url} target="_blank" rel="noopener noreferrer"><Button size="sm" variant="outline">PDF</Button></a>}
                  <Button size="sm" variant="ghost" onClick={() => handleDelete(r.id)}><Trash2 className="h-3 w-3" /></Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </main>
    </div>
  );
}