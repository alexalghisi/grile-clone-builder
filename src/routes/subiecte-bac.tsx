import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Header } from "@/components/Header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Download, Eye, FileText, Search, X } from "lucide-react";
import { getSubiecteBacFilters, listSubiecteBac } from "@/lib/subiecte-bac.functions";

const SESIUNI = [
  { value: "simulare", label: "Simulare" },
  { value: "iunie-iulie", label: "Iunie–Iulie" },
  { value: "august-septembrie", label: "August–Septembrie" },
  { value: "rezerva", label: "Rezervă" },
];

export const Route = createFileRoute("/subiecte-bac")({
  head: () => ({
    meta: [
      { title: "Subiecte Bacalaureat 2010–2026 — Arhivă oficială PDF" },
      { name: "description", content: "Arhivă cu subiecte și bareme oficiale de Bacalaureat 2010–2026, pentru toate materiile și sesiunile. Caută, filtrează, descarcă PDF." },
      { property: "og:title", content: "Subiecte Bacalaureat 2010–2026 — Arhivă oficială PDF" },
      { property: "og:description", content: "Subiecte și bareme BAC 2010–2026, toate materiile și sesiunile. Filtre după an, materie, sesiune și profil." },
      { property: "og:url", content: "https://grileadmitere.ro/subiecte-bac" },
    ],
    links: [{ rel: "canonical", href: "https://grileadmitere.ro/subiecte-bac" }],
  }),
  loader: async () => ({
    filters: await getSubiecteBacFilters(),
    rows: await listSubiecteBac({ data: {} }),
  }),
  component: Page,
});

type Row = {
  id: string;
  year: number;
  session: string;
  subject_slug: string;
  subject_name: string;
  profil: string | null;
  paper_type: string;
  title: string;
  pdf_url: string | null;
  storage_path: string | null;
  source_url: string | null;
  variant: string | null;
  description: string | null;
};
type Filters = { years: number[]; sessions: string[]; materii: { slug: string; name: string }[]; profile: string[] };

function Page() {
  const initial = Route.useLoaderData();
  const [an, setAn] = useState<string>("");
  const [materie, setMaterie] = useState<string>("");
  const [sesiune, setSesiune] = useState<string>("");
  const [profil, setProfil] = useState<string>("");
  const [q, setQ] = useState("");

  const { data: filters = initial.filters } = useQuery<Filters>({
    queryKey: ["bac-filters"],
    queryFn: () => getSubiecteBacFilters() as unknown as Promise<Filters>,
    initialData: initial.filters,
  });

  const { data: rows = [] } = useQuery<Row[]>({
    queryKey: ["bac-rows", an, materie, sesiune, profil, q],
    queryFn: () =>
      listSubiecteBac({
        data: {
          an: an ? Number(an) : null,
          materie: materie || null,
          sesiune: sesiune || null,
          profil: profil || null,
          q: q || null,
        },
      }) as unknown as Promise<Row[]>,
    initialData: initial.rows,
  });

  const grupate = useMemo(() => {
    const map = new Map<string, Row[]>();
    rows.forEach((r: Row) => {
      const key = `${r.year}|${r.session}|${r.subject_slug}|${r.profil ?? ""}|${r.variant ?? ""}`;
      const list = map.get(key) ?? [];
      list.push(r);
      map.set(key, list);
    });
    return Array.from(map.values());
  }, [rows]);

  const resetFilters = () => { setAn(""); setMaterie(""); setSesiune(""); setProfil(""); setQ(""); };
  const activeCount = [an, materie, sesiune, profil, q].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-3xl">
          <h1 className="text-3xl font-bold sm:text-4xl">Subiecte Bacalaureat 2010–2026</h1>
          <p className="mt-3 text-muted-foreground">
            Arhivă cu subiecte și bareme oficiale de Bacalaureat pentru toate materiile și sesiunile (simulare, iunie–iulie, august–septembrie, rezervă). Filtrează după an, materie, sesiune sau profil și descarcă PDF-ul oficial.
          </p>
        </div>

        <Card className="mt-6 p-4 md:p-5">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Caută după titlu sau cuvânt cheie…" className="pl-9" />
              </div>
            </div>
            <FilterSelect label="An" value={an} onChange={setAn} options={filters.years.map((y) => ({ value: String(y), label: String(y) }))} />
            <FilterSelect label="Materie" value={materie} onChange={setMaterie} options={filters.materii.map((m) => ({ value: m.slug, label: m.name }))} />
            <FilterSelect label="Sesiune" value={sesiune} onChange={setSesiune} options={SESIUNI} />
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            {filters.profile.length > 0 && (
              <div className="min-w-[180px]">
                <FilterSelect label="Profil" value={profil} onChange={setProfil} options={filters.profile.map((p) => ({ value: p, label: p }))} />
              </div>
            )}
            {activeCount > 0 && (
              <Button variant="ghost" size="sm" onClick={resetFilters}>
                <X className="mr-1 h-3 w-3" /> Resetează filtrele
              </Button>
            )}
          </div>
        </Card>

        <div className="mt-8">
          {rows.length === 0 ? (
            <Card className="p-10 text-center">
              <FileText className="mx-auto h-10 w-10 text-muted-foreground" />
              <h2 className="mt-3 text-lg font-semibold">Niciun subiect încă</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Subiectele oficiale vor apărea aici pe măsură ce sunt încărcate din sursele oficiale (subiecte.edu.ro / variante.edu.ro).
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {grupate.map((group, i) => <Grup key={i} items={group} />)}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function FilterSelect({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  return (
    <Select value={value || "__all"} onValueChange={(v) => onChange(v === "__all" ? "" : v)}>
      <SelectTrigger><SelectValue placeholder={label} /></SelectTrigger>
      <SelectContent>
        <SelectItem value="__all">Toate · {label}</SelectItem>
        {options.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
      </SelectContent>
    </Select>
  );
}

function Grup({ items }: { items: Row[] }) {
  const first = items[0];
  const subiect = items.find((i) => i.paper_type === "subiect");
  const barem = items.find((i) => i.paper_type === "barem");
  const sesLabel = SESIUNI.find((s) => s.value === first.session)?.label ?? first.session;
  return (
    <Card className="p-4 transition hover:border-primary/40">
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <Badge variant="secondary">{first.year}</Badge>
        <Badge variant="outline">{sesLabel}</Badge>
        {first.profil && <Badge variant="outline">{first.profil}</Badge>}
        {first.variant && <Badge variant="outline">Var. {first.variant}</Badge>}
      </div>
      <h3 className="mt-2 text-base font-semibold">{first.subject_name}</h3>
      <p className="mt-0.5 text-sm text-muted-foreground line-clamp-2">{first.title}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {subiect && <PdfButtons row={subiect} label="Subiect" />}
        {barem && <PdfButtons row={barem} label="Barem" />}
        {!subiect && !barem && items.map((r) => <PdfButtons key={r.id} row={r} label={r.paper_type === "barem" ? "Barem" : "Subiect"} />)}
      </div>
    </Card>
  );
}

function PdfButtons({ row, label }: { row: Row; label: string }) {
  const url = row.pdf_url || "";
  if (!url) return null;
  return (
    <div className="flex items-center gap-1">
      <a href={url} target="_blank" rel="noopener noreferrer">
        <Button size="sm" variant="outline"><Eye className="mr-1 h-3 w-3" />{label}</Button>
      </a>
      <a href={url} download>
        <Button size="sm" variant="ghost"><Download className="h-3 w-3" /></Button>
      </a>
    </div>
  );
}