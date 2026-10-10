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
        const result = await runDailyContent();
        return Response.json({ ok: true, result });
      },
    },
  },
});
