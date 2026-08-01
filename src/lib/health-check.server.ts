import { createClient } from '@supabase/supabase-js'
import { sendErrorAlert } from './alert-email.server'

const ALERT_THROTTLE_MS = 30 * 60 * 1000
// A single bad response is almost always a deploy/cold-start blip. Only page
// the owner once a check has failed on consecutive runs.
const ALERT_AFTER_CONSECUTIVE_FAILURES = 2
const RETRY_ATTEMPTS = 3
const RETRY_DELAY_MS = 2500

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

function getAdmin() {
  const url = process.env.SUPABASE_URL ?? import.meta.env.VITE_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Supabase env not configured for health-check')
  return createClient(url, key)
}

export async function runHealthChecks(): Promise<{ checked: number; failed: number; alerted: number }> {
  const supabase = getAdmin()
  const { data: checks } = await supabase
    .from('health_checks')
    .select('*')
    .eq('enabled', true)
  if (!checks || checks.length === 0) return { checked: 0, failed: 0, alerted: 0 }

  let failed = 0
  let alerted = 0
  const now = Date.now()

  await Promise.all(
    checks.map(async (c: any) => {
      let status = 0
      let error: string | null = null
      let responseMs = 0
      let statusOk = false
      let speedOk = false
      let ok = false

      for (let attempt = 1; attempt <= RETRY_ATTEMPTS; attempt++) {
        const startedAt = Date.now()
        status = 0
        error = null
        try {
          const controller = new AbortController()
          const timeout = setTimeout(() => controller.abort(), 15_000)
          const res = await fetch(c.url, {
            signal: controller.signal,
            headers: { 'User-Agent': 'GrileAdmitereHealthCheck/1.0' },
            redirect: 'follow',
          })
          clearTimeout(timeout)
          status = res.status
          responseMs = Date.now() - startedAt
        } catch (e: any) {
          error = e?.message ? String(e.message) : String(e)
          responseMs = Date.now() - startedAt
        }

        statusOk = status === c.expected_status
        speedOk = responseMs <= c.max_response_ms
        ok = statusOk && speedOk && !error
        if (ok) break
        if (attempt < RETRY_ATTEMPTS) await sleep(RETRY_DELAY_MS)
      }

      const consecutive = ok ? 0 : (c.consecutive_failures ?? 0) + 1

      await supabase
        .from('health_checks')
        .update({
          last_status: status,
          last_response_ms: responseMs,
          last_checked_at: new Date().toISOString(),
          last_error: error,
          consecutive_failures: consecutive,
        })
        .eq('id', c.id)

      if (!ok) {
        failed += 1
        const lastAlert = c.last_alert_at ? new Date(c.last_alert_at).getTime() : 0
        const throttled = now - lastAlert < ALERT_THROTTLE_MS
        const confirmed = consecutive >= ALERT_AFTER_CONSECUTIVE_FAILURES
        if (!throttled && confirmed) {
          const reason = error
            ? `Eroare rețea: ${error}`
            : !statusOk
              ? `Status ${status} (așteptat ${c.expected_status})`
              : `Lent: ${responseMs}ms (limită ${c.max_response_ms}ms)`
          await sendErrorAlert({
            source: 'health-check',
            message: `${c.label} — ${reason}`,
            url: c.url,
            extra: { responseMs, status, consecutive_failures: consecutive },
          })
          await supabase
            .from('health_checks')
            .update({ last_alert_at: new Date().toISOString() })
            .eq('id', c.id)
          alerted += 1
        }
      }
    }),
  )

  return { checked: checks.length, failed, alerted }
}