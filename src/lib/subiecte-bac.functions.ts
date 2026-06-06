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