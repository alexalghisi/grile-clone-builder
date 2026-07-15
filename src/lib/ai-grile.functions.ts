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

const SESSION_TAG = "Admitere UPB · LaTeX · Avansat";

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
 * Reset all AI-generated questions for a subject (admin only).
 * Used to wipe UPB Informatica and regenerate from scratch in UPB LaTeX style.
 */
export const resetSubjectQuestions = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) =>
    z.object({ subjectId: z.string().uuid(), onlyAiGenerated: z.boolean().default(false) }).parse(i),
  )
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await assertAdmin(supabaseAdmin, context.userId);
    let q = supabaseAdmin.from("questions").delete().eq("subject_id", data.subjectId);
    if (data.onlyAiGenerated) {
      q = q.ilike("session", "%AI%").or("session.ilike.%LaTeX%,session.ilike.%Generat%");
    }
    const { error, count } = await q;
    if (error) throw new Error(error.message);
    return { deleted: count ?? 0 };
  });

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

    const isUpbInformatica = /informatic/i.test(subjectName) && /polit|upb/i.test(uniName);
    const optionCount = isUpbInformatica ? 6 : 4;

    const upbFewShot = `
EXEMPLE de STIL EXACT (Universitatea Politehnica București, Admitere Informatică, Chestionar de concurs — 6 variante a-f, LaTeX pentru toată notația):

Ex1. Fie funcția recursivă în C: \`int f(int n){ if(n<=1) return n; return f(n-1)+f(n-2); }\`. Ce valoare are $f(10)$? (9 pct.)
a) 34; b) 55; c) 89; d) 21; e) 13; f) 144.
Răspuns corect: b) 55. Explicație: Fibonacci, $f(0)=0, f(1)=1, \\dots, f(10)=55$.

Ex2. Fie recurența $T(1)=1$, $T(n)=2T(n-1)+1$. Cât este $T(8)$? (9 pct.)
a) 255; b) 256; c) 127; d) 511; e) 128; f) 129.
Răspuns corect: a) 255. Explicație: $T(n)=2^n-1$, deci $T(8)=255$.

Ex3. Se dă vectorul $a=(3,1,4,1,5,9,2,6,5,3)$. Câte perechi $(i,j)$ cu $i<j$ satisfac $a_i=a_j$? (9 pct.)
a) 4; b) 3; c) 5; d) 6; e) 2; f) 7.
Răspuns corect: b) 3. Explicație: perechile sunt (1,3) pentru valoarea 1, (4,8) pentru 5, (0,9) pentru 3. Total 3.

STRUCTURĂ OBLIGATORIE pentru fiecare grilă:
- Enunț matematic riguros cu $LaTeX$ inline pentru orice simbol matematic ($n$, $O(n \\log n)$, $a_i$, $2^{20}$, $\\binom{n}{k}$ etc.)
- Cod C/C++ în blocuri fenced \`\`\`c ... \`\`\` când problema conține algoritm
- Recurențe, sume, structuri de date, backtracking, grafuri, arbori, DP, complexitate
- Variante numerotate a) b) c) d) e) f) — răspunsuri numerice sau expresii scurte
- Toate cele 6 opțiuni PLAUZIBILE (rezultate de la capcane tipice: off-by-one, confuzie $2^n$ vs $n^2$, Catalan vs binomial etc.)
`;

    const styleRules = isUpbInformatica
      ? `- STIL UPB CHESTIONAR: enunțuri scurte-medii, notație matematică LaTeX, cod C/C++ când e cazul, 6 variante (a-f), NIVEL ADMITERE POLITEHNICA (probleme din simulările și concursurile reale 2023–2026).
- Include mix: recursivitate, DP, complexitate asimptotică, combinatorică (Catalan, binomial), grafuri/arbori (vector de tați, înălțime, frunze), backtracking, șiruri (LCS, palindroame), matrice, algoritmi de căutare, aritmetică numerică.
- Fiecare grilă valorează "(9 pct.)" în enunț, ca în subiectele oficiale.
- Variante greșite = REZULTATE ale capcanelor tipice (ex: dacă corect e $2^n-1$, opțiunile includ $2^n$, $2^{n-1}$, $2^n+1$).`
      : `- Exact 4 variante de răspuns (a, b, c, d), o singură corectă.
- Enunțuri detaliate, profesionale, LaTeX inline pentru orice matematică.
- Dificultate concurs admitere, nu exerciții banale.
- Variantele greșite plauzibile (capcane tipice).`;

    const sys = `Ești un profesor universitar român expert care creează grile de admitere de NIVEL FOARTE AVANSAT, în stilul EXACT al chestionarelor de concurs de la Universitatea Politehnica București.
REGULI OBLIGATORII:
- Folosește LaTeX inline ($...$) pentru TOATĂ notația matematică (variabile, indici, exponenți, sume, produse, complexități $O(\\cdot)$, coeficienți binomiali $\\binom{n}{k}$, mod, etc.).
- Cod în blocuri fenced markdown \`\`\`c sau \`\`\`cpp când problema conține program.
${styleRules}
- Explicație riguroasă cu pașii de raționament (markdown + LaTeX permis, arată calculul).
- Răspuns STRICT JSON valid, fără markdown wrapper, fără text explicativ înainte sau după.
${isUpbInformatica ? upbFewShot : ""}`;

    const user = `Materie: ${subjectName}
Universitate: ${uniName}
${programInfo ? `Context programa: ${programInfo}` : ""}

Generează ${data.batchSize} grile COMPLET NOI, DIVERSE, acoperind capitole diferite din programa de admitere. Fiecare grilă are ${optionCount} variante de răspuns (${optionCount === 6 ? "a-f" : "a-d"}), UNA singură corectă.

Format JSON cerut (correct_index între 0 și ${optionCount - 1}):
{"questions":[{"question_text":"...","options":[${Array(optionCount).fill('"..."').join(",")}],"correct_index":0,"explanation":"..."}]}`;

    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "openai/gpt-5.5",
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
        Array.isArray(q.options) && q.options.length >= 4 && q.options.length <= 6 &&
        q.options.every((o: any) => typeof o === "string" && o.length > 0) &&
        Number.isInteger(q.correct_index) && q.correct_index >= 0 && q.correct_index < q.options.length
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