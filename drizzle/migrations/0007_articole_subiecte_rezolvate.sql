ALTER TABLE public.articole ADD COLUMN IF NOT EXISTS intrebari jsonb;
ALTER TABLE public.articole ADD COLUMN IF NOT EXISTS subject_slug text;