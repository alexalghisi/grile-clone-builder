import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'
import { useServerFn } from '@tanstack/react-start'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { CheckCircle2, GraduationCap, Target, Timer, ShieldCheck } from 'lucide-react'
import { toast } from 'sonner'
import { submitMeditatiiLead } from '@/lib/meditatii.functions'

const LP_URL = 'https://grileadmitere.ro/lp/grile-admitere'

const FAQ = [
  {
    q: 'Ce primesc după ce completez formularul?',
    a: 'Te contactăm pe email sau telefon cu planul de pregătire pentru admiterea aleasă și cu accesul la grilele și simulările potrivite facultății tale.',
  },
  {
    q: 'Grilele respectă programa de admitere?',
    a: 'Da. Fiecare set de grile este construit pe programa oficială a facultății respective, cu explicații pas cu pas la fiecare răspuns.',
  },
  {
    q: 'Costă ceva?',
    a: 'Simulările și grilele de pe platformă sunt gratuite. Formularul este doar pentru a-ți trimite planul de pregătire personalizat.',
  },
]

export const Route = createFileRoute('/lp/grile-admitere')({
  head: () => ({
    meta: [
      { title: 'Grile Admitere Facultate 2026 — Pregătire pe programa oficială' },
      {
        name: 'description',
        content:
          'Pregătire pentru admiterea la facultate 2026: grile pe programa oficială a fiecărei universități, simulări cu timp și explicații detaliate. Cere planul tău de pregătire.',
      },
      { name: 'robots', content: 'index, follow' },
      { property: 'og:title', content: 'Grile Admitere Facultate 2026 — Pregătire pe programa oficială' },
      {
        property: 'og:description',
        content: 'Grile și simulări pe programa fiecărei universități. Cere planul tău de pregătire pentru admitere 2026.',
      },
      { property: 'og:type', content: 'website' },
      { property: 'og:url', content: LP_URL },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: 'Grile Admitere Facultate 2026' },
      { name: 'twitter:description', content: 'Grile și simulări pe programa oficială a facultății tale.' },
    ],
    links: [{ rel: 'canonical', href: LP_URL }],
    scripts: [
      {
        type: 'application/ld+json',
        children: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: FAQ.map((f) => ({
            '@type': 'Question',
            name: f.q,
            acceptedAnswer: { '@type': 'Answer', text: f.a },
          })),
        }),
      },
    ],
  }),
  component: LandingPage,
})

function LandingPage() {
  const send = useServerFn(submitMeditatiiLead)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [form, setForm] = useState({ nume: '', facultate: '', contact: '', mesaj: '' })

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.facultate.trim() || !form.contact.trim()) return
    setLoading(true)
    try {
      const isPhone = /^[+0-9 ()-]{7,}$/.test(form.contact.trim())
      await send({
        data: {
          subject: form.facultate.trim().slice(0, 100),
          level: 'admitere',
          contact: form.contact.trim(),
          contact_type: isPhone ? 'phone' : 'email',
          message: `Nume: ${form.nume || '-'}\n${form.mesaj || ''}`.slice(0, 2000),
          budget: 'google-ads-lp',
          page_url: typeof window !== 'undefined' ? window.location.href : LP_URL,
        },
      })
      setDone(true)
      toast.success('Cererea a fost trimisă. Te contactăm în curând.')
    } catch {
      toast.error('Nu am putut trimite cererea. Încearcă din nou.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-6xl items-center gap-2 px-4 py-4">
          <GraduationCap className="h-5 w-5 text-primary" />
          <Link to="/" className="font-bold tracking-tight">
            GrileAdmitere.ro
          </Link>
        </div>
      </header>

      <section className="mx-auto grid max-w-6xl gap-10 px-4 py-12 md:grid-cols-2 md:py-20">
        <div>
          <h1 className="text-3xl font-bold leading-tight md:text-5xl">
            Grile de admitere la facultate, exact pe programa universității tale
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Mii de grile cu explicații pas cu pas și simulări cronometrate, construite pe subiectele reale
            de admitere. Spune-ne la ce facultate dai și îți trimitem planul de pregătire.
          </p>
          <ul className="mt-8 space-y-3 text-sm">
            <li className="flex items-start gap-3">
              <Target className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <span>Grile pe programa oficială a fiecărei facultăți și materii</span>
            </li>
            <li className="flex items-start gap-3">
              <Timer className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <span>Simulări cu timp, ca la examenul real de admitere</span>
            </li>
            <li className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <span>Explicații detaliate la fiecare răspuns, nu doar varianta corectă</span>
            </li>
          </ul>
        </div>

        <div id="formular" className="rounded-xl border border-border bg-card p-6 shadow-sm">
          {done ? (
            <div className="flex flex-col items-center gap-3 py-10 text-center">
              <CheckCircle2 className="h-10 w-10 text-primary" />
              <h2 className="text-xl font-semibold">Cererea a fost trimisă</h2>
              <p className="text-sm text-muted-foreground">
                Te contactăm în cel mai scurt timp cu planul tău de pregătire.
              </p>
              <Button asChild variant="outline" className="mt-2">
                <Link to="/admitere">Vezi grilele disponibile</Link>
              </Button>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <h2 className="text-xl font-semibold">Cere planul tău de pregătire</h2>
                <p className="mt-1 text-sm text-muted-foreground">Îți răspundem pe email sau telefon.</p>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="nume">Nume</Label>
                <Input
                  id="nume"
                  value={form.nume}
                  onChange={(e) => setForm({ ...form, nume: e.target.value })}
                  placeholder="Numele tău"
                  autoComplete="name"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="facultate">Facultatea / materia pentru admitere *</Label>
                <Input
                  id="facultate"
                  required
                  value={form.facultate}
                  onChange={(e) => setForm({ ...form, facultate: e.target.value })}
                  placeholder="ex: UPB Informatică, UMF Medicină"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="contact">Email sau telefon *</Label>
                <Input
                  id="contact"
                  required
                  value={form.contact}
                  onChange={(e) => setForm({ ...form, contact: e.target.value })}
                  placeholder="nume@email.com"
                  autoComplete="email"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="mesaj">Detalii (opțional)</Label>
                <Textarea
                  id="mesaj"
                  rows={3}
                  value={form.mesaj}
                  onChange={(e) => setForm({ ...form, mesaj: e.target.value })}
                  placeholder="La ce materii ai nevoie de ajutor?"
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Se trimite...' : 'Trimite cererea'}
              </Button>
              <p className="text-xs text-muted-foreground">
                Datele tale sunt folosite doar pentru a-ți răspunde la această cerere.
              </p>
            </form>
          )}
        </div>
      </section>

      <section className="border-t border-border bg-muted/30">
        <div className="mx-auto max-w-6xl px-4 py-12">
          <h2 className="text-2xl font-bold">Cum te pregătești pentru admitere 2026</h2>
          <div className="mt-6 grid gap-6 md:grid-cols-3">
            <div className="rounded-lg border border-border bg-card p-5">
              <div className="text-sm font-semibold text-primary">1. Alegi facultatea</div>
              <p className="mt-2 text-sm text-muted-foreground">
                Selectezi universitatea și materiile de admitere care te interesează.
              </p>
            </div>
            <div className="rounded-lg border border-border bg-card p-5">
              <div className="text-sm font-semibold text-primary">2. Rezolvi grile</div>
              <p className="mt-2 text-sm text-muted-foreground">
                Lucrezi pe grile construite după programa oficială, cu explicații la fiecare item.
              </p>
            </div>
            <div className="rounded-lg border border-border bg-card p-5">
              <div className="text-sm font-semibold text-primary">3. Dai simulări</div>
              <p className="mt-2 text-sm text-muted-foreground">
                Testezi ritmul real de examen cu simulări cronometrate și îți vezi punctele slabe.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-12">
        <h2 className="text-2xl font-bold">Întrebări frecvente</h2>
        <div className="mt-6 space-y-5">
          {FAQ.map((f) => (
            <div key={f.q}>
              <h3 className="font-semibold">{f.q}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{f.a}</p>
            </div>
          ))}
        </div>
        <div className="mt-10 rounded-xl border border-border bg-card p-6 text-center">
          <h2 className="text-xl font-semibold">Începe pregătirea pentru admitere 2026</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Completează formularul și primești planul potrivit facultății tale.
          </p>
          <Button asChild className="mt-4">
            <a href="#formular">Cere planul de pregătire</a>
          </Button>
        </div>
      </section>

      <footer className="border-t border-border py-8 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} GrileAdmitere.ro ·{' '}
        <Link to="/contact" className="underline">
          Contact
        </Link>
      </footer>
    </main>
  )
}
