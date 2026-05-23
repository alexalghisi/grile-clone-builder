import * as React from 'react'
import { Html, Head, Body, Container, Heading, Text, Section, Hr } from '@react-email/components'
import type { TemplateEntry } from './registry'

interface LeadAlertProps {
  email?: string
  quizSlug?: string
  source?: string
  total?: number
  timestamp?: string
}

function LeadAlertEmail({
  email = '-',
  quizSlug = '-',
  source = 'quiz_gate',
  total = 0,
  timestamp = new Date().toISOString(),
}: LeadAlertProps) {
  return (
    <Html>
      <Head />
      <Body style={{ fontFamily: 'system-ui, -apple-system, Segoe UI, sans-serif', background: '#0b0f1a', color: '#e6e9ef', margin: 0, padding: '24px' }}>
        <Container style={{ maxWidth: 640, background: '#111827', border: '1px solid #1f2937', borderRadius: 12, padding: 24 }}>
          <Heading style={{ margin: 0, color: '#34d399', fontSize: 20 }}>💌 Lead nou pe GrileAdmitere</Heading>
          <Text style={{ color: '#9ca3af', marginTop: 4 }}>Total leaduri: <strong style={{ color: '#fff' }}>{total}</strong> · {timestamp}</Text>
          <Hr style={{ borderColor: '#1f2937', margin: '16px 0' }} />
          <Section>
            <Text style={{ margin: '4px 0', color: '#9ca3af' }}>Email</Text>
            <Text style={{ margin: 0, fontFamily: 'ui-monospace, monospace', color: '#93c5fd', wordBreak: 'break-all' }}>{email}</Text>
          </Section>
          <Section style={{ marginTop: 12 }}>
            <Text style={{ margin: '4px 0', color: '#9ca3af' }}>Quiz</Text>
            <Text style={{ margin: 0, color: '#fff' }}>{quizSlug}</Text>
          </Section>
          <Section style={{ marginTop: 12 }}>
            <Text style={{ margin: '4px 0', color: '#9ca3af' }}>Sursă</Text>
            <Text style={{ margin: 0, color: '#fff' }}>{source}</Text>
          </Section>
          <Hr style={{ borderColor: '#1f2937', margin: '16px 0' }} />
          <Text style={{ color: '#6b7280', fontSize: 12, margin: 0 }}>
            Vezi toate leadurile în panoul admin: https://grileadmitere.ro/admin/leads
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

export const template = {
  component: LeadAlertEmail,
  displayName: 'Lead Alert',
  subject: (data: Record<string, any>) =>
    `💌 Lead nou — ${data.email || 'necunoscut'} (${data.quizSlug || '-'})`,
  to: 'alexalghisi@gmail.com',
  previewData: {
    email: 'maria.popescu@gmail.com',
    quizSlug: 'upb-ac-info',
    source: 'quiz_gate',
    total: 42,
    timestamp: new Date().toISOString(),
  },
} satisfies TemplateEntry
