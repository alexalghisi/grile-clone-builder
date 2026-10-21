-- Schedule the daily SEO content generator (3 blog articles + 250 grile + simulations per day).
-- Each tick does at most 3 generation steps (~3 AI calls) and checkpoints progress, so a tick stays
-- well under HTTP timeouts; the lease in content_job_state prevents overlapping runs.
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

DO $$
DECLARE j RECORD;
BEGIN
  FOR j IN SELECT jobname FROM cron.job WHERE jobname IN ('daily-content-tick') LOOP
    PERFORM cron.unschedule(j.jobname);
  END LOOP;
END $$;

SELECT cron.schedule(
  'daily-content-tick',
  '*/10 2-23 * * *',
  $$
  SELECT net.http_post(
    url := 'https://project--55f0cd08-eee4-4482-98ba-9f1422bac10e.lovable.app/api/public/hooks/daily-content?steps=3',
    headers := jsonb_build_object(
      'Content-Type','application/json',
      'Authorization', 'Bearer ' || (SELECT cron_secret FROM public.content_job_state WHERE id = 'daily')
    ),
    body := '{}'::jsonb,
    timeout_milliseconds := 300000
  );
  $$
);
