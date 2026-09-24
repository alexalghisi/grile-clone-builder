import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

const RECIPIENT = 'alexalghisi@gmail.com'

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
    const { sendAndLog } = await import('./email-log.server')

    await sendAndLog('contact-message', RECIPIENT, {
      templateData: {
        ...data,
        subject: data.subject || '(fără subiect)',
        timestamp: new Date().toISOString(),
      },
      idempotencyKey: `contact-${crypto.randomUUID()}`,
      replyTo: data.email,
    })

    return { ok: true }
  })