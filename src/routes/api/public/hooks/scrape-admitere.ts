import { createFileRoute } from '@tanstack/react-router'
import { runScrapeBatch } from '@/lib/admitere-scrape.server'

function isAuthorized(request: Request): boolean {
  const expected = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!expected) return false
  const authHeader = request.headers.get('authorization') ?? request.headers.get('Authorization')
  if (!authHeader?.startsWith('Bearer ')) return false
  return authHeader.slice('Bearer '.length).trim() === expected
}

export const Route = createFileRoute('/api/public/hooks/scrape-admitere')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        if (!isAuthorized(request)) {
          return Response.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
        }
        try {
          const result = await runScrapeBatch()
          return Response.json({ ok: true, ...result })
        } catch (e: any) {
          return Response.json({ ok: false, error: e?.message ?? 'failed' }, { status: 500 })
        }
      },
      GET: async ({ request }) => {
        if (!isAuthorized(request)) {
          return Response.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
        }
        const result = await runScrapeBatch()
        return Response.json({ ok: true, ...result })
      },
    },
  },
})