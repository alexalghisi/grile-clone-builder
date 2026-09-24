import { createClient } from '@supabase/supabase-js'
import { sendTemplateEmail, type SendTemplateEmailOptions } from './email-templates/send-email'

type LogStatus = 'sent' | 'suppressed' | 'failed'

export async function logEmailSend(
  templateName: string,
  recipient: string,
  status: LogStatus,
  errorMessage?: string,
): Promise<void> {
  const supabaseUrl = process.env.SUPABASE_URL ?? import.meta.env.VITE_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !serviceKey) return
  const supabase = createClient(supabaseUrl, serviceKey)
  const { error } = await supabase.from('email_send_log').insert({
    message_id: null,
    template_name: templateName,
    recipient_email: recipient,
    status,
    error_message: errorMessage ?? null,
  })
  if (error) console.error('email_send_log insert failed', { code: error.code, message: error.message })
}

export async function sendAndLog(
  templateName: string,
  recipient: string,
  options: SendTemplateEmailOptions,
): Promise<void> {
  try {
    const result = await sendTemplateEmail(templateName, recipient, options)
    await logEmailSend(templateName, recipient, result.sent ? 'sent' : 'suppressed')
  } catch (e) {
    await logEmailSend(templateName, recipient, 'failed', e instanceof Error ? e.message : String(e))
    throw e
  }
}
