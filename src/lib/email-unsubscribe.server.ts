import { createClient } from '@supabase/supabase-js'

function generateToken(): string {
  return crypto.randomUUID().replace(/-/g, '') + crypto.randomUUID().replace(/-/g, '')
}

/**
 * Get or create an unsubscribe token for `email`, using the same
 * `email_unsubscribe_tokens` table the transactional send route uses.
 * Safe to call before enqueueing to `transactional_emails` — the queue
 * dispatcher requires `unsubscribe_token` on every payload.
 */
export async function getOrCreateUnsubscribeToken(email: string): Promise<string | null> {
  const supabaseUrl = process.env.SUPABASE_URL ?? import.meta.env.VITE_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !serviceKey) return null
  const supabase = createClient(supabaseUrl, serviceKey)
  const normalized = email.toLowerCase()

  const { data: existing } = await supabase
    .from('email_unsubscribe_tokens')
    .select('token, used_at')
    .eq('email', normalized)
    .maybeSingle()

  if (existing && !existing.used_at) return existing.token

  const token = generateToken()
  await supabase
    .from('email_unsubscribe_tokens')
    .upsert({ token, email: normalized }, { onConflict: 'email', ignoreDuplicates: true })

  const { data: stored } = await supabase
    .from('email_unsubscribe_tokens')
    .select('token')
    .eq('email', normalized)
    .maybeSingle()

  return stored?.token ?? token
}