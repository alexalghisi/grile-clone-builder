
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TABLE public.bac_papers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  subject_slug TEXT NOT NULL,
  subject_name TEXT NOT NULL,
  year INTEGER NOT NULL,
  session TEXT NOT NULL DEFAULT 'iunie',
  variant TEXT,
  paper_type TEXT NOT NULL DEFAULT 'subiect',
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  pdf_url TEXT,
  storage_path TEXT,
  description TEXT,
  source_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_bac_papers_subject ON public.bac_papers(subject_slug);
CREATE INDEX idx_bac_papers_year ON public.bac_papers(year DESC);
CREATE INDEX idx_bac_papers_subject_year ON public.bac_papers(subject_slug, year DESC);

ALTER TABLE public.bac_papers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "BAC papers are public"
  ON public.bac_papers FOR SELECT
  USING (true);

CREATE POLICY "Admins manage bac papers"
  ON public.bac_papers FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_bac_papers_updated_at
  BEFORE UPDATE ON public.bac_papers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.meditatii_leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  subject TEXT NOT NULL,
  level TEXT,
  contact TEXT NOT NULL,
  contact_type TEXT NOT NULL DEFAULT 'email',
  message TEXT,
  budget TEXT,
  page_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.meditatii_leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit meditatii leads"
  ON public.meditatii_leads FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Admins view meditatii leads"
  ON public.meditatii_leads FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

INSERT INTO storage.buckets (id, name, public)
VALUES ('bac-subiecte', 'bac-subiecte', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('og-images', 'og-images', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public read bac-subiecte"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'bac-subiecte');

CREATE POLICY "Public read og-images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'og-images');

CREATE POLICY "Service role write bac-subiecte"
  ON storage.objects FOR INSERT
  TO service_role
  WITH CHECK (bucket_id = 'bac-subiecte');

CREATE POLICY "Service role write og-images"
  ON storage.objects FOR INSERT
  TO service_role
  WITH CHECK (bucket_id = 'og-images');

CREATE POLICY "Service role update bac-subiecte"
  ON storage.objects FOR UPDATE
  TO service_role
  USING (bucket_id = 'bac-subiecte');

CREATE POLICY "Service role update og-images"
  ON storage.objects FOR UPDATE
  TO service_role
  USING (bucket_id = 'og-images');
