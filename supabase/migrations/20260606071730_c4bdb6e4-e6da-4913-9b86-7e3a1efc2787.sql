
ALTER TABLE public.bac_papers ADD COLUMN IF NOT EXISTS profil text;
CREATE INDEX IF NOT EXISTS idx_bac_papers_profil ON public.bac_papers(profil);
CREATE INDEX IF NOT EXISTS idx_bac_papers_session ON public.bac_papers(session);
TRUNCATE TABLE public.bac_papers;
