import { createClient } from '@supabase/supabase-js'

const FIRECRAWL_API = 'https://api.firecrawl.dev/v2'
const BUCKET = 'admitere-subiecte'
const MAX_PDFS_PER_RUN = 15
const MAX_PDF_BYTES = 25 * 1024 * 1024

const SUBJECT_HINTS: { slug: string; name: string; patterns: RegExp[] }[] = [
  { slug: 'biologie', name: 'Biologie', patterns: [/biolog/i] },
  { slug: 'chimie', name: 'Chimie', patterns: [/chimi/i] },
  { slug: 'fizica', name: 'Fizică', patterns: [/fizic/i] },
  { slug: 'matematica', name: 'Matematică', patterns: [/matemat/i, /\bmate\b/i] },
  { slug: 'informatica', name: 'Informatică', patterns: [/informatic/i, /\binfo\b/i] },
  { slug: 'limba-romana', name: 'Limba Română', patterns: [/român|romana|lb-rom|limba-rom/i] },
  { slug: 'limba-engleza', name: 'Limba Engleză', patterns: [/englez|english/i] },
  { slug: 'economie', name: 'Economie', patterns: [/econom/i] },
  { slug: 'logica', name: 'Logică', patterns: [/logic/i] },
  { slug: 'istorie', name: 'Istorie', patterns: [/istori/i] },
  { slug: 'geografie', name: 'Geografie', patterns: [/geograf/i] },
  { slug: 'anatomie', name: 'Anatomie', patterns: [/anatom/i] },
]

function getAdmin() {
  const url = process.env.SUPABASE_URL ?? import.meta.env.VITE_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Supabase env not configured for scrape')
  return createClient(url, key)
}

function detectSubject(url: string): { slug: string; name: string } {
  for (const s of SUBJECT_HINTS) {
    if (s.patterns.some((p) => p.test(url))) return { slug: s.slug, name: s.name }
  }
  return { slug: 'general', name: 'General' }
}

function detectYear(url: string): number | null {
  const m = url.match(/(20\d{2}|19[89]\d)/)
  if (!m) return null
  const year = parseInt(m[1], 10)
  if (year < 1995 || year > new Date().getFullYear() + 1) return null
  return year
}

function detectSession(url: string): string | null {
  if (/septembr|toamn|sesiune-2|sept/i.test(url)) return 'septembrie'
  if (/iulie|iunie|var|primavar/i.test(url)) return 'iulie'
  return null
}

function detectPaperType(url: string): 'subiect' | 'barem' {
  return /barem|rezolva|grila-corecte|solutii/i.test(url) ? 'barem' : 'subiect'
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 80)
}

async function firecrawlMap(root: string): Promise<string[]> {
  const key = process.env.FIRECRAWL_API_KEY
  if (!key) throw new Error('FIRECRAWL_API_KEY missing')
  const res = await fetch(`${FIRECRAWL_API}/map`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ url: root, limit: 5000, includeSubdomains: true }),
  })
  if (!res.ok) throw new Error(`Firecrawl map failed: ${res.status} ${await res.text()}`)
  const json: any = await res.json()
  const links: string[] = json?.links ?? json?.data?.links ?? []
  return links.filter((l) => /\.pdf(\?|$)/i.test(l))
}

async function downloadAndStore(supabase: any, pdfUrl: string, uniSlug: string): Promise<{ path: string; publicUrl: string; size: number } | null> {
  const res = await fetch(pdfUrl, { redirect: 'follow', headers: { 'User-Agent': 'GrileAdmitereBot/1.0' } })
  if (!res.ok) return null
  const ct = res.headers.get('content-type') ?? ''
  if (!/pdf/i.test(ct) && !/\.pdf(\?|$)/i.test(pdfUrl)) return null
  const buf = new Uint8Array(await res.arrayBuffer())
  if (buf.byteLength === 0 || buf.byteLength > MAX_PDF_BYTES) return null

  const subj = detectSubject(pdfUrl)
  const year = detectYear(pdfUrl) ?? new Date().getFullYear()
  const fileName = pdfUrl.split('/').pop()?.split('?')[0] || `paper-${Date.now()}.pdf`
  const safeName = slugify(fileName.replace(/\.pdf$/i, '')) + '.pdf'
  const path = `${uniSlug}/${subj.slug}/${year}/${safeName}`

  const { error } = await supabase.storage.from(BUCKET).upload(path, buf, {
    contentType: 'application/pdf',
    upsert: true,
  })
  if (error) return null

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path)
  return { path, publicUrl: data.publicUrl, size: buf.byteLength }
}

export async function runScrapeBatch(): Promise<{ processed: number; sources: number; imported: number; failed: number; details: any[] }> {
  const supabase = getAdmin()

  const { data: sources } = await supabase
    .from('scrape_sources')
    .select('*')
    .eq('enabled', true)
    .order('last_run_at', { ascending: true, nullsFirst: true })
    .limit(2)

  if (!sources || sources.length === 0) return { processed: 0, sources: 0, imported: 0, failed: 0, details: [] }

  let totalImported = 0
  let totalFailed = 0
  const details: any[] = []

  for (const source of sources) {
    const jobIns = await supabase
      .from('scrape_jobs')
      .insert({ source_id: source.id, university_slug: source.university_slug, status: 'running' })
      .select('id')
      .single()
    const jobId = jobIns.data?.id
    let discovered = 0
    let imported = 0
    let failed = 0
    let errorMessage: string | null = null

    try {
      const pdfs = await firecrawlMap(source.root_url)
      discovered = pdfs.length
      const batch = pdfs.slice(0, MAX_PDFS_PER_RUN)

      for (const pdfUrl of batch) {
        try {
          const stored = await downloadAndStore(supabase, pdfUrl, source.university_slug)
          if (!stored) { failed += 1; continue }
          const subj = detectSubject(pdfUrl)
          const year = detectYear(pdfUrl) ?? new Date().getFullYear()
          const session = detectSession(pdfUrl)
          const paperType = detectPaperType(pdfUrl)
          const variant = pdfUrl.match(/varianta?[-_]?(\d+)/i)?.[1] ?? null
          const title = `Subiecte ${subj.name} ${source.university_name} ${year}${session ? ` — ${session}` : ''}${variant ? ` (varianta ${variant})` : ''}`

          await supabase.from('admitere_papers').upsert(
            {
              university_slug: source.university_slug,
              university_name: source.university_name,
              subject_slug: subj.slug,
              subject_name: subj.name,
              year,
              session,
              variant,
              paper_type: paperType,
              title,
              pdf_url: stored.publicUrl,
              storage_path: stored.path,
              source_url: pdfUrl,
              file_size_bytes: stored.size,
            },
            { onConflict: 'university_slug,subject_slug,year,session,variant,paper_type' },
          )
          imported += 1
        } catch {
          failed += 1
        }
      }
    } catch (e: any) {
      errorMessage = e?.message ? String(e.message) : String(e)
    }

    await supabase
      .from('scrape_sources')
      .update({
        status: errorMessage ? 'failed' : 'done',
        last_run_at: new Date().toISOString(),
        last_error: errorMessage,
        pdfs_discovered: (source.pdfs_discovered ?? 0) + discovered,
        pdfs_imported: (source.pdfs_imported ?? 0) + imported,
      })
      .eq('id', source.id)

    if (jobId) {
      await supabase
        .from('scrape_jobs')
        .update({
          status: errorMessage ? 'failed' : 'done',
          pdfs_discovered: discovered,
          pdfs_imported: imported,
          pdfs_failed: failed,
          error_message: errorMessage,
          finished_at: new Date().toISOString(),
        })
        .eq('id', jobId)
    }

    totalImported += imported
    totalFailed += failed
    details.push({ source: source.university_slug, discovered, imported, failed, error: errorMessage })
  }

  return { processed: sources.length, sources: sources.length, imported: totalImported, failed: totalFailed, details }
}