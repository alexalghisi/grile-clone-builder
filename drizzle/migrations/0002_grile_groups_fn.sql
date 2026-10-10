CREATE OR REPLACE FUNCTION public.grile_groups()
RETURNS TABLE(universitate text, facultate text, materie text)
LANGUAGE sql STABLE SET search_path = public AS $$
  SELECT universitate, facultate, materie FROM public.grile GROUP BY 1,2,3 ORDER BY 1,2,3
$$;
REVOKE ALL ON FUNCTION public.grile_groups() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.grile_groups() TO service_role;