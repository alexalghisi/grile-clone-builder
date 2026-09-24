import { sendAndLog } from './email-log.server'

const ALERT_RECIPIENT = 'alexalghisi@gmail.com'

export interface LeadNotifyPayload {
  email: string
  quizSlug?: string | null
  source?: string | null
  total?: number
}

export async function notifyNewLead(payload: LeadNotifyPayload): Promise<void> {
  try {
    await sendAndLog('lead-alert', ALERT_RECIPIENT, {
      templateData: {
        email: payload.email,
        quizSlug: payload.quizSlug ?? '-',
        source: payload.source ?? 'quiz_gate',
        total: payload.total ?? 0,
        timestamp: new Date().toISOString(),
      },
      idempotencyKey: `lead-${crypto.randomUUID()}`,
    })
  } catch (e) {
    console.error('notifyNewLead failed', e)
  }
}
