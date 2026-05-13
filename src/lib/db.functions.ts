import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";

function srv() {
  return createClient(process.env.VITE_SUPABASE_URL!, process.env.VITE_SUPABASE_PUBLISHABLE_KEY!);
}

export const listUniversities = createServerFn({ method: "GET" }).handler(async () => {
  const sb = srv();
  const { data } = await sb.from("universities").select("id, slug, short_name, name, city, description").order("short_name");
  const { data: subs } = await sb.from("subjects").select("university_id");
  const counts: Record<string, number> = {};
  (subs ?? []).forEach((s: any) => { counts[s.university_id] = (counts[s.university_id] ?? 0) + 1; });
  return (data ?? []).map((u: any) => ({ ...u, subject_count: counts[u.id] ?? 0 }));
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
      .select("id, question_text, options, correct_index, explanation, difficulty")
      .eq("subject_id", s.id)
      .limit(2000);
    return { subject: s, questions: qs ?? [] };
  });

export const simulationQuestions = createServerFn({ method: "GET" })
  .inputValidator((d: { count?: number }) => ({ count: d.count ?? 30 }))
  .handler(async ({ data }) => {
    const sb = srv();
    const { data: qs } = await sb
      .from("questions")
      .select("id, question_text, options, correct_index, explanation")
      .limit(data.count * 5);
    const shuffled = (qs ?? []).sort(() => Math.random() - 0.5).slice(0, data.count);
    return shuffled;
  });