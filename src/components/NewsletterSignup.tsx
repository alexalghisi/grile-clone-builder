import { useState } from 'react'
import { useServerFn } from '@tanstack/react-start'
import { Mail, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { subscribeNewsletter } from '@/lib/newsletter.functions'

export function NewsletterSignup({ source = 'site' }: { source?: string }) {
  const subscribe = useServerFn(subscribeNewsletter)
  const [email, setEmail] = useState('')
  const [consent, setConsent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!consent) {
      setError('Bifează acordul ca să te abonezi.')
      return
    }
    setLoading(true)
    try {
      const res = await subscribe({ data: { email, consent: true, source } })
      if (res.ok) setDone(true)
      else setError(res.reason)
    } catch {
      setError('Nu am putut salva. Încearcă din nou.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="rounded-2xl border border-border bg-card p-6 sm:p-8">
      {done ? (
        <div className="flex flex-col items-center gap-2 text-center">
          <CheckCircle2 className="h-8 w-8 text-primary" />
          <h2 className="text-xl font-semibold">Te-ai abonat!</h2>
          <p className="text-sm text-muted-foreground">Îți scriem când apar grile și subiecte noi.</p>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="mx-auto max-w-xl space-y-4">
          <div className="text-center">
            <div className="mx-auto mb-3 inline-flex rounded-lg bg-primary/10 p-2.5">
              <Mail className="h-5 w-5 text-primary" />
            </div>
            <h2 className="text-xl font-bold sm:text-2xl">Află primul când apar grile noi</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Grile noi, subiecte BAC și sfaturi pentru admitere, direct pe email.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="adresa@email.com"
              autoComplete="email"
              aria-label="Adresa de email"
            />
            <Button type="submit" disabled={loading}>
              {loading ? 'Se salvează...' : 'Abonează-mă'}
            </Button>
          </div>
          <label className="flex items-start gap-2 text-xs text-muted-foreground">
            <Checkbox checked={consent} onCheckedChange={(v) => setConsent(v === true)} className="mt-0.5" />
            <span>Sunt de acord să primesc pe email noutăți de la GrileAdmitere.ro. Mă pot dezabona oricând.</span>
          </label>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </form>
      )}
    </section>
  )
}
