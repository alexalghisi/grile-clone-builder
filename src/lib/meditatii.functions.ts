import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const LeadSchema = z.object({
  subject: z.string().min(1).max(100),
  level: z.string().min(1).max(50).optional(),
  contact: z.string().min(3).max(200),
  contact_type: z.enum(["email", "phone", "whatsapp"]).default("email"),
  message: z.string().max(2000).optional(),
  budget: z.string().max(100).optional(),
  page_url: z.string().max(500).optional(),
});

function escapeHtml(value: string | undefined | null): string {
  if (value === null || value === undefined) return "-";
  const str = String(value);
  if (!str) return "-";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export const submitMeditatiiLead = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => LeadSchema.parse(d))
  .handler(async ({ data }) => {
    const { error } = await supabaseAdmin.from("meditatii_leads").insert(data);
    if (error) throw new Error(error.message);

    // Best-effort email notification via queued mailer (if configured)
    try {
      const { sendLovableEmail } = await import("@lovable.dev/email-js");
      const html = `<h2>Cerere meditații</h2>
            <p><strong>Materie:</strong> ${escapeHtml(data.subject)}</p>
            <p><strong>Nivel:</strong> ${escapeHtml(data.level)}</p>
            <p><strong>Contact:</strong> ${escapeHtml(data.contact)} (${escapeHtml(data.contact_type)})</p>
            <p><strong>Buget:</strong> ${escapeHtml(data.budget)}</p>
            <p><strong>Mesaj:</strong> ${escapeHtml(data.message)}</p>
            <p><strong>Pagină:</strong> ${escapeHtml(data.page_url)}</p>`;
      await sendLovableEmail(
        {
          to: "alexalghisi@gmail.com",
          from: "Grileadmitere.ro <noreply@grileadmitere.ro>",
          sender_domain: "notify.grileadmitere.ro",
          purpose: "transactional",
          label: "meditatii-lead",
          idempotency_key: `meditatii-${crypto.randomUUID()}`,
          html,
          text: html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim(),
          subject: `[Meditații] Lead nou — ${data.subject}`,
          html: `<h2>Cerere meditații</h2>
            <p><strong>Materie:</strong> ${escapeHtml(data.subject)}</p>
            <p><strong>Nivel:</strong> ${escapeHtml(data.level)}</p>
            <p><strong>Contact:</strong> ${escapeHtml(data.contact)} (${escapeHtml(data.contact_type)})</p>
            <p><strong>Buget:</strong> ${escapeHtml(data.budget)}</p>
            <p><strong>Mesaj:</strong> ${escapeHtml(data.message)}</p>
            <p><strong>Pagină:</strong> ${escapeHtml(data.page_url)}</p>`,
        },
      });
    } catch (e) {
      // Don't fail the lead if email queue isn't ready
      console.error("[meditatii] email enqueue failed", e);
    }
    return { ok: true };
  });