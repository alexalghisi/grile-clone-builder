import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
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
import { AdLeaderboard, AdInArticle } from "@/components/AdSlot";

const SESIUNI = [
  { value: "simulare", label: "Simulare" },
  { value: "iunie-iulie", label: "Iunie–Iulie" },
  { value: "august-septembrie", label: "August–Septembrie" },
  { value: "rezerva", label: "Rezervă" },
];

export const Route = createFileRoute("/subiecte-bac")({
  head: () => {
    const title = "Subiecte BAC 2026 + Bareme — Arhivă Subiecte Bacalaureat 2010–2026 PDF";
    const description = "Subiecte BAC 2026 și subiecte bacalaureat 2010–2026 cu bareme oficiale PDF: subiecte bac română, subiecte bac matematică M1/M2/M3, subiecte bac istorie, biologie, fizică, chimie, geografie, informatică. Simulare BAC, sesiunea iunie–iulie, august–septembrie, rezervă. Descarcă gratuit toate variantele de subiecte bac.";
    const url = "https://grileadmitere.ro/subiecte-bac";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { name: "keywords", content: "subiecte bac, subiecte bac 2026, subiecte bac 2025, subiecte bac 2024, subiecte bac 2023, subiecte bacalaureat, subiecte bacalaureat 2026, subiecte bac pdf, subiecte bac rezolvate, subiecte bac oficiale, bareme bac, bareme bacalaureat, variante bac, variante bacalaureat, subiecte bac romana, subiecte bac matematica, subiecte bac matematica m1, subiecte bac matematica m2, subiecte bac matematica m3, subiecte bac istorie, subiecte bac biologie, subiecte bac fizica, subiecte bac chimie, subiecte bac geografie, subiecte bac informatica, subiecte bac logica, subiecte bac psihologie, subiecte bac economie, simulare bac, simulare bacalaureat, subiecte simulare bac, subiecte edu ro, subiecte bac edu ro, model subiect bac, modele subiecte bac, arhiva subiecte bac" },
        { name: "robots", content: "index, follow, max-image-preview:large, max-snippet:-1" },
        { name: "author", content: "GrileAdmitere.ro" },
        { httpEquiv: "Content-Language", content: "ro-RO" },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:url", content: url },
        { property: "og:type", content: "website" },
        { property: "og:locale", content: "ro_RO" },
        { property: "og:site_name", content: "GrileAdmitere.ro" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: description },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Acasă", item: "https://grileadmitere.ro/" },
              { "@type": "ListItem", position: 2, name: "Subiecte Bacalaureat", item: url },
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
            url,
            inLanguage: "ro-RO",
            isPartOf: { "@type": "WebSite", name: "GrileAdmitere.ro", url: "https://grileadmitere.ro" },
            about: [
              "Bacalaureat România", "Subiecte BAC", "Bareme BAC",
              "Simulare Bacalaureat", "Variante Bacalaureat",
            ],
          }),
        },
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: [
              { "@type": "Question", name: "Unde găsesc subiectele BAC oficiale 2026?",
                acceptedAnswer: { "@type": "Answer", text: "Subiectele BAC 2026 oficiale, împreună cu baremele de corectare, sunt publicate în arhiva GrileAdmitere.ro — preluate din sursele oficiale subiecte.edu.ro și variante.edu.ro, în PDF, gratuit, pentru fiecare materie și sesiune." } },
              { "@type": "Question", name: "Ce subiecte BAC sunt disponibile pe GrileAdmitere.ro?",
                acceptedAnswer: { "@type": "Answer", text: "Subiecte BAC la Limba Română, Matematică M1 (Mate-Info), M2 (Științe ale Naturii), M3 (Pedagogic / Tehnologic), Istorie, Biologie, Fizică, Chimie, Geografie, Informatică, Logică, Psihologie, Economie și limbi moderne — toate cu bareme PDF." } },
              { "@type": "Question", name: "Ce sesiuni de subiecte bacalaureat acoperă arhiva?",
                acceptedAnswer: { "@type": "Answer", text: "Toate sesiunile de Bacalaureat: simulare (națională și județeană), sesiunea iunie–iulie, sesiunea august–septembrie și sesiunea de rezervă, pentru fiecare an din 2010 până în 2026." } },
              { "@type": "Question", name: "Sunt gratuite subiectele BAC și baremele PDF?",
                acceptedAnswer: { "@type": "Answer", text: "Da. Toate subiectele BAC și baremele sunt gratuite. PDF-urile pot fi descărcate sau vizualizate direct în browser, fără cont și fără abonament." } },
              { "@type": "Question", name: "Cum se pregătește un elev pentru subiectele BAC 2026?",
                acceptedAnswer: { "@type": "Answer", text: "Cea mai eficientă metodă este rezolvarea subiectelor BAC din anii precedenți (2020–2025) împreună cu baremul, cronometrând lucrarea, urmată de simulare BAC și recapitulare pe materii." } },
              { "@type": "Question", name: "Care sunt cele mai căutate subiecte de bacalaureat?",
                acceptedAnswer: { "@type": "Answer", text: "Cele mai căutate sunt subiectele BAC la Română, Matematică M1, Istorie și Biologie — urmate de Fizică, Chimie, Geografie, Informatică și Anatomie." } },
            ],
          }),
        },
      ],
    };
  },
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

  const filters: Filters = (initial.filters as unknown as Filters);
  const { data: filtersData = filters } = useQuery<Filters>({
    queryKey: ["bac-filters"],
    queryFn: () => getSubiecteBacFilters() as unknown as Promise<Filters>,
    initialData: filters,
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
          <h1 className="text-3xl font-bold sm:text-4xl">Subiecte BAC 2026 + Subiecte Bacalaureat 2010–2026 cu Bareme PDF</h1>
          <p className="mt-3 text-muted-foreground">
            Cea mai completă arhivă de <strong>subiecte bac</strong> și <strong>subiecte bacalaureat</strong> din România: <strong>subiecte BAC oficiale</strong> și <strong>bareme</strong> pentru toate materiile (Română, Matematică M1/M2/M3, Istorie, Biologie, Fizică, Chimie, Geografie, Informatică, Logică, Psihologie, Economie) și toate sesiunile (<strong>simulare BAC</strong>, iunie–iulie, august–septembrie, rezervă), din 2010 până în 2026. Descarcă <strong>subiecte BAC PDF</strong> gratuit.
          </p>
          <nav aria-label="Breadcrumb" className="mt-3 text-xs text-muted-foreground">
            <Link to="/" className="hover:underline">Acasă</Link>
            <span className="mx-1">/</span>
            <span>Subiecte Bacalaureat</span>
          </nav>
        </div>

        <Card className="mt-6 p-4 md:p-5">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Caută după titlu sau cuvânt cheie…" className="pl-9" />
              </div>
            </div>
            <FilterSelect label="An" value={an} onChange={setAn} options={filtersData.years.map((y: number) => ({ value: String(y), label: String(y) }))} />
            <FilterSelect label="Materie" value={materie} onChange={setMaterie} options={filtersData.materii.map((m: { slug: string; name: string }) => ({ value: m.slug, label: m.name }))} />
            <FilterSelect label="Sesiune" value={sesiune} onChange={setSesiune} options={SESIUNI} />
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            {filtersData.profile.length > 0 && (
              <div className="min-w-[180px]">
                <FilterSelect label="Profil" value={profil} onChange={setProfil} options={filtersData.profile.map((p: string) => ({ value: p, label: p }))} />
              </div>
            )}
            {activeCount > 0 && (
              <Button variant="ghost" size="sm" onClick={resetFilters}>
                <X className="mr-1 h-3 w-3" /> Resetează filtrele
              </Button>
            )}
          </div>
        </Card>

        <AdLeaderboard className="my-6" />

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

        {filtersData.materii.length > 0 && (
          <section className="mt-12">
            <h2 className="text-xl font-semibold">Subiecte BAC pe materii</h2>
            <p className="mt-1 text-sm text-muted-foreground">Vezi toate subiectele și baremele pentru fiecare materie de Bacalaureat.</p>
            <ul className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
              {filtersData.materii.map((m) => (
                <li key={m.slug}>
                  <Link to="/subiecte-bac/materie/$materie" params={{ materie: m.slug }}
                    className="block rounded-md border bg-card px-3 py-2 text-sm transition hover:border-primary/40 hover:text-primary">
                    Subiecte BAC {m.name}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        <AdInArticle />

        {filtersData.years.length > 0 && (
          <section className="mt-10">
            <h2 className="text-xl font-semibold">Subiecte BAC pe ani</h2>
            <p className="mt-1 text-sm text-muted-foreground">Arhivă subiecte Bacalaureat pe ani, din 2010 până în 2026.</p>
            <ul className="mt-4 flex flex-wrap gap-2">
              {filtersData.years.map((y) => (
                <li key={y}>
                  <Link to="/subiecte-bac/an/$an" params={{ an: String(y) }}
                    className="rounded-md border bg-card px-3 py-1.5 text-sm transition hover:border-primary/40 hover:text-primary">
                    Subiecte BAC {y}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="mt-12 max-w-3xl text-sm text-muted-foreground space-y-3">
          <h2 className="text-xl font-semibold text-foreground">Subiecte BAC — arhivă oficială 2010–2026</h2>
          <p>GrileAdmitere.ro centralizează <strong>toate subiectele BAC</strong> și <strong>subiectele bacalaureat</strong> publicate oficial de Ministerul Educației pe subiecte.edu.ro și variante.edu.ro, din 2010 până la <strong>subiectele BAC 2026</strong>. Pentru fiecare probă scrisă găsești <strong>subiectul BAC</strong> și <strong>baremul de corectare</strong> în format PDF, gata de descărcat.</p>
          <p>Filtrele de mai sus te ajută să găsești rapid <strong>subiecte BAC Română</strong>, <strong>subiecte BAC Matematică (M1, M2, M3)</strong>, <strong>subiecte BAC Istorie</strong>, <strong>subiecte BAC Biologie</strong>, <strong>subiecte BAC Fizică</strong>, <strong>subiecte BAC Chimie</strong>, <strong>subiecte BAC Geografie</strong>, <strong>subiecte BAC Informatică</strong>, Logică, Psihologie și Economie — pentru orice sesiune: <strong>simulare BAC</strong>, iunie–iulie, august–septembrie sau rezervă.</p>
          <p>Pregătirea pentru examenul de <strong>Bacalaureat 2026</strong> este mult mai eficientă dacă rezolvi <strong>subiecte BAC reale</strong> din anii precedenți. Folosește arhiva de <strong>variante BAC</strong> pentru a exersa modelele clasice, a învăța din bareme și a-ți antrena ritmul de lucru pe lucrarea oficială.</p>

          <h3 className="text-base font-semibold text-foreground pt-2">Subiecte BAC pe ani — acces rapid</h3>
          <p>Vezi <strong>subiecte BAC 2026</strong>, <strong>subiecte BAC 2025</strong>, <strong>subiecte BAC 2024</strong>, <strong>subiecte BAC 2023</strong>, <strong>subiecte BAC 2022</strong>, <strong>subiecte BAC 2021</strong>, <strong>subiecte BAC 2020</strong> și până la <strong>subiecte BAC 2010</strong> — fiecare an cu toate materiile, profilurile și baremele oficiale.</p>

          <h3 className="text-base font-semibold text-foreground pt-2">Subiecte BAC pe materii — cele mai căutate</h3>
          <p><strong>Subiecte BAC Română</strong> (proba scrisă obligatorie), <strong>subiecte BAC Matematică M1</strong> (Mate-Info), <strong>subiecte BAC Matematică M2</strong> (Științe ale Naturii), <strong>subiecte BAC Matematică M3</strong> (Pedagogic/Tehnologic), <strong>subiecte BAC Istorie</strong>, <strong>subiecte BAC Biologie</strong> (vegetală, animală, anatomie), <strong>subiecte BAC Fizică</strong>, <strong>subiecte BAC Chimie</strong> (organică, anorganică), <strong>subiecte BAC Geografie</strong>, <strong>subiecte BAC Informatică</strong> (C/C++, Pascal).</p>

          <h3 className="text-base font-semibold text-foreground pt-2">Întrebări frecvente</h3>
          <details className="rounded-md border bg-card p-3"><summary className="cursor-pointer font-medium text-foreground">Sunt subiectele BAC oficiale?</summary><p className="mt-2">Da, toate <strong>subiectele bacalaureat</strong> și baremele provin din sursele oficiale (subiecte.edu.ro / variante.edu.ro) și sunt rehostate pe GrileAdmitere.ro pentru viteză și disponibilitate.</p></details>
          <details className="rounded-md border bg-card p-3"><summary className="cursor-pointer font-medium text-foreground">Pot descărca subiectele BAC în PDF?</summary><p className="mt-2">Da, fiecare <strong>subiect BAC</strong> și fiecare barem are buton de descărcare directă în PDF.</p></details>
          <details className="rounded-md border bg-card p-3"><summary className="cursor-pointer font-medium text-foreground">Există și subiecte de la simulările județene?</summary><p className="mt-2">Da, sesiunea „Simulare BAC” include simulările naționale și județene atunci când sunt publicate oficial.</p></details>
          <details className="rounded-md border bg-card p-3"><summary className="cursor-pointer font-medium text-foreground">Cum aleg subiectul BAC potrivit pentru pregătire?</summary><p className="mt-2">Filtrează după <strong>materie</strong>, <strong>an</strong>, <strong>sesiune</strong> și <strong>profil</strong>. Începe cu subiectele BAC din 2025 și 2024, apoi mergi în urmă spre 2010 pentru variație de modele.</p></details>
        </section>
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