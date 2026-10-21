ALTER TABLE public.articole ADD COLUMN IF NOT EXISTS question_id uuid REFERENCES public.questions(id) ON DELETE SET NULL;
CREATE UNIQUE INDEX IF NOT EXISTS articole_question_id_unique ON public.articole(question_id) WHERE question_id IS NOT NULL;
