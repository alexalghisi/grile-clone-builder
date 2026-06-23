import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

async function assertAdmin(supabase: any, userId: string) {
  const { data } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();
  if (!data) throw new Error("Forbidden");
}

const SESSION_TAG = "Generat AI · Avansat";

/**
 * Lists subjects with current question_count and how many advanced AI-generated
 * questions we already have (session = SESSION_TAG).
 */
export const listSubjectsWithAdvancedCount = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await assertAdmin(supabaseAdmin, context.userId);

    const { data: subs } = await supabaseAdmin
      .from("subjects")
      .select("id, name, slug, university_id, question_count, universities(name, short_name, slug)")
      .order("name");

    const ids = (subs ?? []).map((s: any) => s.id);
    const counts: Record<string, number> = {};
    if (ids.length) {
      // count advanced per subject
      const { data: rows } = await supabaseAdmin
        .from("questions")
        .select("subject_id")
        .eq("session", SESSION_TAG)
        .in("subject_id", ids);
      for (const r of rows ?? []) {
        counts[(r as any).subject_id] = (counts[(r as any).subject_id] ?? 0) + 1;
      }
    }
    return (subs ?? []).map((s: any) => ({
      id: s.id,
      name: s.name,
      slug: s.slug,
      total: s.question_count ?? 0,
      advanced: counts[s.id] ?? 0,
      university: s.universities?.name ?? "",
      universitySlug: s.universities?.slug ?? "",
    }));
  });

const GenInput = z.object({
  subjectId: z.string().uuid(),
  batchSize: z.number().int().min(5).max(30).default(20),
});

type GeneratedQ = {
  question_text: string;
  options: string[];
  correct_index: number;
  explanation: string;
};

/**
 * Generates ONE batch of advanced questions for a subject using Lovable AI.
 * Client calls this in a loop until reaching 200 (controls progress + UX).
 */
export const generateAdvancedBatch = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => GenInput.parse(i))
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await assertAdmin(supabaseAdmin, context.userId);

    const { data: subj, error: sErr } = await supabaseAdmin
      .from("subjects")
      .select("id, name, slug, description, universities(name, short_name, description)")
      .eq("id", data.subjectId)
      .maybeSingle();
    if (sErr || !subj) throw new Error("Materia nu există");

    const uni = (subj as any).universities;
    const subjectName = (subj as any).name as string;
    const uniName = uni?.name ?? "";
    const programInfo = (subj as any).description ?? uni?.description ?? "";

    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("LOVABLE_API_KEY lipsește");

    const sys = `Ești un profesor universitar român expert care creează grile de admitere de NIVEL FOARTE AVANSAT, riguros formulate, exact ca la concursurile reale de admitere din România.
REGULI OBLIGATORII:
- Folosește LaTeX inline ($...$) pentru orice notație matematică, formulă, indici, exponenți, simboluri.
- Enunțuri detaliate, profesionale, fără ambiguități.
- Exact 4 variante de răspuns (a, b, c, d), o singură corectă.
- Explicație riguroasă cu pașii de raționament (markdown + LaTeX permis).
- Dificultate ridicată: probleme tip concurs admitere, NU exerciții banale.
- Variantele greșite trebuie să fie plauzibile (erori tipice de calcul / capcane).
- Răspuns STRICT JSON valid, fără markdown wrapper.`;

    const user = `Materie: ${subjectName}
Universitate: ${uniName}
${programInfo ? `Context programa: ${programInfo}` : ""}

Generează ${data.batchSize} grile complet noi, DIVERSE între ele, acoperind capitole diferite din programa de admitere a acestei facultăți pentru această materie.

Format JSON cerut:
{"questions":[{"question_text":"...","options":["...","...","...","..."],"correct_index":0,"explanation":"..."}]}`;

    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: sys },
          { role: "user", content: user },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (resp.status === 429) throw new Error("Rate limit AI — încearcă peste un minut");
    if (resp.status === 402) throw new Error("Credite AI epuizate — adaugă credite în Workspace");
    if (!resp.ok) throw new Error(`AI error ${resp.status}: ${await resp.text()}`);

    const json = await resp.json();
    const content: string = json?.choices?.[0]?.message?.content ?? "";
    let parsed: { questions: GeneratedQ[] };
    try {
      parsed = JSON.parse(content);
    } catch {
      const m = content.match(/\{[\s\S]*\}/);
      if (!m) throw new Error("Răspuns AI invalid");
      parsed = JSON.parse(m[0]);
    }

    const valid: GeneratedQ[] = [];
    for (const q of parsed.questions ?? []) {
      if (
        typeof q?.question_text === "string" && q.question_text.length > 10 &&
        Array.isArray(q.options) && q.options.length === 4 &&
        q.options.every((o: any) => typeof o === "string" && o.length > 0) &&
        Number.isInteger(q.correct_index) && q.correct_index >= 0 && q.correct_index < 4
      ) {
        valid.push({
          question_text: q.question_text,
          options: q.options,
          correct_index: q.correct_index,
          explanation: typeof q.explanation === "string" ? q.explanation : "",
        });
      }
    }

    if (!valid.length) return { inserted: 0 };

    const rows = valid.map((q) => ({
      subject_id: data.subjectId,
      question_text: q.question_text,
      options: q.options,
      correct_index: q.correct_index,
      explanation: q.explanation,
      difficulty: "hard",
      session: SESSION_TAG,
    }));

    const { error: iErr } = await supabaseAdmin.from("questions").insert(rows);
    if (iErr) throw new Error(iErr.message);

    return { inserted: valid.length };
  });