import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const QuestionInput = z.object({
  subject_id: z.string().uuid(),
  question_text: z.string().min(5).max(20000),
  options: z.array(z.string().min(1).max(4000)).min(2).max(6),
  correct_index: z.number().int().min(0).max(5),
  explanation: z.string().max(8000).nullable().optional(),
  solution_md: z.string().max(20000).nullable().optional(),
  figure_url: z.string().url().max(2000).nullable().optional(),
  session: z.string().max(120).nullable().optional(),
  problem_number: z.number().int().min(1).max(1000).nullable().optional(),
  difficulty: z.enum(["easy", "medium", "hard"]).optional(),
});

async function assertAdmin(userId: string) {
  const { data, error } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();
  if (error || !data) throw new Error("Forbidden");
}

export const adminListSubjects = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.userId);
    const { data } = await supabaseAdmin
      .from("subjects")
      .select("id, name, slug, university_id, universities(short_name, slug)")
      .order("name");
    return data ?? [];
  });

export const adminCreateQuestion = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => QuestionInput.parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    if (data.correct_index >= data.options.length) {
      throw new Error("correct_index în afara intervalului");
    }
    const { data: row, error } = await supabaseAdmin
      .from("questions")
      .insert({
        subject_id: data.subject_id,
        question_text: data.question_text,
        options: data.options,
        correct_index: data.correct_index,
        explanation: data.explanation ?? null,
        solution_md: data.solution_md ?? null,
        figure_url: data.figure_url ?? null,
        session: data.session ?? null,
        problem_number: data.problem_number ?? null,
        difficulty: data.difficulty ?? "medium",
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: row.id };
  });

export const adminUploadFigure = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({
      filename: z.string().min(1).max(200),
      contentBase64: z.string().min(1).max(10_000_000),
      contentType: z.string().regex(/^image\/(png|jpe?g|gif|webp|svg\+xml)$/),
    }).parse(input)
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const safeName = data.filename.replace(/[^a-zA-Z0-9._-]/g, "_");
    const path = `${Date.now()}-${safeName}`;
    const buf = Buffer.from(data.contentBase64, "base64");
    const { error } = await supabaseAdmin.storage
      .from("question-figures")
      .upload(path, buf, { contentType: data.contentType, upsert: false });
    if (error) throw new Error(error.message);
    const { data: pub } = supabaseAdmin.storage.from("question-figures").getPublicUrl(path);
    return { url: pub.publicUrl };
  });