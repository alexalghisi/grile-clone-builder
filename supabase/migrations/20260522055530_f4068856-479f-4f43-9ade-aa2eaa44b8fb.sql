CREATE TABLE IF NOT EXISTS public.email_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  source text,
  quiz_slug text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS email_leads_email_unique ON public.email_leads (lower(email));
ALTER TABLE public.email_leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can insert email leads"
ON public.email_leads FOR INSERT TO anon, authenticated
WITH CHECK (true);