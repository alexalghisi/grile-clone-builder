import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const SESIUNI = ["simulare", "iunie-iulie", "august-septembrie", "rezerva"] as const;
const TIPURI = ["subiect", "barem"] as const;

function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 120);
}

async function assertAdmin(userId: string) {
  const { data } = await supabaseAdmin
    .from("user_roles").select("role")
    .eq("user_id", userId).eq("role", "admin").maybeSingle();
  if (!data) throw new Error("Forbidden");
}

export const listSubiecteBac = createServerFn({ method: "GET" })
  .inputValidator((d: { an?: number | null; materie?: string | null; sesiune?: string | null; profil?: string | null; q?: string | null }) => d)
  .handler(async ({ data }) => {
    let q = supabaseAdmin
      .from("bac_papers")
      .select("id, year, session, subject_slug, subject_name, profil, paper_type, title, pdf_url, storage_path, source_url, variant, description")
      .order("year", { ascending: false })
      .order("session", { ascending: true })
      .order("paper_type", { ascending: true })
      .limit(2000);
    if (data.an) q = q.eq("year", data.an);
    if (data.materie) q = q.eq("subject_slug", data.materie);
    if (data.sesiune) q = q.eq("session", data.sesiune);
    if (data.profil) q = q.eq("profil", data.profil);
    if (data.q && data.q.trim()) {
      const t = data.q.trim().replace(/[%,]/g, " ");
      q = q.or(`title.ilike.%${t}%,description.ilike.%${t}%,subject_name.ilike.%${t}%`);
    }
    const { data: rows } = await q;
    return rows ?? [];
  });

export const getSubiecteBacFilters = createServerFn({ method: "GET" }).handler(async () => {
  const { data } = await supabaseAdmin
    .from("bac_papers")
    .select("year, session, subject_slug, subject_name, profil");
  const years = new Set<number>();
  const sessions = new Set<string>();
  const materii = new Map<string, string>();
  const profile = new Set<string>();
  (data ?? []).forEach((r: any) => {
    years.add(r.year);
    if (r.session) sessions.add(r.session);
    if (r.subject_slug) materii.set(r.subject_slug, r.subject_name);
    if (r.profil) profile.add(r.profil);
  });
  return {
    years: Array.from(years).sort((a, b) => b - a),
    sessions: Array.from(sessions).sort(),
    materii: Array.from(materii.entries()).map(([slug, name]) => ({ slug, name })).sort((a, b) => a.name.localeCompare(b.name, "ro")),
    profile: Array.from(profile).sort(),
  };
});

export const getBacByMaterie = createServerFn({ method: "GET" })
  .inputValidator((d: { slug: string }) => d)
  .handler(async ({ data }) => {
    const { data: rows } = await supabaseAdmin
      .from("bac_papers")
      .select("id, slug, year, session, subject_slug, subject_name, profil, paper_type, title, pdf_url, storage_path, source_url, variant, description")
      .eq("subject_slug", data.slug)
      .order("year", { ascending: false })
      .order("session", { ascending: true })
      .limit(2000);
    const list = rows ?? [];
    const name = list[0]?.subject_name ?? data.slug;
    return { name, slug: data.slug, rows: list };
  });

export const getBacByYear = createServerFn({ method: "GET" })
  .inputValidator((d: { year: number }) => d)
  .handler(async ({ data }) => {
    const { data: rows } = await supabaseAdmin
      .from("bac_papers")
      .select("id, slug, year, session, subject_slug, subject_name, profil, paper_type, title, pdf_url, storage_path, source_url, variant, description")
      .eq("year", data.year)
      .order("subject_name", { ascending: true })
      .order("session", { ascending: true })
      .limit(3000);
    return { year: data.year, rows: rows ?? [] };
  });

export const getBacBySlug = createServerFn({ method: "GET" })
  .inputValidator((d: { slug: string }) => d)
  .handler(async ({ data }) => {
    const { data: row } = await supabaseAdmin
      .from("bac_papers")
      .select("id, slug, year, session, subject_slug, subject_name, profil, paper_type, title, pdf_url, storage_path, source_url, variant, description")
      .eq("slug", data.slug)
      .maybeSingle();
    if (!row) return null;
    // related: same subject+year+session+variant (subiect+barem pair) and other variants same year
    const { data: pair } = await supabaseAdmin
      .from("bac_papers")
      .select("id, slug, paper_type, pdf_url, title")
      .eq("subject_slug", row.subject_slug)
      .eq("year", row.year)
      .eq("session", row.session)
      .eq("variant", row.variant);
    const { data: years } = await supabaseAdmin
      .from("bac_papers")
      .select("slug, year, session, variant")
      .eq("subject_slug", row.subject_slug)
      .order("year", { ascending: false })
      .limit(20);
    return { row, pair: pair ?? [], related: years ?? [] };
  });

const CreateInput = z.object({
  year: z.number().int().min(2000).max(2030),
  session: z.enum(SESIUNI),
  subject_name: z.string().min(2).max(120),
  subject_slug: z.string().min(1).max(120).optional(),
  profil: z.string().max(120).optional().nullable(),
  paper_type: z.enum(TIPURI),
  title: z.string().min(3).max(300),
  pdf_url: z.string().url().max(2000).optional().nullable(),
  storage_path: z.string().max(500).optional().nullable(),
  source_url: z.string().url().max(2000).optional().nullable(),
  variant: z.string().max(120).optional().nullable(),
  description: z.string().max(2000).optional().nullable(),
});

export const adminCreateSubiectBac = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => CreateInput.parse(i))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const subject_slug = data.subject_slug?.trim() || slugify(data.subject_name);
    const baseSlug = slugify(`${subject_slug}-${data.year}-${data.session}-${data.paper_type}${data.profil ? "-" + data.profil : ""}${data.variant ? "-" + data.variant : ""}`);
    let slug = baseSlug;
    for (let i = 2; i < 50; i++) {
      const { data: exists } = await supabaseAdmin.from("bac_papers").select("id").eq("slug", slug).maybeSingle();
      if (!exists) break;
      slug = `${baseSlug}-${i}`;
    }
    if (!data.pdf_url && !data.storage_path) throw new Error("Trebuie un PDF (link sau fișier încărcat)");
    const { data: row, error } = await supabaseAdmin.from("bac_papers").insert({
      year: data.year,
      session: data.session,
      subject_slug,
      subject_name: data.subject_name,
      profil: data.profil || null,
      paper_type: data.paper_type,
      title: data.title,
      slug,
      pdf_url: data.pdf_url || null,
      storage_path: data.storage_path || null,
      source_url: data.source_url || null,
      variant: data.variant || null,
      description: data.description || null,
    }).select("id, slug").single();
    if (error) throw new Error(error.message);
    return row;
  });

export const adminUploadBacPdf = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => z.object({
    filename: z.string().min(1).max(200),
    contentBase64: z.string().min(1).max(20_000_000),
  }).parse(i))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const safe = data.filename.replace(/[^a-zA-Z0-9._-]/g, "_");
    const path = `${Date.now()}-${safe}`;
    const buf = Buffer.from(data.contentBase64, "base64");
    const { error } = await supabaseAdmin.storage.from("bac-subiecte").upload(path, buf, {
      contentType: "application/pdf", upsert: false,
    });
    if (error) throw new Error(error.message);
    const { data: pub } = supabaseAdmin.storage.from("bac-subiecte").getPublicUrl(path);
    return { url: pub.publicUrl, path };
  });

export const adminDeleteSubiectBac = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => z.object({ id: z.string().uuid() }).parse(i))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const { data: row } = await supabaseAdmin.from("bac_papers").select("storage_path").eq("id", data.id).maybeSingle();
    if (row?.storage_path) {
      await supabaseAdmin.storage.from("bac-subiecte").remove([row.storage_path]);
    }
    const { error } = await supabaseAdmin.from("bac_papers").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ---------- BULK IMPORT ----------

const MATERII_MAP: Array<{ re: RegExp; name: string; slug: string }> = [
  { re: /e[_\-\s]?a[_\-\s]|limba[_\-\s]?(si[_\-\s]?literatura[_\-\s]?)?romana|romana/i, name: "Limba și literatura română", slug: "romana" },
  { re: /matemati[ck]a?[_\-\s]?m[_\-\s]?mate[_\-\s]?info|m[_\-\s]?mate[_\-\s]?info|mate_info|m1\b/i, name: "Matematică M_mate-info", slug: "matematica-mate-info" },
  { re: /matemati[ck]a?[_\-\s]?m[_\-\s]?st[_\-\s]?nat|m[_\-\s]?st[_\-\s]?nat|m2\b/i, name: "Matematică M_șt-nat", slug: "matematica-st-nat" },
  { re: /matemati[ck]a?[_\-\s]?m[_\-\s]?tehnologic|m[_\-\s]?tehnologic|m3\b/i, name: "Matematică M_tehnologic", slug: "matematica-tehnologic" },
  { re: /matemati[ck]a?[_\-\s]?m[_\-\s]?pedagogic|m[_\-\s]?pedagogic/i, name: "Matematică M_pedagogic", slug: "matematica-pedagogic" },
  { re: /matemati[ck]/i, name: "Matematică", slug: "matematica" },
  { re: /istorie/i, name: "Istorie", slug: "istorie" },
  { re: /geografie/i, name: "Geografie", slug: "geografie" },
  { re: /biologie[_\-\s]?vegetala?[_\-\s]?animala?|bio[_\-\s]?veg/i, name: "Biologie vegetală și animală", slug: "biologie-vegetala-animala" },
  { re: /anatomie|biologie[_\-\s]?(11|12)|biologie/i, name: "Biologie (Anatomie)", slug: "biologie-anatomie" },
  { re: /fizica/i, name: "Fizică", slug: "fizica" },
  { re: /chimie[_\-\s]?organica/i, name: "Chimie organică", slug: "chimie-organica" },
  { re: /chimie[_\-\s]?anorganica|chimie/i, name: "Chimie anorganică", slug: "chimie-anorganica" },
  { re: /informatica[_\-\s]?c\+\+|c_?\+\+|cpp|informatica/i, name: "Informatică (C/C++)", slug: "informatica" },
  { re: /logica|filosofie|economie|psihologie|sociologie/i, name: "Socio-umane", slug: "socio-umane" },
  { re: /engleza|franceza|germana|spaniola|italiana|maghiara|rusa|portugheza/i, name: "Limbă modernă", slug: "limba-moderna" },
];

function detectFromText(text: string) {
  const t = decodeURIComponent(text);
  const lower = t.toLowerCase();
  // year
  const yearMatch = lower.match(/(20[12]\d)/);
  const year = yearMatch ? Number(yearMatch[1]) : null;
  // session
  let session: string | null = null;
  if (/simulare/.test(lower)) session = "simulare";
  else if (/(august|septembrie|toamna)/.test(lower)) session = "august-septembrie";
  else if (/(rezerva|rezerv[ăa])/.test(lower)) session = "rezerva";
  else if (/(iunie|iulie|vara|sesiune[_\-\s]?i)/.test(lower)) session = "iunie-iulie";
  // type
  const paperType = /(barem|baremul|raspunsuri|rezolvari)/.test(lower) ? "barem" : "subiect";
  // variant
  const varMatch = lower.match(/(?:var|varianta|model)[_\-\s]*([0-9]{1,2}|model)/);
  const variant = varMatch ? varMatch[1] : null;
  // profil
  let profil: string | null = null;
  if (/mate[_\-\s]?info/.test(lower)) profil = "mate-info";
  else if (/st[_\-\s]?nat|stiinte[_\-\s]?ale[_\-\s]?naturii/.test(lower)) profil = "științe ale naturii";
  else if (/uman/.test(lower)) profil = "uman";
  else if (/real/.test(lower)) profil = "real";
  else if (/tehnologic/.test(lower)) profil = "tehnologic";
  else if (/pedagogic/.test(lower)) profil = "pedagogic";
  // materie
  const m = MATERII_MAP.find((x) => x.re.test(lower));
  const subject = m ? { name: m.name, slug: m.slug } : null;
  return { year, session, paperType, variant, profil, subject };
}

const BulkInput = z.object({
  urls: z.array(z.string().url().max(2000)).min(1).max(200),
  rehost: z.boolean().optional().default(true),
  defaultYear: z.number().int().min(2000).max(2030).optional().nullable(),
  defaultSession: z.enum(SESIUNI).optional().nullable(),
});

export const adminBulkImportBac = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => BulkInput.parse(i))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const results: Array<{ url: string; ok: boolean; message: string; id?: string }> = [];
    for (const url of data.urls) {
      try {
        const filename = decodeURIComponent(url.split("?")[0].split("/").pop() || "subiect.pdf");
        const det = detectFromText(filename + " " + url);
        const year = det.year ?? data.defaultYear ?? null;
        const session = det.session ?? data.defaultSession ?? null;
        if (!year) throw new Error("An nedetectat");
        if (!session) throw new Error("Sesiune nedetectată");
        if (!det.subject) throw new Error("Materie nedetectată");

        let pdf_url: string = url;
        let storage_path: string | null = null;
        if (data.rehost) {
          const res = await fetch(url, { headers: { "user-agent": "Mozilla/5.0 GrileAdmitereBot/1.0" } });
          if (!res.ok) throw new Error(`Download ${res.status}`);
          const ct = res.headers.get("content-type") || "";
          if (!ct.includes("pdf") && !filename.toLowerCase().endsWith(".pdf")) throw new Error("Nu e PDF");
          const buf = Buffer.from(await res.arrayBuffer());
          if (buf.length > 25_000_000) throw new Error("PDF >25MB");
          const safe = filename.replace(/[^a-zA-Z0-9._-]/g, "_");
          const path = `${year}/${det.subject.slug}/${Date.now()}-${safe}`;
          const up = await supabaseAdmin.storage.from("bac-subiecte").upload(path, buf, {
            contentType: "application/pdf", upsert: false,
          });
          if (up.error) throw new Error(up.error.message);
          const { data: pub } = supabaseAdmin.storage.from("bac-subiecte").getPublicUrl(path);
          pdf_url = pub.publicUrl;
          storage_path = path;
        }

        const sesLabel = SESIUNI_LABELS[session] ?? session;
        const title = `BAC ${det.subject.name} — ${sesLabel} ${year}${det.profil ? " · " + det.profil : ""}${det.variant ? " · varianta " + det.variant : ""} (${det.paperType === "barem" ? "barem" : "subiect oficial"})`;
        const baseSlug = slugify(`${det.subject.slug}-${year}-${session}-${det.paperType}${det.profil ? "-" + det.profil : ""}${det.variant ? "-v" + det.variant : ""}`);
        let slug = baseSlug;
        for (let i = 2; i < 50; i++) {
          const { data: exists } = await supabaseAdmin.from("bac_papers").select("id").eq("slug", slug).maybeSingle();
          if (!exists) break;
          slug = `${baseSlug}-${i}`;
        }
        const { data: row, error } = await supabaseAdmin.from("bac_papers").insert({
          year, session, subject_slug: det.subject.slug, subject_name: det.subject.name,
          profil: det.profil, paper_type: det.paperType, title, slug,
          pdf_url, storage_path, source_url: url, variant: det.variant, description: null,
        }).select("id").single();
        if (error) throw new Error(error.message);
        results.push({ url, ok: true, message: `${det.subject.name} ${year} ${session} ${det.paperType}`, id: row.id });
      } catch (e: any) {
        results.push({ url, ok: false, message: e?.message || "Eroare" });
      }
    }
    return { results, ok: results.filter(r => r.ok).length, fail: results.filter(r => !r.ok).length };
  });

const SESIUNI_LABELS: Record<string, string> = {
  "simulare": "Simulare",
  "iunie-iulie": "Iunie–Iulie",
  "august-septembrie": "August–Septembrie",
  "rezerva": "Sesiunea de rezervă",
};