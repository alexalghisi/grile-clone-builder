import { createStart, createMiddleware } from "@tanstack/react-start";

import { renderErrorPage } from "./lib/error-page";
import { sendErrorAlert } from "./lib/alert-email.server";
import { attachSupabaseAuth } from "@/integrations/supabase/auth-attacher";

const errorMiddleware = createMiddleware().server(async ({ next, request }) => {
  try {
    const u = request ? new URL((request as Request).url) : null;
    if (u && u.pathname.startsWith("/lovable/")) {
      return await next();
    }
  } catch {}
  try {
    return await next();
  } catch (error) {
    if (error != null && typeof error === "object" && "statusCode" in error) {
      throw error;
    }
    console.error(error);
    try {
      const err = error as any;
      const url = request ? new URL((request as Request).url).toString() : undefined;
      // fire-and-forget so we don't block the error response
      void sendErrorAlert({
        source: "server",
        message: err?.message ? String(err.message) : String(error),
        url,
        stack: err?.stack ? String(err.stack) : undefined,
        userAgent: request?.headers?.get?.("user-agent") ?? undefined,
      });
    } catch {}
    return new Response(renderErrorPage(), {
      status: 500,
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  }
});

export const startInstance = createStart(() => ({
  requestMiddleware: [errorMiddleware],
  functionMiddleware: [attachSupabaseAuth],
}));
