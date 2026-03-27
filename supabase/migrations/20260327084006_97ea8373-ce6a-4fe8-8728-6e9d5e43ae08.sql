CREATE POLICY "Admins can delete registrations"
ON public.venue_registrations
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));