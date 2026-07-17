-- Store service role key in vault if not already present (reuse existing secret if any)
DO $$
DECLARE
  v_key text;
BEGIN
  SELECT decrypted_secret INTO v_key FROM vault.decrypted_secrets WHERE name = 'internal_hook_service_role_key' LIMIT 1;
  IF v_key IS NULL THEN
    -- Try reusing the existing email queue key
    SELECT decrypted_secret INTO v_key FROM vault.decrypted_secrets WHERE name = 'email_queue_service_role_key' LIMIT 1;
    IF v_key IS NOT NULL THEN
      PERFORM vault.create_secret(v_key, 'internal_hook_service_role_key');
    END IF;
  END IF;
END $$;

-- Unschedule prior versions
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
      'Authorization', 'Bearer ' || (
        SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'internal_hook_service_role_key' LIMIT 1
      )
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
      'Authorization', 'Bearer ' || (
        SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'internal_hook_service_role_key' LIMIT 1
      )
    ),
    body := '{}'::jsonb
  );
  $$
);