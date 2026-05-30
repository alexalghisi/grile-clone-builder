CREATE TABLE IF NOT EXISTS public.grile (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  universitate text NOT NULL,
  facultate text NOT NULL,
  materie text NOT NULL,
  dificultate text NOT NULL DEFAULT 'greu',
  intrebare text NOT NULL,
  variante jsonb NOT NULL,
  raspuns_corect text NOT NULL,
  explicatie text,
  referinta_programa text,
  sursa text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_grile_uni_fac_mat ON public.grile(universitate, facultate, materie);
CREATE INDEX IF NOT EXISTS idx_grile_dificultate ON public.grile(dificultate);
-- Dedup helper: hash of normalized question text per (uni, fac, mat)
CREATE UNIQUE INDEX IF NOT EXISTS uq_grile_dedup
  ON public.grile(universitate, facultate, materie, md5(lower(trim(intrebare))));

GRANT SELECT ON public.grile TO anon;
GRANT SELECT ON public.grile TO authenticated;
GRANT ALL ON public.grile TO service_role;

ALTER TABLE public.grile ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Grile sunt publice"
  ON public.grile FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Admins manage grile"
  ON public.grile FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
