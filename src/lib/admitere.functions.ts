import { createServerFn } from "@tanstack/react-start";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const listAdmitereUniversities = createServerFn({ method: "GET" }).handler(async () => {
  const { data } = await supabaseAdmin
    .from("admitere_papers")
    .select("university_slug, university_name, subject_slug, year");
  const map = new Map<string, { slug: string; name: string; subjects: Set<string>; years: Set<number>; total: number }>();
  (data ?? []).forEach((r: any) => {
    const cur = map.get(r.university_slug) ?? {
      slug: r.university_slug,
      name: r.university_name,
      subjects: new Set<string>(),
      years: new Set<number>(),
      total: 0,
    };
    cur.subjects.add(r.subject_slug);
    cur.years.add(r.year);
    cur.total += 1;
    map.set(r.university_slug, cur);
  });
  return Array.from(map.values())
    .map((u) => ({ slug: u.slug, name: u.name, subject_count: u.subjects.size, year_count: u.years.size, paper_count: u.total }))
    .sort((a, b) => b.paper_count - a.paper_count);
});

export const getAdmitereUniversity = createServerFn({ method: "GET" })
  .inputValidator((d: { slug: string }) => d)
  .handler(async ({ data }) => {
    const { data: papers } = await supabaseAdmin
      .from("admitere_papers")
      .select("subject_slug, subject_name, year, university_name")
      .eq("university_slug", data.slug);
    if (!papers || papers.length === 0) return null;
    const map = new Map<string, { slug: string; name: string; years: Set<number>; latest: number }>();
    papers.forEach((p: any) => {
      const cur = map.get(p.subject_slug) ?? { slug: p.subject_slug, name: p.subject_name, years: new Set<number>(), latest: 0 };
      cur.years.add(p.year);
      if (p.year > cur.latest) cur.latest = p.year;
      map.set(p.subject_slug, cur);
    });
    return {
      slug: data.slug,
      name: papers[0].university_name,
      subjects: Array.from(map.values()).map((s) => ({ slug: s.slug, name: s.name, year_count: s.years.size, latest: s.latest })),
    };
  });

export const getAdmitereSubject = createServerFn({ method: "GET" })
  .inputValidator((d: { uni: string; materie: string }) => d)
  .handler(async ({ data }) => {
    const { data: papers } = await supabaseAdmin
      .from("admitere_papers")
      .select("*")
      .eq("university_slug", data.uni)
      .eq("subject_slug", data.materie)
      .order("year", { ascending: false });
    if (!papers || papers.length === 0) return null;
    const byYear = new Map<number, any[]>();
    papers.forEach((p: any) => {
      const list = byYear.get(p.year) ?? [];
      list.push(p);
      byYear.set(p.year, list);
    });
    return {
      university_slug: data.uni,
      university_name: papers[0].university_name,
      subject_slug: data.materie,
      subject_name: papers[0].subject_name,
      years: Array.from(byYear.entries()).map(([year, items]) => ({ year, items })).sort((a, b) => b.year - a.year),
    };
  });

export const getAdmitereYear = createServerFn({ method: "GET" })
  .inputValidator((d: { uni: string; materie: string; an: number }) => d)
  .handler(async ({ data }) => {
    const { data: papers } = await supabaseAdmin
      .from("admitere_papers")
      .select("*")
      .eq("university_slug", data.uni)
      .eq("subject_slug", data.materie)
      .eq("year", data.an)
      .order("paper_type", { ascending: true });
    if (!papers || papers.length === 0) return null;
    const { data: allYears } = await supabaseAdmin
      .from("admitere_papers")
      .select("year")
      .eq("university_slug", data.uni)
      .eq("subject_slug", data.materie);
    const ys = Array.from(new Set((allYears ?? []).map((r: any) => r.year as number))).sort((a, b) => b - a);
    const idx = ys.indexOf(data.an);
    return {
      university_slug: data.uni,
      university_name: papers[0].university_name,
      subject_slug: data.materie,
      subject_name: papers[0].subject_name,
      year: data.an,
      papers,
      prev_year: idx >= 0 && idx < ys.length - 1 ? ys[idx + 1] : null,
      next_year: idx > 0 ? ys[idx - 1] : null,
      all_years: ys,
    };
  });

export const allAdmiterePapers = createServerFn({ method: "GET" }).handler(async () => {
  const { data } = await supabaseAdmin
    .from("admitere_papers")
    .select("university_slug, subject_slug, year")
    .order("year", { ascending: false });
  return data ?? [];
});