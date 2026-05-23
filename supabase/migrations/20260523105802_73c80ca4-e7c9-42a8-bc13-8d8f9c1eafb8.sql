
-- HEALTH CHECKS
CREATE TABLE public.health_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  url TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL,
  expected_status INTEGER NOT NULL DEFAULT 200,
  max_response_ms INTEGER NOT NULL DEFAULT 5000,
  enabled BOOLEAN NOT NULL DEFAULT true,
  last_status INTEGER,
  last_response_ms INTEGER,
  last_checked_at TIMESTAMPTZ,
  last_alert_at TIMESTAMPTZ,
  last_error TEXT,
  consecutive_failures INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.health_checks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Health checks public read" ON public.health_checks FOR SELECT USING (true);
CREATE POLICY "Admins manage health checks" ON public.health_checks FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE TRIGGER trg_health_checks_updated BEFORE UPDATE ON public.health_checks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ADMITERE PAPERS
CREATE TABLE public.admitere_papers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  university_slug TEXT NOT NULL,
  university_name TEXT NOT NULL,
  subject_slug TEXT NOT NULL,
  subject_name TEXT NOT NULL,
  year INTEGER NOT NULL,
  session TEXT,
  variant TEXT,
  paper_type TEXT NOT NULL DEFAULT 'subiect',
  title TEXT NOT NULL,
  description TEXT,
  pdf_url TEXT,
  storage_path TEXT,
  source_url TEXT,
  file_size_bytes INTEGER,
  page_count INTEGER,
  ocr_text TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(university_slug, subject_slug, year, session, variant, paper_type)
);
CREATE INDEX idx_admitere_uni_subject ON public.admitere_papers(university_slug, subject_slug);
CREATE INDEX idx_admitere_year ON public.admitere_papers(year);
CREATE INDEX idx_admitere_uni ON public.admitere_papers(university_slug);
ALTER TABLE public.admitere_papers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admitere papers public read" ON public.admitere_papers FOR SELECT USING (true);
CREATE POLICY "Admins manage admitere papers" ON public.admitere_papers FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE TRIGGER trg_admitere_papers_updated BEFORE UPDATE ON public.admitere_papers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- SCRAPE SOURCES
CREATE TABLE public.scrape_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  university_slug TEXT NOT NULL UNIQUE,
  university_name TEXT NOT NULL,
  root_url TEXT NOT NULL,
  pdf_url_pattern TEXT,
  subject_hints JSONB DEFAULT '{}'::jsonb,
  enabled BOOLEAN NOT NULL DEFAULT true,
  status TEXT NOT NULL DEFAULT 'queued',
  last_run_at TIMESTAMPTZ,
  last_error TEXT,
  pdfs_discovered INTEGER NOT NULL DEFAULT 0,
  pdfs_imported INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.scrape_sources ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage scrape sources" ON public.scrape_sources FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE TRIGGER trg_scrape_sources_updated BEFORE UPDATE ON public.scrape_sources FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- SCRAPE JOBS
CREATE TABLE public.scrape_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id UUID REFERENCES public.scrape_sources(id) ON DELETE CASCADE,
  university_slug TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  pdfs_discovered INTEGER NOT NULL DEFAULT 0,
  pdfs_imported INTEGER NOT NULL DEFAULT 0,
  pdfs_failed INTEGER NOT NULL DEFAULT 0,
  error_message TEXT,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  finished_at TIMESTAMPTZ,
  log JSONB
);
CREATE INDEX idx_scrape_jobs_source ON public.scrape_jobs(source_id, started_at DESC);
ALTER TABLE public.scrape_jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins view scrape jobs" ON public.scrape_jobs FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- STORAGE BUCKET
INSERT INTO storage.buckets (id, name, public) VALUES ('admitere-subiecte', 'admitere-subiecte', true)
ON CONFLICT (id) DO NOTHING;
CREATE POLICY "Admitere subiecte public read" ON storage.objects FOR SELECT USING (bucket_id = 'admitere-subiecte');
CREATE POLICY "Admins upload admitere subiecte" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'admitere-subiecte' AND has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins update admitere subiecte" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'admitere-subiecte' AND has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins delete admitere subiecte" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'admitere-subiecte' AND has_role(auth.uid(), 'admin'::app_role));

-- SEED HEALTH CHECKS
INSERT INTO public.health_checks (url, label, expected_status, max_response_ms) VALUES
  ('https://grileadmitere.ro/', 'Homepage', 200, 4000),
  ('https://grileadmitere.ro/grile', 'Grile - listă universități', 200, 5000),
  ('https://grileadmitere.ro/subiecte-bac', 'Subiecte BAC hub', 200, 5000),
  ('https://grileadmitere.ro/grila-zilei', 'Grila zilei', 200, 5000),
  ('https://grileadmitere.ro/grile/umf-bucuresti', 'UMF București', 200, 6000),
  ('https://grileadmitere.ro/subiecte-bac/matematica', 'BAC Matematică', 200, 6000),
  ('https://grileadmitere.ro/admitere', 'Admitere hub', 200, 5000),
  ('https://grileadmitere.ro/sitemap.xml', 'Sitemap', 200, 4000)
ON CONFLICT (url) DO NOTHING;

-- SEED SCRAPE SOURCES (top universități)
INSERT INTO public.scrape_sources (university_slug, university_name, root_url, pdf_url_pattern) VALUES
  ('umf-bucuresti', 'UMF Carol Davila București', 'https://admitere.umfcd.ro/', '\.pdf$'),
  ('umf-cluj', 'UMF Iuliu Hațieganu Cluj', 'https://www.umfcluj.ro/admitere/', '\.pdf$'),
  ('umf-iasi', 'UMF Grigore T. Popa Iași', 'https://www.umfiasi.ro/admitere/', '\.pdf$'),
  ('umf-timisoara', 'UMF Victor Babeș Timișoara', 'https://www.umft.ro/admitere/', '\.pdf$'),
  ('upb', 'Universitatea Politehnica București', 'https://admitere.pub.ro/', '\.pdf$'),
  ('utcn', 'Universitatea Tehnică Cluj-Napoca', 'https://admitere.utcluj.ro/', '\.pdf$'),
  ('ase', 'Academia de Studii Economice București', 'https://admitere.ase.ro/', '\.pdf$'),
  ('ubb', 'Universitatea Babeș-Bolyai Cluj', 'https://www.ubbcluj.ro/ro/admitere/', '\.pdf$'),
  ('uaic', 'Universitatea Al. I. Cuza Iași', 'https://www.uaic.ro/admitere/', '\.pdf$'),
  ('unibuc', 'Universitatea din București', 'https://admitere.unibuc.ro/', '\.pdf$')
ON CONFLICT (university_slug) DO NOTHING;
