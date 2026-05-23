-- Deduplicate: keep oldest row per source_url
DELETE FROM public.admitere_papers a
USING public.admitere_papers b
WHERE a.source_url = b.source_url
  AND a.source_url IS NOT NULL
  AND a.created_at > b.created_at;

-- Unique index on source_url to prevent future dups
CREATE UNIQUE INDEX IF NOT EXISTS admitere_papers_source_url_key
  ON public.admitere_papers (source_url)
  WHERE source_url IS NOT NULL;