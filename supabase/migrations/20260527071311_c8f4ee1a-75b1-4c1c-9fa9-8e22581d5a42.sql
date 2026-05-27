
-- 1. Wipe existing quiz data (clean slate)
DELETE FROM public.attempts;
DELETE FROM public.questions;

-- 2. Extend questions table
ALTER TABLE public.questions
  ADD COLUMN IF NOT EXISTS figure_url text,
  ADD COLUMN IF NOT EXISTS solution_md text,
  ADD COLUMN IF NOT EXISTS session text,
  ADD COLUMN IF NOT EXISTS problem_number integer;

-- 3. Simulations table
CREATE TABLE IF NOT EXISTS public.simulations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  university_id uuid REFERENCES public.universities(id) ON DELETE CASCADE,
  subject_id uuid REFERENCES public.subjects(id) ON DELETE SET NULL,
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  session text,
  description text,
  duration_minutes integer NOT NULL DEFAULT 180,
  total_questions integer NOT NULL DEFAULT 20,
  is_premium boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.simulations TO anon, authenticated;
GRANT ALL ON public.simulations TO service_role;

ALTER TABLE public.simulations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Simulations are public"
  ON public.simulations FOR SELECT
  USING (true);

CREATE POLICY "Admins manage simulations"
  ON public.simulations FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_simulations_updated_at
  BEFORE UPDATE ON public.simulations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 4. Simulation questions join table
CREATE TABLE IF NOT EXISTS public.simulation_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  simulation_id uuid NOT NULL REFERENCES public.simulations(id) ON DELETE CASCADE,
  question_id uuid NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (simulation_id, question_id)
);

CREATE INDEX IF NOT EXISTS idx_simq_sim ON public.simulation_questions(simulation_id, order_index);

GRANT SELECT ON public.simulation_questions TO anon, authenticated;
GRANT ALL ON public.simulation_questions TO service_role;

ALTER TABLE public.simulation_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Simulation questions are public"
  ON public.simulation_questions FOR SELECT
  USING (true);

CREATE POLICY "Admins manage simulation questions"
  ON public.simulation_questions FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- 5. Storage bucket for question figures
INSERT INTO storage.buckets (id, name, public)
VALUES ('question-figures', 'question-figures', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Question figures public read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'question-figures');

CREATE POLICY "Admins upload question figures"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'question-figures' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins update question figures"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'question-figures' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins delete question figures"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'question-figures' AND has_role(auth.uid(), 'admin'::app_role));
