import { createFileRoute } from '@tanstack/react-router'
import { runScrapeBatch } from '@/lib/admitere-scrape.server'

export const Route = createFileRoute('/api/public/hooks/scrape-admitere')({
  server: {
    handlers: {
      POST: async () => {
        try {
          const result = await runScrapeBatch()
          return Response.json({ ok: true, ...result })
        } catch (e: any) {
          return Response.json({ ok: false, error: e?.message ?? 'failed' }, { status: 500 })
        }
      },
      GET: async () => {
        const result = await runScrapeBatch()
        return Response.json({ ok: true, ...result })
      },
    },
  },
})