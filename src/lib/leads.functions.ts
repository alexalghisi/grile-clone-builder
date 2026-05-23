import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { supabaseAdmin } from '@/integrations/supabase/client.server'
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware'
import { validateLeadEmail } from './email-validation'
import { notifyNewLead } from './lead-notify.server'

const SubmitSchema = z.object({
  email: z.string().min(3).max(254),
  quiz_slug: z.string().min(1).max(120).optional().nullable(),
  source: z.string().min(1).max(64).optional().nullable(),
})

export const submitEmailLead = createServerFn({ method: 'POST' })
  .inputValidator((input: unknown) => SubmitSchema.parse(input))
  .handler(async ({ data }) => {
    const v = validateLeadEmail(data.email)
    if (!v.ok) {
      return { ok: false as const, reason: v.reason }
    }
    const email = v.email
    const quiz_slug = data.quiz_slug ?? null
    const source = data.source ?? 'quiz_gate'

    // Dedupe — if same email already exists for this quiz, don't notify again
    const { data: existing } = await supabaseAdmin
      .from('email_leads')
      .select('id')
      .eq('email', email)
      .eq('quiz_slug', quiz_slug ?? '')
      .maybeSingle()

    if (existing) {
      return { ok: true as const, duplicate: true }
    }

    const { error } = await supabaseAdmin
      .from('email_leads')
      .insert({ email, quiz_slug, source })

    if (error) {
      console.error('submitEmailLead insert failed', error)
      return { ok: false as const, reason: 'Nu am putut salva. Încearcă din nou.' }
    }

    // Best-effort notification (does not block the user)
    const { count } = await supabaseAdmin
      .from('email_leads')
      .select('id', { count: 'exact', head: true })

    await notifyNewLead({ email, quizSlug: quiz_slug, source, total: count ?? 0 })

    return { ok: true as const, duplicate: false }
  })

const ListSchema = z.object({
  quiz_slug: z.string().max(120).optional().nullable(),
  from: z.string().datetime().optional().nullable(),
  to: z.string().datetime().optional().nullable(),
  limit: z.number().int().min(1).max(500).optional(),
})

export const listEmailLeads = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => ListSchema.parse(input ?? {}))
  .handler(async ({ data, context }) => {
    // Admin gate via has_role()
    const { data: isAdmin } = await context.supabase.rpc('has_role', {
      _user_id: context.userId,
      _role: 'admin',
    })
    if (!isAdmin) {
      throw new Error('Forbidden')
    }

    let q = supabaseAdmin
      .from('email_leads')
      .select('id, email, quiz_slug, source, created_at')
      .order('created_at', { ascending: false })
      .limit(data.limit ?? 500)

    if (data.quiz_slug) q = q.eq('quiz_slug', data.quiz_slug)
    if (data.from) q = q.gte('created_at', data.from)
    if (data.to) q = q.lte('created_at', data.to)

    const { data: rows, error } = await q
    if (error) throw new Error(error.message)

    // Build quiz slug facet for filter dropdown
    const { data: facetRows } = await supabaseAdmin
      .from('email_leads')
      .select('quiz_slug')
      .not('quiz_slug', 'is', null)
      .limit(2000)

    const quizSlugs = Array.from(
      new Set((facetRows ?? []).map((r: any) => r.quiz_slug).filter(Boolean) as string[])
    ).sort()

    return { rows: rows ?? [], quizSlugs }
  })
