import * as React from 'react'
import { render } from '@react-email/components'
import { createClient } from '@supabase/supabase-js'
import { TEMPLATES } from './email-templates/registry'
import { getOrCreateUnsubscribeToken } from './email-unsubscribe.server'

const SITE_NAME = 'GrileAdmitere'
const SENDER_DOMAIN = 'notify.grileadmitere.ro'
const FROM_DOMAIN = 'grileadmitere.ro'
const ALERT_RECIPIENT = 'alexalghisi@gmail.com'

// Simple in-memory throttle so we don't spam the inbox if the same error
// fires many times in a short window. Per-worker; best-effort.
const seen = new Map<string, number>()
const THROTTLE_MS = 5 * 60 * 1000
const GLOBAL_MAX_PER_WINDOW = 20
const globalTimestamps: number[] = []

function normalizeMessage(msg: string): string {
  return (msg || '')
    .toLowerCase()
    .replace(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/g, '<uuid>')
    .replace(/0x[0-9a-f]+/g, '<hex>')
    .replace(/\d+/g, '<n>')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 160)
}

function shouldSend(key: string): boolean {
  const now = Date.now()
  // Global cap regardless of key — hard ceiling on outbound alert volume.
  while (globalTimestamps.length && now - globalTimestamps[0] > THROTTLE_MS) {
    globalTimestamps.shift()
  }
  if (globalTimestamps.length >= GLOBAL_MAX_PER_WINDOW) return false

  const last = seen.get(key) ?? 0
  if (now - last < THROTTLE_MS) return false
  seen.set(key, now)
  globalTimestamps.push(now)
  if (seen.size > 200) {
    for (const [k, v] of seen) if (now - v > THROTTLE_MS) seen.delete(k)
  }
  return true
}

export interface AlertPayload {
  source: string
  message: string
  url?: string
  stack?: string
  userAgent?: string
  extra?: unknown
}

export async function sendErrorAlert(payload: AlertPayload): Promise<void> {
  try {
    // Server-side suppression: drop noisy/known-benign client errors even if
    // they slipped past the client-side filter. These are not actionable.
    const msg = payload.message || ''
    const stack = payload.stack || ''
    const combined = `${msg}\n${stack}`
    const IGNORED_PATTERNS: RegExp[] = [
      /Minified React error #(418|421|422|423|425)/,
      /ResizeObserver loop/i,
      /adsbygoogle/i,
      /TagError/,
      /No slot size for availableWidth/i,
      /googlesyndication|googletagmanager|google-analytics|highperformanceformat|profitablecpmratenetwork/i,
      /sessionStorage|localStorage/i,
      /Access is denied for this document/i,
      /Load failed|NetworkError|Failed to fetch/i,
      /AbortError|The operation was aborted/i,
      /Non-Error promise rejection captured/i,
      /^Script error\.?$/,
    ]
    if (IGNORED_PATTERNS.some((re) => re.test(combined))) return
    if (!msg || msg === 'undefined' || msg === 'null' || msg === '[object Object]') return

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? process.env.SUPABASE_URL
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!supabaseUrl || !serviceKey) return

    const key = `${payload.source}|${normalizeMessage(payload.message)}|${payload.url || ''}`
    if (!shouldSend(key)) return

    const entry = TEMPLATES['error-alert']
    if (!entry) return

    const data = {
      source: payload.source,
      message: payload.message,
      url: payload.url ?? '-',
      stack: payload.stack ?? '',
      userAgent: payload.userAgent ?? '-',
      timestamp: new Date().toISOString(),
      extra: payload.extra ? JSON.stringify(payload.extra, null, 2).slice(0, 4000) : '',
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
      template_name: 'error-alert',
      recipient_email: ALERT_RECIPIENT,
      status: 'pending',
    })

    await supabase.rpc('enqueue_email', {
      queue_name: 'transactional_emails',
      payload: {
        message_id: messageId,
        to: ALERT_RECIPIENT,
        from: `${SITE_NAME} Alerts <alerts@${FROM_DOMAIN}>`,
        sender_domain: SENDER_DOMAIN,
        subject,
        html,
        text,
        purpose: 'transactional',
        label: 'error-alert',
        idempotency_key: `alert-${messageId}`,
        unsubscribe_token: unsubscribeToken,
        queued_at: new Date().toISOString(),
      },
    })
  } catch (e) {
    console.error('sendErrorAlert failed', e)
  }
}