import { createEmailWebhookHandler } from '@lovable.dev/email-js'
import { createFileRoute } from '@tanstack/react-router'

type Reason = 'bounce' | 'complaint' | 'unsubscribe'

const STATUS: Record<Reason, 'bounced' | 'complained' | 'suppressed'> = {
  bounce: 'bounced',
  complaint: 'complained',
  unsubscribe: 'suppressed',
}

const MESSAGE: Record<Reason, string> = {
  bounce: 'Permanent bounce — email address is invalid or rejected',
  complaint: 'Spam complaint — recipient marked email as spam',
  unsubscribe: 'Recipient unsubscribed',
}

async function recordSuppression(recipient: string, messageId: string | null, reason: Reason, eventId: string) {
  const { supabaseAdmin } = await import('@/integrations/supabase/client.server')
  const email = recipient.toLowerCase()

  const { error: suppressError } = await supabaseAdmin
    .from('suppressed_emails')
    .upsert({ email, reason, metadata: null }, { onConflict: 'email' })
  if (suppressError) {
    console.error('suppressed_emails upsert failed', { code: suppressError.code, message: suppressError.message, event_id: eventId })
    throw new Error('Failed to write suppression')
  }

  const { error: logError } = await supabaseAdmin.from('email_send_log').insert({
    message_id: messageId,
    template_name: 'system',
    recipient_email: email,
    status: STATUS[reason],
    error_message: MESSAGE[reason],
    metadata: null,
  })
  if (logError) {
    console.error('email_send_log insert failed', { code: logError.code, message: logError.message, event_id: eventId })
    throw new Error('Failed to write send log')
  }
}

export const Route = createFileRoute("/lovable/email/events")({
  server: {
    handlers: {
      POST: ({ request }) => {
        const apiKey = process.env['LOVABLE_API_KEY']
        if (!apiKey) {
          console.error('Missing required environment variables')
          return Response.json({ error: 'Server configuration error' }, { status: 500 })
        }
        const handler = createEmailWebhookHandler({
          apiKey,
          on: {
            'email.bounced': (event) =>
              recordSuppression(event.data.recipient, event.data.message_id ?? null, 'bounce', event.event_id),
            'email.complaint': (event) =>
              recordSuppression(event.data.recipient, event.data.message_id ?? null, 'complaint', event.event_id),
            'email.unsubscribed': (event) =>
              recordSuppression(event.data.recipient, event.data.message_id ?? null, 'unsubscribe', event.event_id),
          },
        })
        return handler(request)
      },
    },
  },
})
