import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { sendErrorAlert } from '@/lib/alert-email.server'

const Schema = z.object({
  source: z.string().min(1).max(64).default('client'),
  message: z.string().min(1).max(2000),
  url: z.string().max(500).optional(),
  stack: z.string().max(8000).optional(),
  userAgent: z.string().max(500).optional(),
  extra: z.unknown().optional(),
})

export const Route = createFileRoute('/api/public/log-error')({
  server: {
    handlers: {
      OPTIONS: async () =>
        new Response(null, {
          status: 204,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
          },
        }),
      POST: async ({ request }) => {
        try {
          const body = await request.json()
          const parsed = Schema.safeParse(body)
          if (!parsed.success) {
            return Response.json({ error: 'Invalid payload' }, { status: 400 })
          }
          await sendErrorAlert(parsed.data)
          return Response.json({ ok: true }, {
            headers: { 'Access-Control-Allow-Origin': '*' },
          })
        } catch {
          return Response.json({ error: 'Bad request' }, { status: 400 })
        }
      },
    },
  },
})