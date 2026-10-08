CREATE TABLE public.articole (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  materie text NOT NULL,
  keywords text NOT NULL DEFAULT '',
  description text NOT NULL,
  content_md text NOT NULL,
  published_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.articole TO anon, authenticated;
GRANT ALL ON public.articole TO service_role;
ALTER TABLE public.articole ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Articole publice" ON public.articole FOR SELECT USING (true);
CREATE INDEX idx_articole_published ON public.articole (published_at DESC);

CREATE TABLE public.content_job_state (
  id text PRIMARY KEY,
  grile_cursor integer NOT NULL DEFAULT 0,
  last_run_date date,
  locked_until timestamptz,
  paused_reason text,
  last_result jsonb,
  cron_secret text NOT NULL DEFAULT encode(extensions.gen_random_bytes(32),'hex'),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.content_job_state TO service_role;
ALTER TABLE public.content_job_state ENABLE ROW LEVEL SECURITY;
INSERT INTO public.content_job_state (id) VALUES ('daily');