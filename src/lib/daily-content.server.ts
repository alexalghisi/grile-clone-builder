import { supabaseAdmin } from "@/integrations/supabase/client.server";

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
  const res = await fetch("https://ai.gateway.lovable.dev/v1/responses", {
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
    throw new StopError(res.status, `AI ${res.status}: ${body.slice(0, 200)}`);
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
        if (ev.type === "response.refusal.delta" || ev.type === "error" || ev.type === "response.failed")
          throw new StopError(403, "AI a refuzat sau a eșuat");
      } catch (e) {
        if (e instanceof StopError) throw e;
      }
    }
  }
  if (!text) throw new StopError(502, "Răspuns gol");
  return JSON.parse(text) as T;
}

function slugify(s: string) {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 90);
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

const MATERII = ["Matematică", "Informatică", "Fizică", "Chimie", "Biologie", "Anatomie", "Limba română", "Economie", "Istorie", "Geografie", "Logică"];

async function generateArticles(count: number) {
  const { data: recent } = await supabaseAdmin.from("articole").select("title").order("published_at", { ascending: false }).limit(60);
  const avoid = (recent ?? []).map((r) => r.title).join(" | ");
  const out: string[] = [];
  for (let n = 0; n < count; n++) {
    const materie = MATERII[(new Date().getUTCDate() * 3 + n) % MATERII.length];
    const a = await askJson<{ title: string; materie: string; keywords: string; description: string; content_md: string }>(
      `Ești profesor român care scrie pe blogul grileadmitere.ro (grile pentru admiterea la facultate și BAC 2026).
Scrie UN articol nou, în limba română cu diacritice, la materia „${materie}”, pe un subiect concret din programa de admitere/BAC (ex. o temă, o metodă de rezolvare, greșeli frecvente, strategie de examen).
Cerințe:
- Titlu SEO de 50-65 caractere, cu cuvânt-cheie principal la început (ex. „admitere 2026”, „grile”, „BAC”).
- description: meta descriere 140-158 caractere.
- keywords: 5-8 cuvinte-cheie separate prin virgulă.
- content_md: 900-1400 cuvinte în Markdown: introducere scurtă, secțiuni cu ## și ###, liste, cel puțin un exemplu rezolvat pas cu pas, formule în LaTeX între $...$ când e cazul, o secțiune „## Greșeli frecvente” și una „## Întrebări frecvente” cu 3 întrebări (### întrebare + răspuns). Fără H1. Ton cald, clar, ușor de citit. Informații corecte, fără cifre inventate despre universități.
- materie: exact „${materie}”.
Nu repeta aceste titluri existente: ${avoid}`,
      "articol",
      ARTICLE_SCHEMA,
    );
    let slug = slugify(a.title);
    const { data: exists } = await supabaseAdmin.from("articole").select("id").eq("slug", slug).maybeSingle();
    if (exists) slug = `${slug}-${Date.now().toString(36)}`;
    const { error } = await supabaseAdmin.from("articole").insert({
      slug,
      title: a.title,
      materie: materie,
      keywords: a.keywords,
      description: a.description.slice(0, 160),
      content_md: a.content_md,
    });
    if (!error) out.push(slug);
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

async function listGroups() {
  const { data, error } = await supabaseAdmin.rpc("grile_groups" as never);
  if (error) throw error;
  return (data as unknown as { universitate: string; facultate: string; materie: string }[]) ?? [];
}

async function generateGrileFor(g: { universitate: string; facultate: string; materie: string }) {
  let added = 0;
  const { data: sample } = await supabaseAdmin
    .from("grile")
    .select("intrebare")
    .eq("universitate", g.universitate)
    .eq("facultate", g.facultate)
    .eq("materie", g.materie)
    .order("created_at", { ascending: false })
    .limit(15);
  const avoid = (sample ?? []).map((s) => s.intrebare.slice(0, 120)).join("\n- ");
  for (let b = 0; b < GRILE_PER_GROUP / BATCH; b++) {
    const r = await askJson<{ grile: { intrebare: string; variante: string[]; raspuns_corect: string; explicatie: string; referinta_programa: string }[] }>(
      `Generează exact ${BATCH} grile NOI, dificile, pentru admiterea 2026 la ${g.universitate}, ${g.facultate}, materia „${g.materie}”.
Respectă strict programa oficială de admitere a acestei facultăți. Limba română cu diacritice.
- Fiecare grilă are o singură variantă corectă; 5 variante (A-E) plauzibile, fără prefixe „A)” în text.
- Formule în LaTeX între $...$; cod (dacă e informatică) în C++.
- raspuns_corect: litera variantei corecte. Verifică de două ori calculul.
- explicatie: rezolvare detaliată pas cu pas.
- referinta_programa: capitolul din programă.
Diferite de acestea (și între ele):
- ${avoid}`,
      "grile",
      GRILE_SCHEMA,
    );
    const rows = r.grile
      .filter((q) => q.variante.length >= 4 && q.variante.length <= 6 && "ABCDEF".indexOf(q.raspuns_corect) < q.variante.length)
      .map((q) => ({
        universitate: g.universitate,
        facultate: g.facultate,
        materie: g.materie,
        dificultate: "greu",
        intrebare: q.intrebare,
        variante: q.variante,
        raspuns_corect: q.raspuns_corect,
        explicatie: q.explicatie,
        referinta_programa: q.referinta_programa,
        sursa: "ai_zilnic",
      }));
    if (rows.length) {
      const { data } = await supabaseAdmin
        .from("grile")
        .upsert(rows, { onConflict: "universitate,facultate,materie,md5(lower(TRIM(BOTH FROM intrebare)))", ignoreDuplicates: true })
        .select("id");
      if (data) added += data.length;
      else {
        for (const row of rows) {
          const { error } = await supabaseAdmin.from("grile").insert(row);
          if (!error) added++;
        }
      }
    }
  }
  return added;
}

export async function runDailyContent() {
  const today = new Date().toISOString().slice(0, 10);
  const now = new Date();
  const { data: state } = await supabaseAdmin.from("content_job_state").select("*").eq("id", "daily").single();
  if (!state) return { skipped: "no-state" };
  if (state.paused_reason) return { skipped: `paused: ${state.paused_reason}` };
  if (state.last_run_date === today) return { skipped: "already-ran-today" };
  if (state.locked_until && new Date(state.locked_until) > now) return { skipped: "locked" };

  const { data: locked } = await supabaseAdmin
    .from("content_job_state")
    .update({ locked_until: new Date(now.getTime() + 30 * 60_000).toISOString(), last_run_date: today })
    .eq("id", "daily")
    .or(`last_run_date.is.null,last_run_date.neq.${today}`)
    .select("id");
  if (!locked?.length) return { skipped: "race" };

  const result: Record<string, unknown> = { date: today };
  let cursor = state.grile_cursor;
  try {
    const count = 2 + (now.getUTCDate() % 3);
    result.articole = await generateArticles(count);
    const groups = await listGroups();
    const done: Record<string, number> = {};
    for (let i = 0; i < GROUPS_PER_DAY && groups.length; i++) {
      const g = groups[cursor % groups.length];
      done[`${g.universitate} / ${g.facultate} / ${g.materie}`] = await generateGrileFor(g);
      cursor++;
      await supabaseAdmin.from("content_job_state").update({ grile_cursor: cursor }).eq("id", "daily");
    }
    result.grile = done;
  } catch (e) {
    const status = e instanceof StopError ? e.status : 500;
    result.error = (e as Error).message;
    if (status === 402 || status === 403 || status === 401) {
      await supabaseAdmin.from("content_job_state").update({ paused_reason: `AI ${status}` }).eq("id", "daily");
    }
  }
  await supabaseAdmin
    .from("content_job_state")
    .update({ locked_until: null, last_result: result as never, updated_at: new Date().toISOString() })
    .eq("id", "daily");
  return result;
}
