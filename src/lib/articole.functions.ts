import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";

function pub() {
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"] ?? process.env["SUPABASE_ANON_KEY"] ?? import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  return createClient(process.env["SUPABASE_URL"] ?? import.meta.env.VITE_SUPABASE_URL, key, {
    auth: { persistSession: false },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization");
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
}

export type ArticolMeta = { slug: string; title: string; materie: string; description: string; published_at: string };

export const listArticole = createServerFn({ method: "GET" }).handler(async (): Promise<ArticolMeta[]> => {
  const { data } = await pub()
    .from("articole")
    .select("slug,title,materie,description,published_at")
    .order("published_at", { ascending: false })
    .limit(500);
  return (data as ArticolMeta[]) ?? [];
});

export const getArticol = createServerFn({ method: "GET" })
  .inputValidator((d) => z.object({ slug: z.string().max(200) }).parse(d))
  .handler(async ({ data }) => {
    const { data: row, error } = await pub().from("articole").select("*").eq("slug", data.slug).maybeSingle();
    if (error) console.error("getArticol", error.message);
    return row as (ArticolMeta & { keywords: string; content_md: string }) | null;
  });
