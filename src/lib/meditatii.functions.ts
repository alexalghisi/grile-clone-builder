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

export const submitMeditatiiLead = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => LeadSchema.parse(d))
  .handler(async ({ data }) => {
    const { error } = await supabaseAdmin.from("meditatii_leads").insert(data);
    if (error) throw new Error(error.message);

    // Best-effort email notification via queued mailer (if configured)
    try {
      await supabaseAdmin.rpc("enqueue_email", {
        queue_name: "transactional",
        payload: {
          to: "alexalghisi@gmail.com",
          subject: `[Meditații] Lead nou — ${data.subject}`,
          html: `<h2>Cerere meditații</h2>
            <p><strong>Materie:</strong> ${data.subject}</p>
            <p><strong>Nivel:</strong> ${data.level ?? "-"}</p>
            <p><strong>Contact:</strong> ${data.contact} (${data.contact_type})</p>
            <p><strong>Buget:</strong> ${data.budget ?? "-"}</p>
            <p><strong>Mesaj:</strong> ${data.message ?? "-"}</p>
            <p><strong>Pagină:</strong> ${data.page_url ?? "-"}</p>`,
        },
      });
    } catch (e) {
      // Don't fail the lead if email queue isn't ready
      console.error("[meditatii] email enqueue failed", e);
    }
    return { ok: true };
  });