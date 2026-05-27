import { createServerFn } from "@tanstack/react-start";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

function srv() {
  return supabaseAdmin;
}

export const listUniversities = createServerFn({ method: "GET" }).handler(async () => {
  const sb = srv();
  const { data } = await sb.from("universities").select("id, slug, short_name, name, city, description").order("short_name");
  const { data: subs } = await sb.from("subjects").select("university_id");
  const counts: Record<string, number> = {};
  (subs ?? []).forEach((s: any) => { counts[s.university_id] = (counts[s.university_id] ?? 0) + 1; });
  return (data ?? []).map((u: any) => ({ ...u, subject_count: counts[u.id] ?? 0 }));
});

export const listPopularSubjects = createServerFn({ method: "GET" })
  .inputValidator((d: { limit?: number }) => ({ limit: d.limit ?? 12 }))
  .handler(async ({ data }) => {
    const sb = srv();
    const { data: subs } = await sb
      .from("subjects")
      .select("id, slug, name, question_count, university_id, universities(slug, short_name, city)")
      .gt("question_count", 0)
      .order("question_count", { ascending: false })
      .limit(data.limit);
    return subs ?? [];
  });

export const getUniversity = createServerFn({ method: "GET" })
  .inputValidator((d: { slug: string }) => d)
  .handler(async ({ data }) => {
    const sb = srv();
    const { data: u } = await sb.from("universities").select("*").eq("slug", data.slug).maybeSingle();
    if (!u) return null;
    const { data: subs } = await sb.from("subjects").select("id, slug, name, question_count").eq("university_id", u.id).order("name");
    return { ...u, subjects: subs ?? [] };
  });

export const getQuiz = createServerFn({ method: "GET" })
  .inputValidator((d: { slug: string }) => d)
  .handler(async ({ data }) => {
    const sb = srv();
    const { data: s } = await sb.from("subjects").select("*, universities(slug, short_name, name)").eq("slug", data.slug).maybeSingle();
    if (!s) return null;
    const { data: qs } = await sb
      .from("questions")
      .select("id, question_text, options, correct_index, explanation, difficulty, figure_url, solution_md, session, problem_number")
      .eq("subject_id", s.id)
      .order("problem_number", { ascending: true, nullsFirst: false })
      .limit(2000);
    return { subject: s, questions: qs ?? [] };
  });

export const simulationQuestions = createServerFn({ method: "GET" })
  .inputValidator((d: { count?: number }) => ({ count: d.count ?? 30 }))
  .handler(async ({ data }) => {
    const sb = srv();
    const { data: qs } = await sb
      .from("questions")
      .select("id, question_text, options, correct_index, explanation, figure_url, solution_md")
      .limit(data.count * 5);
    const shuffled = (qs ?? []).sort(() => Math.random() - 0.5).slice(0, data.count);
    return shuffled;
  });

export const getNextSubjects = createServerFn({ method: "GET" })
  .inputValidator((d: { currentSubjectId: string; universityId?: string | null }) => d)
  .handler(async ({ data }) => {
    const sb = srv();
    // Next subject in same university
    let sameUni: any[] = [];
    if (data.universityId) {
      const { data: s } = await sb
        .from("subjects")
        .select("id, slug, name, question_count, university_id, universities(slug, short_name, name)")
        .eq("university_id", data.universityId)
        .neq("id", data.currentSubjectId)
        .gt("question_count", 0)
        .order("name")
        .limit(3);
      sameUni = s ?? [];
    }
    // Fill with popular subjects from other universities
    const { data: others } = await sb
      .from("subjects")
      .select("id, slug, name, question_count, university_id, universities(slug, short_name, name)")
      .neq("id", data.currentSubjectId)
      .gt("question_count", 0)
      .order("question_count", { ascending: false })
      .limit(8);
    const seen = new Set<string>([data.currentSubjectId, ...sameUni.map((x: any) => x.id)]);
    const fill = (others ?? []).filter((s: any) => !seen.has(s.id)).slice(0, Math.max(0, 4 - sameUni.length));
    return { next: sameUni[0] ?? fill[0] ?? null, recommendations: [...sameUni, ...fill].slice(0, 4) };
  });