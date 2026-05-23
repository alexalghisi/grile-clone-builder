
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Seed critical health-check URLs (idempotent)
INSERT INTO public.health_checks (url, label, expected_status, max_response_ms) VALUES
  ('https://www.grileadmitere.ro/', 'Homepage', 200, 5000),
  ('https://www.grileadmitere.ro/grile', 'Grile hub', 200, 5000),
  ('https://www.grileadmitere.ro/subiecte-bac', 'Subiecte BAC hub', 200, 5000),
  ('https://www.grileadmitere.ro/admitere', 'Admitere hub', 200, 5000),
  ('https://www.grileadmitere.ro/sitemap.xml', 'Sitemap', 200, 8000),
  ('https://www.grileadmitere.ro/autentificare', 'Auth page', 200, 5000)
ON CONFLICT DO NOTHING;

-- Unschedule any prior versions
DO $$
DECLARE j RECORD;
BEGIN
  FOR j IN SELECT jobname FROM cron.job WHERE jobname IN ('health-check-5min','scrape-admitere-hourly') LOOP
    PERFORM cron.unschedule(j.jobname);
  END LOOP;
END $$;

SELECT cron.schedule(
  'health-check-5min',
  '*/5 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://project--55f0cd08-eee4-4482-98ba-9f1422bac10e.lovable.app/api/public/hooks/health-check',
    headers := jsonb_build_object(
      'Content-Type','application/json',
      'apikey','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh6Ym5lamhldnl5d2JxZWJ2dXJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2MjE2OTUsImV4cCI6MjA5NDE5NzY5NX0.2BdQu-GEiQbAC5cvSE7lxKJGTC1XIwwoScoEKjmmIp8'
    ),
    body := '{}'::jsonb
  );
  $$
);

SELECT cron.schedule(
  'scrape-admitere-hourly',
  '17 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://project--55f0cd08-eee4-4482-98ba-9f1422bac10e.lovable.app/api/public/hooks/scrape-admitere',
    headers := jsonb_build_object(
      'Content-Type','application/json',
      'apikey','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh6Ym5lamhldnl5d2JxZWJ2dXJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2MjE2OTUsImV4cCI6MjA5NDE5NzY5NX0.2BdQu-GEiQbAC5cvSE7lxKJGTC1XIwwoScoEKjmmIp8'
    ),
    body := '{}'::jsonb
  );
  $$
);
