import { createFileRoute } from '@tanstack/react-router'
import { runHealthChecks } from '@/lib/health-check.server'

export const Route = createFileRoute('/api/public/hooks/health-check')({
  server: {
    handlers: {
      POST: async () => {
        try {
          const result = await runHealthChecks()
          return Response.json({ ok: true, ...result })
        } catch (e: any) {
          return Response.json({ ok: false, error: e?.message ?? 'failed' }, { status: 500 })
        }
      },
      GET: async () => {
        const result = await runHealthChecks()
        return Response.json({ ok: true, ...result })
      },
    },
  },
})