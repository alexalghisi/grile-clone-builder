import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { validateLeadEmail } from './email-validation'

const Schema = z.object({
  email: z.string().min(3).max(254),
  consent: z.literal(true),
  source: z.string().max(64).optional(),
})

export const subscribeNewsletter = createServerFn({ method: 'POST' })
  .inputValidator((input: unknown) => Schema.parse(input))
  .handler(async ({ data }) => {
    const v = validateLeadEmail(data.email)
    if (!v.ok) return { ok: false as const, reason: v.reason }
    const { supabaseAdmin } = await import('@/integrations/supabase/client.server')
    const { error } = await supabaseAdmin
      .from('newsletter_subscribers')
      .upsert({ email: v.email, source: data.source ?? 'site' }, { onConflict: 'email', ignoreDuplicates: true })
    if (error) {
      console.error('subscribeNewsletter failed', error)
      return { ok: false as const, reason: 'Nu am putut salva. Încearcă din nou.' }
    }
    return { ok: true as const }
  })
