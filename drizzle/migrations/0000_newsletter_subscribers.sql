CREATE TABLE public.newsletter_subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  source text,
  consented_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.newsletter_subscribers TO service_role;
GRANT SELECT ON public.newsletter_subscribers TO authenticated;
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read subscribers" ON public.newsletter_subscribers
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));