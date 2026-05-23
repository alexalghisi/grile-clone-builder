import { createServerFn } from "@tanstack/react-start";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const listBacSubjects = createServerFn({ method: "GET" }).handler(async () => {
  const { data } = await supabaseAdmin
    .from("bac_papers")
    .select("subject_slug, subject_name, year")
    .order("year", { ascending: false });
  const map = new Map<string, { slug: string; name: string; years: Set<number>; latest: number }>();
  (data ?? []).forEach((r: any) => {
    const cur = map.get(r.subject_slug) ?? { slug: r.subject_slug, name: r.subject_name, years: new Set<number>(), latest: 0 };
    cur.years.add(r.year);
    if (r.year > cur.latest) cur.latest = r.year;
    map.set(r.subject_slug, cur);
  });
  return Array.from(map.values()).map((s) => ({ slug: s.slug, name: s.name, year_count: s.years.size, latest: s.latest }));
});

export const getBacSubject = createServerFn({ method: "GET" })
  .inputValidator((d: { slug: string }) => d)
  .handler(async ({ data }) => {
    const { data: papers } = await supabaseAdmin
      .from("bac_papers")
      .select("*")
      .eq("subject_slug", data.slug)
      .order("year", { ascending: false })
      .order("session", { ascending: true });
    if (!papers || papers.length === 0) return null;
    const byYear = new Map<number, any[]>();
    papers.forEach((p: any) => {
      const list = byYear.get(p.year) ?? [];
      list.push(p);
      byYear.set(p.year, list);
    });
    return {
      slug: data.slug,
      name: papers[0].subject_name,
      years: Array.from(byYear.entries()).map(([year, items]) => ({ year, items })).sort((a, b) => b.year - a.year),
    };
  });

export const getBacYear = createServerFn({ method: "GET" })
  .inputValidator((d: { slug: string; year: number }) => d)
  .handler(async ({ data }) => {
    const { data: papers } = await supabaseAdmin
      .from("bac_papers")
      .select("*")
      .eq("subject_slug", data.slug)
      .eq("year", data.year)
      .order("session", { ascending: true });
    if (!papers || papers.length === 0) return null;
    // Adjacent years
    const { data: adj } = await supabaseAdmin
      .from("bac_papers")
      .select("year")
      .eq("subject_slug", data.slug);
    const yearsSet = Array.from(new Set((adj ?? []).map((r: any) => r.year as number))).sort((a, b) => b - a);
    const idx = yearsSet.indexOf(data.year);
    const prev = idx >= 0 && idx < yearsSet.length - 1 ? yearsSet[idx + 1] : null;
    const next = idx > 0 ? yearsSet[idx - 1] : null;
    return {
      subject_slug: data.slug,
      subject_name: papers[0].subject_name,
      year: data.year,
      papers,
      prev_year: prev,
      next_year: next,
      all_years: yearsSet,
    };
  });

export const allBacPapers = createServerFn({ method: "GET" }).handler(async () => {
  const { data } = await supabaseAdmin
    .from("bac_papers")
    .select("subject_slug, year, session")
    .order("year", { ascending: false });
  return data ?? [];
});