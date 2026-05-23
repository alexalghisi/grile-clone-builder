CREATE POLICY "Admins view email leads"
ON public.email_leads
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'));