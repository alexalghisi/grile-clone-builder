import * as React from 'react'
import { Html, Head, Body, Container, Heading, Text, Section, Hr } from '@react-email/components'
import type { TemplateEntry } from './registry'

interface Props {
  name?: string
  email?: string
  subject?: string
  message?: string
  url?: string
  userAgent?: string
  timestamp?: string
}

function ContactMessageEmail({
  name = '-',
  email = '-',
  subject = '(fără subiect)',
  message = '',
  url = '-',
  userAgent = '-',
  timestamp = new Date().toISOString(),
}: Props) {
  return (
    <Html>
      <Head />
      <Body style={{ fontFamily: 'system-ui, -apple-system, Segoe UI, sans-serif', background: '#ffffff', color: '#0b0f1a', margin: 0, padding: '24px' }}>
        <Container style={{ maxWidth: 640, background: '#f8fafc', border: '1px solid #e5e7eb', borderRadius: 12, padding: 24 }}>
          <Heading style={{ margin: 0, color: '#2563eb', fontSize: 20 }}>📩 Mesaj nou de contact</Heading>
          <Text style={{ color: '#6b7280', marginTop: 4 }}>{timestamp}</Text>
          <Hr style={{ borderColor: '#e5e7eb', margin: '16px 0' }} />
          <Section>
            <Text style={{ margin: '4px 0', color: '#6b7280' }}>Nume</Text>
            <Text style={{ margin: 0, fontWeight: 600 }}>{name}</Text>
            <Text style={{ margin: '12px 0 4px', color: '#6b7280' }}>Email</Text>
            <Text style={{ margin: 0, fontFamily: 'ui-monospace, monospace', color: '#2563eb' }}>{email}</Text>
            <Text style={{ margin: '12px 0 4px', color: '#6b7280' }}>Subiect</Text>
            <Text style={{ margin: 0, fontWeight: 600 }}>{subject}</Text>
            <Text style={{ margin: '12px 0 4px', color: '#6b7280' }}>Mesaj</Text>
            <Text style={{ margin: 0, whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>{message}</Text>
          </Section>
          <Hr style={{ borderColor: '#e5e7eb', margin: '16px 0' }} />
          <Text style={{ color: '#9ca3af', fontSize: 12, margin: '4px 0' }}>URL: {url}</Text>
          <Text style={{ color: '#9ca3af', fontSize: 12, margin: 0 }}>UA: {userAgent}</Text>
        </Container>
      </Body>
    </Html>
  )
}

export const template = {
  component: ContactMessageEmail,
  subject: (data: Record<string, any>) => `[Contact] ${data?.subject || 'Mesaj nou'} — ${data?.name || 'anonim'}`,
  displayName: 'Contact form message',
  previewData: { name: 'Ion Popescu', email: 'ion@example.com', subject: 'Întrebare', message: 'Salut!' },
} satisfies TemplateEntry