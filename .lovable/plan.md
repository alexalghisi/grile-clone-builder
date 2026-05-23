
# Plan: Health-check + arhivă PDF admitere SEO

## 1. Health-check periodic pe pagini-cheie

Listă paginilor monitorizate (configurabilă în DB):
- `/` (homepage)
- `/grile` (lista universități)
- `/subiecte-bac` (hub BAC)
- `/grila-zilei`
- 3 pagini reprezentative: `/grile/umf-bucuresti`, `/quiz/<slug-popular>`, `/subiecte-bac/matematica`

**Implementare:**
- Tabel nou `health_checks` (url, expected_status, max_response_ms, enabled, last_status, last_checked_at, last_alert_at)
- Server route `/api/public/hooks/health-check` care iterează URL-urile, face `fetch` cu timeout 8s și loghează rezultatul
- Trigger eroare → `sendErrorAlert` (reutilizez infra existentă) dacă: status ≠ expected, sau response_ms > max_response_ms, sau eroare rețea
- Throttle 30 min per URL ca să nu spam-uiesc inbox-ul când o pagină e jos câteva ore
- `pg_cron` la fiecare 5 minute via `pg_net.http_post`

## 2. Schema DB pentru subiecte admitere

Nou tabel `admitere_papers` (același pattern ca `bac_papers`):
```
id uuid pk
university_slug text   -- ex: "umf-bucuresti"
university_name text
subject_slug text      -- ex: "biologie"
subject_name text
year int               -- 2001..2026
session text           -- "iulie" / "septembrie" / null
variant text           -- "varianta-1" / null
paper_type text        -- "subiect" / "barem"
title text
description text
pdf_url text           -- URL public Supabase Storage (bucketul nou "admitere-subiecte")
storage_path text
source_url text        -- de unde a fost scrapată
file_size_bytes int
page_count int
ocr_text text          -- text extras pentru SEO + căutare
created_at, updated_at
UNIQUE(university_slug, subject_slug, year, session, variant, paper_type)
```

Index-uri: (university_slug, subject_slug), (year), gin pe ocr_text pentru căutare.
Bucket public `admitere-subiecte` cu policy SELECT public, INSERT doar service-role.

## 3. Pipeline de scraping

**Sursa:** site-uri oficiale universități (admitere.umfcd.ro, admitere.upb.ro, etc.). Folosesc Firecrawl connector (deja disponibilă în Lovable) — robust pe JS-heavy sites și PDF-uri.

**Arhitectură:**
- Tabel `scrape_sources` cu lista universităților + URL-uri root de scanat + selectori/patterns + status (queued/running/done/failed) + last_run_at
- Tabel `scrape_jobs` per (uni, an, materie) cu status, retries, last_error
- Server route `/api/public/hooks/scrape-admitere` (cron orar, procesează batch 5 surse pe rulare ca să rămână în budgetul Firecrawl)
- Flow per sursă:
  1. Firecrawl `map` pe root URL → găsește toate URL-urile cu pattern `/admitere/.../*.pdf`
  2. Pentru fiecare PDF: download (fetch direct binar), upload în Supabase Storage `admitere-subiecte/{uni-slug}/{materie-slug}/{an}/{filename}.pdf`
  3. Extract metadata: parsare nume fișier + path pentru (an, materie, sesiune, variantă) — fallback la OCR primele 2 pagini cu `pdf-parse` pentru a deduce contextul
  4. Insert în `admitere_papers` cu ON CONFLICT DO UPDATE
- Panou admin minim la `/admin/scraping` (visible doar pentru `has_role(admin)`) pentru: trigger manual sursă, vezi log job-uri, retry failed, marcaj PDF "invalid"

**Realism:** majoritatea universităților nu au arhivă completă 2001-2026 online. Pipeline-ul va găsi tipic 2015-2026. Pentru anii vechi rămâne loc pentru upload manual prin admin (form simplu de upload + completare metadata).

## 4. Pagini SEO pentru subiecte admitere

URL: `/admitere/$uniSlug/$materieSlug/$an` (granular, maxim SEO)

Plus pagini agregator:
- `/admitere` — hub: listă universități cu număr subiecte
- `/admitere/$uniSlug` — listă materii ale universității
- `/admitere/$uniSlug/$materieSlug` — listă ani pentru (uni, materie)
- `/admitere/$uniSlug/$materieSlug/$an` — pagina finală cu PDF embed + download + variante + barem

**Pe pagina finală (cea mai importantă SEO):**
- `<h1>`: "Subiecte Admitere {Materie} {Universitate} {An} — Rezolvate"
- Meta title <60 chars, description <160 chars
- JSON-LD: `LearningResource` + `BreadcrumbList` + `Course` (about universitate)
- Conținut text 300+ cuvinte: descriere structură proba, ce subiecte au căzut, link la varianta cu rezolvări (când există grile pe site), CTA către `/quiz/...` și `/meditatii`
- PDF embed via `<object>` cu link de download
- Text OCR (primele 800 caractere) afișat below-the-fold ca conținut indexabil
- Internal linking: anii adiacenți, alte materii ale uni, alte universități cu aceeași materie
- `og:image` generat dinamic via Supabase Storage (sau static placeholder per materie)

**Sitemap:** sitemap.xml extins cu toate URL-urile `/admitere/...` (pot fi 1000+ — fără probleme până la 50k per sitemap).

## 5. Tehnic — fișiere noi/modificate

```
supabase/migrations/<timestamp>_admitere_arhiva.sql      # health_checks, admitere_papers, scrape_sources, scrape_jobs, bucket
src/lib/admitere.functions.ts                            # serverFn list/get pentru pagini
src/lib/admitere-scrape.server.ts                        # pipeline scraping
src/lib/health-check.server.ts                           # logică monitorizare
src/routes/api/public/hooks/health-check.ts              # cron endpoint
src/routes/api/public/hooks/scrape-admitere.ts           # cron endpoint
src/routes/admitere.index.tsx                            # hub
src/routes/admitere.$uniSlug.tsx
src/routes/admitere.$uniSlug.$materieSlug.tsx
src/routes/admitere.$uniSlug.$materieSlug.$an.tsx        # pagina finală SEO
src/routes/sitemap[.]xml.ts                              # extins cu admitere
```

## 6. Pași execuție (în această ordine)

1. Conectez Firecrawl (necesar pentru scraping) — voi cere conectarea
2. Migrație DB (toate tabelele + bucket + RLS + seed `health_checks` cu URL-urile inițiale)
3. Health-check pipeline (server route + cron)
4. Schelet pagini `/admitere/*` cu loaders care funcționează pe DB goală (afișează "în pregătire" elegant)
5. Sitemap extins
6. Pipeline scraping (server route + cron orar, batch mic)
7. Panou admin minim
8. Trigger primul run de scraping pentru 3-4 universități de test (UMF Buc, UMF Cluj, UPB, ASE)

## 7. Ce iese din scope (pentru sesiuni viitoare)

- Rezolvări detaliate ale subiectelor (asta presupune muncă editorială serioasă, nu scraping)
- OCR full pe toate PDF-urile (rulez doar pe primele 2 pagini pentru metadata; full OCR ar fi cron separat)
- Generare automată de quiz-uri din PDF-uri
- Comparator subiecte între ani

## Costuri/limite de știut

- Firecrawl: cu plan-ul standard ar trebui să acopere ~500-1000 PDF-uri/lună. Pentru arhivă completă va dura câteva săptămâni de rulare cron.
- Storage Supabase: ~1-5MB per PDF × ~5000 PDF-uri = ~15GB. În planul Lovable Cloud actual e OK, dar de monitorizat.
