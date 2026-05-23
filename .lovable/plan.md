
## Ce livrez

### 1. Subiecte BAC — PDFs reale 2001→2026, toate materiile

Materii vizate (cele 6 existente pe `/subiecte-bac`): Matematică (M1/M2/Pedagogic/Mate-Info/Științe), Română, Biologie (XI+XII), Chimie (Organică+Anorganică), Fizică (Mecanică/Electricitate/Optică/Termodinamică), Engleză.

Sursă oficială: **subiecte.edu.ro** (arhiva MEC). Le descarc cu un script Node în loturi, le încarc într-un bucket Storage public `bac-subiecte`, și salvez metadata într-un tabel nou `bac_papers` (an, sesiune, materie, varianta, tip [subiect/barem], url, slug).

**Realist:** acoperirea per an nu e 100% — unele variante lipsesc din arhivă, mai ales pre-2010. Promit best-effort: descărcăm tot ce există, marcăm "nu există" pe ce lipsește, fără placeholdere fake.

### 2. Pagini noi SEO-first

- `/subiecte-bac/$materie` — listă toți anii pentru materie (ex. `/subiecte-bac/matematica`)
- `/subiecte-bac/$materie/$an` — pagina anului (ex. `/subiecte-bac/matematica/2024`) cu toate variantele + sesiuni (iunie/august/special), download PDF, descriere subiecte, link la quiz-ul corespunzător

Fiecare pagină: H1 unic targetat ("Subiecte BAC Matematică 2024 — Modele Rezolvate PDF"), meta description, OG image generat (template cu materie + an), JSON-LD `LearningResource`, breadcrumbs, internal link la `/quiz/$slug` și la anii adiacenți.

### 3. Sitemap

Adaug în `src/routes/sitemap[.]xml.ts` toate paginile `/subiecte-bac/$materie` și `/subiecte-bac/$materie/$an` (sursă: tabelul `bac_papers`). Update priority pe paginile cu PDFs reale.

### 4. Internal linking & H1

- Adaug bloc "Resurse conexe" pe `/quiz/$slug`, `/grile/$uniSlug`, `/subiecte-bac` → linkuri către subiecte BAC pe aceeași materie
- Rescriu H1-urile pe paginile existente (`/subiecte-bac`, `/grile`, `/grila-zilei`, `/simulare`) cu keyword density real
- Adaug componenta `<RelatedResources>` reutilizabilă

### 5. OG images

Generez 6 OG images base (una per materie) + folosesc template runtime pentru variațiile pe an (text overlay simplu). Pentru paginile fără imagine specifică (`/subiecte-bac` hub) — 1 OG hero.

### 6. Hub Meditații (vertical nou — keywords "meditații/caut profesor/ore online")

Asta e **separat** de BAC. Sugestie: rută nouă `/meditatii` cu:
- Hub SEO `/meditatii` — H1 "Meditații Online 2026 — Profesori Verificați"
- `/meditatii/matematica`, `/meditatii/romana`, etc. — pagini pe materie
- Form "Caut profesor" (lead capture → salvat în DB, primești mail)
- Listare profesori (gol la început, populezi tu sau permitem self-signup ulterior)
- Sitemap + OG + JSON-LD `Service`

**Întrebare deschisă:** vrei doar paginile SEO (lead capture, fără profesori reali deocamdată) sau marketplace complet cu signup profesor? Recomand etapa 1 = doar SEO + lead form, marketplace într-un pas următor.

## Detalii tehnice

- Tabel nou: `bac_papers(id, subject_slug, year, session, variant, paper_type, pdf_url, title, slug)` — public read RLS
- Tabel nou: `meditatii_leads(id, subject, level, contact, message, created_at)` — insert public, select doar admin
- Storage bucket: `bac-subiecte` (public), structură `{subject}/{year}/{session}-{variant}-{type}.pdf`
- Script descărcare: rulează server-side cu `fetch` + `supabaseAdmin.storage.upload`, rate-limited
- 156 ani×materii × ~3 variante = potențial ~500 PDFs. Voi rula în batch-uri și raportez progresul.

## Ordine de execuție

1. Migrații DB + bucket
2. Script descărcare + upload PDFs (raportez câte am găsit per materie)
3. Rute noi `/subiecte-bac/$materie` + `/subiecte-bac/$materie/$an`
4. Sitemap + internal linking + H1
5. OG images
6. Hub meditații (dacă confirmi etapa 1)

## Ce am nevoie de la tine

1. **Confirmare scop** (sau "fă tot"): plan complet OK?
2. **Meditații**: doar SEO + lead form (recomandat), sau marketplace complet?
3. **Mailul pentru leaduri meditații**: tot `alexalghisi@gmail.com`?
