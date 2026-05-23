import * as React from 'react'
import { Html, Head, Body, Container, Heading, Text, Section, Hr } from '@react-email/components'
import type { TemplateEntry } from './registry'

interface ErrorAlertProps {
  source?: string
  message?: string
  url?: string
  stack?: string
  userAgent?: string
  timestamp?: string
  extra?: string
}

function ErrorAlertEmail({
  source = 'unknown',
  message = 'No message',
  url = '-',
  stack = '',
  userAgent = '-',
  timestamp = new Date().toISOString(),
  extra = '',
}: ErrorAlertProps) {
  return (
    <Html>
      <Head />
      <Body style={{ fontFamily: 'system-ui, -apple-system, Segoe UI, sans-serif', background: '#0b0f1a', color: '#e6e9ef', margin: 0, padding: '24px' }}>
        <Container style={{ maxWidth: 640, background: '#111827', border: '1px solid #1f2937', borderRadius: 12, padding: 24 }}>
          <Heading style={{ margin: 0, color: '#f87171', fontSize: 20 }}>🚨 GrileAdmitere — Eroare detectată</Heading>
          <Text style={{ color: '#9ca3af', marginTop: 4 }}>Sursă: <strong style={{ color: '#fff' }}>{source}</strong> · {timestamp}</Text>
          <Hr style={{ borderColor: '#1f2937', margin: '16px 0' }} />
          <Section>
            <Text style={{ margin: '4px 0', color: '#9ca3af' }}>URL</Text>
            <Text style={{ margin: 0, fontFamily: 'ui-monospace, monospace', color: '#93c5fd', wordBreak: 'break-all' }}>{url}</Text>
          </Section>
          <Section style={{ marginTop: 12 }}>
            <Text style={{ margin: '4px 0', color: '#9ca3af' }}>Mesaj</Text>
            <Text style={{ margin: 0, color: '#fca5a5' }}>{message}</Text>
          </Section>
          {stack ? (
            <Section style={{ marginTop: 12 }}>
              <Text style={{ margin: '4px 0', color: '#9ca3af' }}>Stack</Text>
              <pre style={{ background: '#0b1220', color: '#e5e7eb', padding: 12, borderRadius: 8, fontSize: 12, overflow: 'auto', margin: 0 }}>{stack}</pre>
            </Section>
          ) : null}
          {extra ? (
            <Section style={{ marginTop: 12 }}>
              <Text style={{ margin: '4px 0', color: '#9ca3af' }}>Detalii</Text>
              <pre style={{ background: '#0b1220', color: '#e5e7eb', padding: 12, borderRadius: 8, fontSize: 12, overflow: 'auto', margin: 0 }}>{extra}</pre>
            </Section>
          ) : null}
          <Hr style={{ borderColor: '#1f2937', margin: '16px 0' }} />
          <Text style={{ color: '#6b7280', fontSize: 12, margin: 0 }}>User-Agent: {userAgent}</Text>
        </Container>
      </Body>
    </Html>
  )
}

export const template = {
  component: ErrorAlertEmail,
  displayName: 'Error Alert',
  subject: (data: Record<string, any>) =>
    `🚨 [GrileAdmitere] ${data.source || 'error'}: ${(data.message || 'Unknown error').slice(0, 80)}`,
  to: 'alexalghisi@gmail.com',
  previewData: {
    source: 'server',
    message: 'Example error',
    url: 'https://grileadmitere.ro/grile',
    stack: 'Error: example\n  at fn (file.ts:1:1)',
    userAgent: 'Mozilla/5.0',
    timestamp: new Date().toISOString(),
  },
} satisfies TemplateEntry