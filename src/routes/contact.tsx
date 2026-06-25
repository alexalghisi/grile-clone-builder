import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { useServerFn } from '@tanstack/react-start'
import { Header } from '@/components/Header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Mail, Send, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'
import { sendContactMessage } from '@/lib/contact.functions'

export const Route = createFileRoute('/contact')({
  head: () => ({
    meta: [
      { title: 'Contact | GrileAdmitere.ro' },
      { name: 'description', content: 'Contactează echipa GrileAdmitere.ro — sugestii, întrebări sau colaborări. Îți răspundem în cel mai scurt timp.' },
      { name: 'robots', content: 'index, follow' },
    ],
  }),
  component: ContactPage,
})

function ContactPage() {
  const send = useServerFn(sendContactMessage)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (loading) return
    setLoading(true)
    try {
      await send({
        data: {
          ...form,
          url: typeof window !== 'undefined' ? window.location.href : '',
          userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
        },
      })
      setDone(true)
      setForm({ name: '', email: '', subject: '', message: '' })
      toast.success('Mesajul a fost trimis!')
    } catch (err: any) {
      toast.error(err?.message || 'A apărut o eroare. Încearcă din nou.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto max-w-3xl px-4 py-12">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-xl [background-image:var(--gradient-hero)] text-white shadow-[var(--shadow-glow)]">
            <Mail className="h-6 w-6" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Contact</h1>
          <p className="mt-2 text-muted-foreground">
            Sugestii, întrebări sau colaborări? Scrie-ne și revenim cât putem de repede.
          </p>
        </div>

        {done ? (
          <div className="rounded-xl border border-border bg-card p-8 text-center">
            <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-500" />
            <h2 className="mt-3 text-xl font-semibold">Mulțumim!</h2>
            <p className="mt-1 text-muted-foreground">Am primit mesajul tău și revenim pe email.</p>
            <Button className="mt-4" variant="outline" onClick={() => setDone(false)}>Trimite alt mesaj</Button>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-5 rounded-xl border border-border bg-card p-6 md:p-8">
            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <Label htmlFor="name">Nume *</Label>
                <Input id="name" required maxLength={100} value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Ion Popescu" />
              </div>
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input id="email" type="email" required maxLength={255} value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="ion@example.com" />
              </div>
            </div>
            <div>
              <Label htmlFor="subject">Subiect</Label>
              <Input id="subject" maxLength={200} value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                placeholder="Întrebare despre admitere" />
            </div>
            <div>
              <Label htmlFor="message">Mesaj *</Label>
              <Textarea id="message" required minLength={5} maxLength={5000} rows={7}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                placeholder="Scrie aici mesajul tău..." />
            </div>
            <Button type="submit" disabled={loading} className="w-full md:w-auto">
              <Send className="mr-2 h-4 w-4" />
              {loading ? 'Se trimite...' : 'Trimite mesajul'}
            </Button>
          </form>
        )}
      </main>
    </div>
  )
}