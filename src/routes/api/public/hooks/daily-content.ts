import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/hooks/daily-content")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "").trim();
        if (!token) return Response.json({ ok: false }, { status: 401 });
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data } = await supabaseAdmin.from("content_job_state").select("cron_secret").eq("id", "daily").single();
        if (!data || data.cron_secret !== token) return Response.json({ ok: false }, { status: 401 });
        const { runDailyContent } = await import("@/lib/daily-content.server");
        const encoder = new TextEncoder();
        let cancelled = false;
        const stream = new ReadableStream({
          async start(controller) {
            const emit = (value: unknown) => {
              if (!cancelled) controller.enqueue(encoder.encode(JSON.stringify(value) + "\n"));
            };
            emit({ status: "started" });
            try {
              const result = await runDailyContent(progress => emit({ progress }));
              emit({ result });
            } catch (error) {
              emit({ error: error instanceof Error ? error.message : "Generarea a eșuat" });
            } finally {
              if (!cancelled) controller.close();
            }
          },
          cancel() { cancelled = true; },
        });
        return new Response(stream, { headers: { "Content-Type": "application/x-ndjson", "Cache-Control": "no-cache, no-transform" } });
      },
    },
  },
});
