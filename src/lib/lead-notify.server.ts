import * as React from 'react'
import { render } from '@react-email/components'
import { createClient } from '@supabase/supabase-js'
import { TEMPLATES } from './email-templates/registry'
import { getOrCreateUnsubscribeToken } from './email-unsubscribe.server'

const SITE_NAME = 'GrileAdmitere'
const SENDER_DOMAIN = 'notify.grileadmitere.ro'
const FROM_DOMAIN = 'grileadmitere.ro'
const ALERT_RECIPIENT = 'alexalghisi@gmail.com'

export interface LeadNotifyPayload {
  email: string
  quizSlug?: string | null
  source?: string | null
  total?: number
}

export async function notifyNewLead(payload: LeadNotifyPayload): Promise<void> {
  try {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? process.env.SUPABASE_URL
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!supabaseUrl || !serviceKey) return

    const entry = TEMPLATES['lead-alert']
    if (!entry) return

    const data = {
      email: payload.email,
      quizSlug: payload.quizSlug ?? '-',
      source: payload.source ?? 'quiz_gate',
      total: payload.total ?? 0,
      timestamp: new Date().toISOString(),
    }

    const element = React.createElement(entry.component, data)
    const html = await render(element)
    const text = await render(element, { plainText: true })
    const subject = typeof entry.subject === 'function' ? entry.subject(data) : entry.subject

    const supabase = createClient(supabaseUrl, serviceKey)
    const messageId = crypto.randomUUID()
    const unsubscribeToken = await getOrCreateUnsubscribeToken(ALERT_RECIPIENT)

    await supabase.from('email_send_log').insert({
      message_id: messageId,
      template_name: 'lead-alert',
      recipient_email: ALERT_RECIPIENT,
      status: 'pending',
    })

    await supabase.rpc('enqueue_email', {
      queue_name: 'transactional_emails',
      payload: {
        message_id: messageId,
        to: ALERT_RECIPIENT,
        from: `${SITE_NAME} Leads <leads@${FROM_DOMAIN}>`,
        sender_domain: SENDER_DOMAIN,
        subject,
        html,
        text,
        purpose: 'transactional',
        label: 'lead-alert',
        idempotency_key: `lead-${messageId}`,
        unsubscribe_token: unsubscribeToken,
        queued_at: new Date().toISOString(),
      },
    })
  } catch (e) {
    console.error('notifyNewLead failed', e)
  }
}
