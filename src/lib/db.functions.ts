import { createServerFn } from "@tanstack/react-start";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

function srv() {
  return supabaseAdmin;
}

function normalizeGrila(row: any, index: number) {
  const entries: Array<[string, unknown]> = Array.isArray(row.variante)
    ? row.variante.map((value: unknown, i: number) => [String.fromCharCode(65 + i), value])
    : Object.entries(row.variante ?? {});
  const sorted = entries.sort(([a], [b]) => a.localeCompare(b, "ro", { sensitivity: "base" }));
  const keys = sorted.map(([key]) => key);
  const options = sorted.map(([, value]) => String(value));
  const correctLetters = String(row.raspuns_corect ?? "").replace(/[^a-zA-Z]/g, "").split("");
  const correctIndices = correctLetters
    .map((letter) => keys.findIndex((key) => key.toLowerCase() === letter.toLowerCase()))
    .filter((idx) => idx >= 0);

  return {
    id: row.id,
    question_text: row.intrebare,
    options,
    correct_index: correctIndices[0] ?? 0,
    correct_indices: correctIndices.length ? correctIndices : [0],
    explanation: row.explicatie,
    solution_md: row.explicatie,
    figure_url: null,
    difficulty: row.dificultate,
    problem_number: index + 1,
  };
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
    const { data: grileRows } = await sb
      .from("grile")
      .select("id, intrebare, variante, raspuns_corect, explicatie, dificultate, created_at")
      .eq("universitate", (s as any).universities?.name ?? "")
      .eq("materie", s.name)
      .order("created_at", { ascending: true })
      .limit(2000);
    const { data: qs } = await sb
      .from("questions")
      .select("id, question_text, options, correct_index, explanation, difficulty, figure_url, solution_md, session, problem_number")
      .eq("subject_id", s.id)
      .order("problem_number", { ascending: true, nullsFirst: false })
      .limit(2000);
    const normalizedGrile = (grileRows ?? []).map(normalizeGrila);
    return { subject: s, questions: [...normalizedGrile, ...(qs ?? [])] };
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
        .order("name")
        .limit(3);
      sameUni = s ?? [];
    }
    // Fill with popular subjects from other universities
    const { data: others } = await sb
      .from("subjects")
      .select("id, slug, name, question_count, university_id, universities(slug, short_name, name)")
      .neq("id", data.currentSubjectId)
      .order("name")
      .limit(8);
    const seen = new Set<string>([data.currentSubjectId, ...sameUni.map((x: any) => x.id)]);
    const fill = (others ?? []).filter((s: any) => !seen.has(s.id)).slice(0, Math.max(0, 4 - sameUni.length));
    return { next: sameUni[0] ?? fill[0] ?? null, recommendations: [...sameUni, ...fill].slice(0, 4) };
  });

// ---- Simulări (cronometrate) -----------------------------------------------

export const listSimulations = createServerFn({ method: "GET" }).handler(async () => {
  const sb = srv();
  const { data } = await sb
    .from("simulations")
    .select("id, slug, title, session, description, duration_minutes, total_questions, is_premium, universities(slug, short_name, name, city), subjects(slug, name)")
    .order("created_at", { ascending: false });
  return data ?? [];
});

export const getSimulation = createServerFn({ method: "GET" })
  .inputValidator((d: { slug: string }) => d)
  .handler(async ({ data }) => {
    const sb = srv();
    const { data: sim } = await sb
      .from("simulations")
      .select("id, slug, title, session, description, duration_minutes, total_questions, is_premium, universities(slug, short_name, name), subjects(slug, name)")
      .eq("slug", data.slug)
      .maybeSingle();
    if (!sim) return null;

    // Gate premium content server-side: never return questions/answers for
    // is_premium simulations from this public endpoint. Purchase-verified
    // access must go through a dedicated authenticated server function that
    // checks simulation_purchases / subscriptions for the current user.
    if ((sim as any).is_premium) {
      return { simulation: sim, questions: [], locked: true };
    }

    const { data: rows } = await sb
      .from("simulation_questions")
      .select("order_index, questions(id, question_text, options, correct_index, explanation, figure_url, solution_md, problem_number)")
      .eq("simulation_id", sim.id)
      .order("order_index", { ascending: true });
    const questions = (rows ?? []).map((r: any) => r.questions).filter(Boolean);
    return { simulation: sim, questions, locked: false };
  });