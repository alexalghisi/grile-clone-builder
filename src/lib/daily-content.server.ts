import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { createLovableAiGatewayRunIdFetch } from "./ai-run-id.server";
import { articlesPerDay, validateQuestions, type DailyQuestion } from "./daily-content-rules";
import { pickTopics, slugifyKeyword } from "./seo-topics";

const MODEL = "openai/gpt-6-astra";
const GRILE_PER_GROUP = 50;
const GROUPS_PER_DAY = 5;
const BATCH = 10;

class StopError extends Error {
  constructor(public status: number, msg: string) {
    super(msg);
  }
}

async function askJson<T>(prompt: string, schemaName: string, schema: Record<string, unknown>): Promise<T> {
  const key = process.env["LOVABLE_API_KEY"];
  if (!key) throw new StopError(401, "LOVABLE_API_KEY lipsă");
  const gateway = createLovableAiGatewayRunIdFetch();
  const res = await gateway.fetch("https://ai.gateway.lovable.dev/v1/responses", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Lovable-API-Key": key, "X-Lovable-AIG-SDK": "fetch" },
    body: JSON.stringify({
      model: MODEL,
      input: prompt,
      stream: true,
      store: false,
      reasoning: { effort: "low", summary: "auto" },
      include: ["reasoning.encrypted_content"],
      text: { format: { type: "json_schema", name: schemaName, strict: true, schema } },
    }),
  });
  if (!res.ok || !res.body) {
    const body = await res.text().catch(() => "");
    let message = `AI ${res.status}`;
    try { message = JSON.parse(body).message ?? message; } catch {}
    throw new StopError(res.status, message);
  }
  const reader = res.body.getReader();
  const dec = new TextDecoder();
  let buf = "";
  let text = "";
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += dec.decode(value, { stream: true });
    let i: number;
    while ((i = buf.indexOf("\n")) >= 0) {
      const line = buf.slice(0, i).trim();
      buf = buf.slice(i + 1);
      if (!line.startsWith("data:")) continue;
      const payload = line.slice(5).trim();
      if (!payload || payload === "[DONE]") continue;
      try {
        const ev = JSON.parse(payload);
        if (ev.type === "response.output_text.delta") text += ev.delta ?? "";
        if (ev.type === "response.refusal.delta") throw new StopError(403, "AI a refuzat cererea");
        if (ev.type === "error" || ev.type === "response.failed")
          throw new StopError(ev.error?.status ?? ev.response?.error?.status ?? 500, ev.error?.message ?? ev.response?.error?.message ?? "Generarea AI a eșuat");
      } catch (e) {
        if (e instanceof StopError) throw e;
      }
    }
  }
  if (!text) throw new StopError(502, "Răspuns gol");
  return JSON.parse(text) as T;
}

const ARTICLE_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["title", "materie", "keywords", "description", "content_md"],
  properties: {
    title: { type: "string" },
    materie: { type: "string" },
    keywords: { type: "string" },
    description: { type: "string" },
    content_md: { type: "string" },
  },
};

async function generateArticles(count: number, offset = 0, day = new Date().toISOString().slice(0, 10)) {
  const { data: recent } = await supabaseAdmin.from("articole").select("title,slug").order("published_at", { ascending: false }).limit(400);
  const usedSlugs = new Set((recent ?? []).map((r) => r.slug));
  const avoid = (recent ?? []).slice(0, 60).map((r) => r.title).join(" | ");
  const topics = pickTopics(new Date(day), articlesPerDay(new Date(day)), usedSlugs);
  const out: string[] = [];
  for (let n = 0; n < count; n++) {
    const topic = topics[(offset + n) % topics.length];
    const materie = topic.materie;
    const links = (topic.links ?? ["/grile"]).join(", ");
    const a = await askJson<{ title: string; materie: string; keywords: string; description: string; content_md: string }>(
      `Ești profesor român cu experiență la pregătirea pentru admitere și BAC și scrii pe blogul grileadmitere.ro (grile de admitere rezolvate gratuit, nelimitat).
Scrie UN articol SEO-first, în limba română cu diacritice, care să ocupe prima pagină Google pentru căutarea: „${topic.keyword}”.
Unghi obligatoriu: ${topic.angle}.
Cerințe SEO (respectă-le exact):
- title: 50-65 de caractere, conține cuvântul-cheie „${topic.keyword}” (sau o formă naturală a lui) cât mai la început; promite un beneficiu concret; fără clickbait.
- description: meta descriere 140-158 caractere, conține cuvântul-cheie, se termină cu un îndemn.
- keywords: 6-10 cuvinte-cheie/variante de căutare (ex. sinonime, întrebări), separate prin virgulă.
- content_md: 1200-1700 cuvinte în Markdown. Primul paragraf (max 60 cuvinte) răspunde direct la intenția căutării și conține cuvântul-cheie. Apoi: secțiuni ## și ### cu subtitluri care conțin variante naturale ale cuvântului-cheie, liste, pași numerotați, cel puțin un exemplu rezolvat pas cu pas (sau un plan/tabel concret), formule LaTeX între $...$ când e cazul, o secțiune „## Greșeli frecvente”, o secțiune „## Întrebări frecvente” cu 4 întrebări (### întrebare + răspuns de 2-4 propoziții) și o concluzie scurtă cu îndemn.
- Include în text, natural, cel puțin 3 legături interne în format Markdown către: ${links} (ex. [grile rezolvate gratuit](/grile)). Nu folosi URL-uri externe.
- Fără H1. Ton cald, clar, concret. Nu repeta cuvântul-cheie artificial (keyword stuffing).
- Informații corecte. NU inventa date exacte (date calendaristice, număr de locuri, medii, taxe, autori, statistici). Când e vorba de regulamente sau calendare oficiale, spune că elevul trebuie să verifice site-ul oficial al universității/ministerului.
- materie: exact „${materie}”.
Nu repeta aceste titluri existente: ${avoid}`,
      "articol",
      ARTICLE_SCHEMA,
    );
    const words = a.content_md.split(/\s+/).length;
    const internalLinks = (a.content_md.match(/\]\(\/[a-z0-9\-\/]*\)/g) ?? []).length;
    if (a.materie !== materie || words < 900 || !a.content_md.includes("## ") || internalLinks < 2 || !/##\s*Întrebări frecvente/i.test(a.content_md))
      throw new Error("Articol incomplet, fără legături interne sau materia incorectă");
    let slug = slugifyKeyword(topic.keyword);
    if (usedSlugs.has(slug)) slug = `${slug}-${day}`;
    usedSlugs.add(slug);
    const { error } = await supabaseAdmin.from("articole").upsert({
      slug,
      title: a.title.trim().slice(0, 90),
      materie,
      keywords: a.keywords,
      description: a.description.trim().slice(0, 160),
      content_md: a.content_md,
    }, { onConflict: "slug", ignoreDuplicates: true });
    if (error) throw error;
    out.push(slug);
  }
  return out;
}

const GRILE_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["grile"],
  properties: {
    grile: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["intrebare", "variante", "raspuns_corect", "explicatie", "referinta_programa"],
        properties: {
          intrebare: { type: "string" },
          variante: { type: "array", items: { type: "string" } },
          raspuns_corect: { type: "string", enum: ["A", "B", "C", "D", "E", "F"] },
          explicatie: { type: "string" },
          referinta_programa: { type: "string" },
        },
      },
    },
  },
};

type Subject = { id: string; name: string; slug: string; description: string | null; university_id: string; universities: { name: string } | null };

async function generateQuestionBatch(subject: Subject, day: string, batch: number) {
  const { data: sample, error } = await supabaseAdmin.from("grile")
    .select("intrebare,referinta_programa").eq("universitate", subject.universities?.name ?? "").eq("materie", subject.name)
    .order("created_at", { ascending: false }).limit(50);
  if (error) throw error;
  const chapters = [...new Set((sample ?? []).map(q => q.referinta_programa).filter(Boolean))];
  const context = subject.description ?? (chapters.length ? "" : `programa de liceu la ${subject.name}, nivelul examenelor de admitere din România`);
  const optionCount = /informatic/i.test(subject.name) && /polit|upb/i.test(subject.universities?.name ?? "") ? 6 : 5;
  const prompt = `Creează exact ${BATCH} întrebări originale dificile, dar rezolvabile pentru elevi, la ${subject.name}, ${subject.universities?.name}.
Context de pregătire: ${context}. Capitole din colecția existentă (nu reprezintă o programă oficială verificată): ${chapters.join("; ")}.
Rămâi în aceste capitole. Nu inventa cerințe oficiale de admitere. Folosește diacritice, LaTeX între $...$ și cod C++ în blocuri Markdown unde este cazul.
Exact ${optionCount} variante distincte, fără prefixe, un singur răspuns corect A-${optionCount === 6 ? "F" : "E"}. Explicație completă pas cu pas și capitol precis.
Rezolvă independent fiecare problemă și verifică rezultatul și toate variantele înainte de răspuns.
Evită aceste întrebări: ${(sample ?? []).map(q => q.intrebare).join("\n")}`;
  const generated = await askJson<{ grile: DailyQuestion[] }>(prompt, "grile", GRILE_SCHEMA);
  const rows = validateQuestions(generated.grile, optionCount, BATCH);
  const { data, error: saveError } = await supabaseAdmin.rpc("save_daily_question_batch", { p_subject: subject.id, p_day: day, p_batch: batch, p_rows: rows });
  if (saveError) throw saveError;
  return data;
}

export async function runDailyContent(report: (value: unknown) => void = () => {}, maxSteps = Number.POSITIVE_INFINITY) {
  let stepsDone = 0;
  const today = new Date().toISOString().slice(0, 10);
  const now = new Date();
  let lease = new Date(now.getTime() + 30 * 60_000).toISOString();
  const { data: claimed, error: claimError } = await supabaseAdmin.from("content_job_state")
    .update({ locked_until: lease }).eq("id", "daily").is("paused_reason", null)
    .or(`locked_until.is.null,locked_until.lt.${now.toISOString()}`).select("*").maybeSingle();
  if (claimError) throw claimError;
  if (!claimed) return { skipped: "paused-or-running" };
  const previous = claimed.last_result as Record<string, unknown> | null;
  const result: Record<string, unknown> = previous?.date === today ? { ...previous } : { date: today, article_step: 0, question_step: 0, start_cursor: claimed.grile_cursor };
  const saveProgress = async () => {
    delete result.error;
    delete result.status;
    const nextLease = new Date(Date.now() + 30 * 60_000).toISOString();
    const { data, error } = await supabaseAdmin.from("content_job_state").update({ last_result: result as never, locked_until: nextLease, updated_at: new Date().toISOString() }).eq("id", "daily").eq("locked_until", lease).select("id").maybeSingle();
    if (error) throw error;
    if (!data) throw new Error("Generarea a pierdut blocarea exclusivă");
    lease = nextLease;
  };
  try {
    if (claimed.last_run_date === today) return { skipped: "already-complete" };
    const { data: subjects, error } = await supabaseAdmin.from("subjects").select("id,name,slug,description,university_id,universities(name)").order("slug");
    if (error) throw error;
    if (!subjects?.length) throw new Error("Nu există materii");
    while (Number(result.article_step) < articlesPerDay(now)) {
      if (stepsDone >= maxSteps) { result.partial = true; return result; }
      stepsDone++;
      const slugs = await generateArticles(1, Number(result.article_step), today);
      result.article_step = Number(result.article_step) + 1;
      result.latest_article = slugs[0];
      await saveProgress();
      report(result);
    }
    const totalSteps = GROUPS_PER_DAY * GRILE_PER_GROUP / BATCH;
    while (Number(result.question_step) < totalSteps) {
      if (stepsDone >= maxSteps) { result.partial = true; return result; }
      stepsDone++;
      const step = Number(result.question_step);
      const group = Math.floor(step / (GRILE_PER_GROUP / BATCH));
      const subject = subjects[(Number(result.start_cursor) + group) % subjects.length];
      if (!subject) throw new Error("Materia lipsește");
      result.latest_subject = subject.slug;
      result.inserted = await generateQuestionBatch(subject as Subject, today, step % (GRILE_PER_GROUP / BATCH));
      result.question_step = step + 1;
      await saveProgress();
      report(result);
    }
    result.completed = true;
    delete result.partial;
    delete result.error;
    await supabaseAdmin.from("content_job_state").update({ last_run_date: today, grile_cursor: Number(result.start_cursor) + GROUPS_PER_DAY }).eq("id", "daily").eq("locked_until", lease);
  } catch (e) {
    const status = e instanceof StopError ? e.status : 500;
    result.error = e instanceof Error ? e.message : "Generarea a eșuat";
    result.status = status;
    if ([401,402,403,404].includes(status)) {
      await supabaseAdmin.from("content_job_state").update({ paused_reason: `${status}: ${String(result.error)}` }).eq("id", "daily").eq("locked_until", lease);
    }
    report(result);
  } finally {
    await supabaseAdmin.from("content_job_state").update({ locked_until: null, last_result: result as never, updated_at: new Date().toISOString() }).eq("id", "daily").eq("locked_until", lease);
  }
  return result;
}
