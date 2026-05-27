
# Plan refacere platformă (3 etape)

Lucrăm în 3 loop-uri separate, în ordinea aleasă. Aceasta e o livrare mare — vreau să terminăm și să testăm fiecare etapă înainte de următoarea.

---

## ETAPA 1 — Format grile conform admiterii reale (acest loop)

**Scop:** Grilele să arate ca subiectele reale UB/Politehnică: 6 variante, formule matematice, figuri, rezolvare pas-cu-pas, mod simulare cronometrat.

### 1.1. Schema DB (migrație)
- `questions.options` rămâne `jsonb` — dar acceptăm 6 variante (A-F).
- Nou: `questions.figure_url text NULL` — imagine/diagramă opțională în enunț.
- Nou: `questions.solution_md text NULL` — rezolvare pas-cu-pas (markdown + LaTeX), separat de `explanation` (scurt).
- Nou: `questions.session text NULL` — ex. "Admitere 2025", "Simulare 2026".
- Nou: `questions.problem_number int NULL` — numerotare în cadrul sesiunii.
- Nou: tabel `simulations` (id, university_id, subject_id, title, session, duration_minutes, total_questions, is_premium bool).
- Nou: tabel `simulation_questions` (simulation_id, question_id, order_index).
- Storage bucket nou: `question-figures` (public read).
- **Ștergem grilele vechi** (clean slate, confirmat de tine).

### 1.2. Rendering matematic + figuri
- Adaug `katex` + `react-katex`. `QuestionContent` randează `$...$` (inline) și `$$...$$` (block).
- Suport imagini în enunț prin `figure_url` (afișată sub enunț, max-h-96, lazy-load).
- Rezolvarea pas-cu-pas la fel: markdown + KaTeX + imagini.

### 1.3. UI grilă (refăcut)
- Format "Problema N." cu enunț bogat.
- 6 butoane A) B) C) D) E) F) (sau 4 dacă întrebarea are 4 — flexibil).
- După "Verifică": răspuns corect + secțiune "Rezolvare pas cu pas" expandabilă.

### 1.4. Mod simulare cronometrat
- Rută nouă: `/simulare/$slug` (cu `is_premium` flag în DB — gating real vine în Etapa 3).
- Timer countdown (ex. 180 min), auto-submit la 0, scor instant, salvare în `attempts`.
- Listă simulări pe `/simulare` (existentă — o refacem să citească din `simulations`).

### 1.5. Admin pentru grile noi
- `/admin/questions/new` — formular cu: enunț (markdown+LaTeX cu preview), 6 variante, răspuns corect, rezolvare, upload figură în bucket, sesiune, materie.
- Eu populez ~10-15 grile reale (UB MateInfo + Poli Info) ca seed, ca să vezi formatul live.

### Livrabile etapa 1
- Schema migrată, grile vechi șterse.
- Preview cu KaTeX funcțional + 6 variante + figuri + rezolvare.
- Cel puțin 1 simulare funcțională cronometrată.
- Admin de adăugare grile.

---

## ETAPA 2 — Redesign UI complet (loop următor)

Inspirație: admiterepoli.com.
- Paletă albastru/indigo + accent (oklch tokens noi în `styles.css`).
- Hero refăcut: propunere valoare clară + CTA dual (Vezi simulări / Începe gratuit).
- Navigație topbar: Informații · Subiecte & Rezolvări · Resurse · Simulări · Video.
- Dashboard cu sidebar (shadcn `Sidebar`): progres, simulări disponibile, status abonament.
- Carduri cu shadow subtil, spațiere generoasă, animații discrete (fade/slide, fără over-the-top).
- Mobil-first responsive.

La începutul Etapei 2 îți ofer 3 direcții vizuale (palete + tipografii + layout) ca să alegi vibe-ul.

---

## ETAPA 3 — Plăți Stripe built-in + gating premium (loop final)

- Rulez `recommend_payment_provider` → `enable_stripe_payments`.
- Produse: **Premium lunar** (50 RON/lună recurent) + **Simulare unică** (30 RON one-time).
- Pagină `/preturi` cu comparație Gratuit vs Premium + badge "Popular".
- Gating: simulările/capitolele cu `is_premium=true` → modal elegant "Deblochează Premium".
- Webhook Stripe → tabel `subscriptions` (user_id, status, plan, current_period_end).
- Profil: status abonament, link "Anulează", istoric facturi (via Stripe Customer Portal).

---

## Ce încep ACUM (Etapa 1)

1. Migrație DB (coloane noi + tabele simulations + bucket + drop date vechi din `questions`/`attempts`).
2. Instalez `katex` + `react-katex`.
3. Refac `QuestionContent` cu KaTeX + figuri.
4. Refac UI grilă pentru 6 variante + rezolvare.
5. Construiesc `/simulare/$slug` cronometrat.
6. Construiesc admin la `/admin/questions/new`.
7. Seed cu 10-15 grile reale (UB MateInfo + Politehnică Info).

**Confirmi planul și începem cu Etapa 1?** După ce o termin și o validezi în preview, trecem la Etapa 2 (redesign).
