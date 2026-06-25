import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

const RECIPIENT = 'alexalghisi@gmail.com'
const SITE_NAME = 'GrileAdmitere'
const SENDER_DOMAIN = 'notify.grileadmitere.ro'
const FROM_DOMAIN = 'grileadmitere.ro'

const ContactSchema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(255),
  subject: z.string().trim().max(200).optional().default(''),
  message: z.string().trim().min(5).max(5000),
  url: z.string().max(500).optional().default(''),
  userAgent: z.string().max(500).optional().default(''),
})

export const sendContactMessage = createServerFn({ method: 'POST' })
  .inputValidator((input: unknown) => ContactSchema.parse(input))
  .handler(async ({ data }) => {
    const React = await import('react')
    const { render } = await import('@react-email/components')
    const { createClient } = await import('@supabase/supabase-js')
    const { TEMPLATES } = await import('./email-templates/registry')

    const supabaseUrl = process.env.SUPABASE_URL ?? import.meta.env.VITE_SUPABASE_URL
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!supabaseUrl || !serviceKey) {
      throw new Error('Email infrastructure not configured')
    }

    const entry = TEMPLATES['contact-message']
    if (!entry) throw new Error('Template missing')

    const payload = {
      ...data,
      subject: data.subject || '(fără subiect)',
      timestamp: new Date().toISOString(),
    }

    const element = React.createElement(entry.component, payload)
    const html = await render(element)
    const text = await render(element, { plainText: true })
    const subject = typeof entry.subject === 'function' ? entry.subject(payload) : entry.subject

    const supabase = createClient(supabaseUrl, serviceKey)
    const messageId = crypto.randomUUID()

    await supabase.from('email_send_log').insert({
      message_id: messageId,
      template_name: 'contact-message',
      recipient_email: RECIPIENT,
      status: 'pending',
    })

    await supabase.rpc('enqueue_email', {
      queue_name: 'transactional_emails',
      payload: {
        message_id: messageId,
        to: RECIPIENT,
        reply_to: data.email,
        from: `${SITE_NAME} Contact <contact@${FROM_DOMAIN}>`,
        sender_domain: SENDER_DOMAIN,
        subject,
        html,
        text,
        purpose: 'transactional',
        label: 'contact-message',
        idempotency_key: `contact-${messageId}`,
        queued_at: new Date().toISOString(),
      },
    })

    return { ok: true }
  })