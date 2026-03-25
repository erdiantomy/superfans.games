
-- Allow authenticated users to update venues (venue admin uses password auth, not Supabase auth)
-- For now, allow any authenticated user to update; venue password check happens client-side
CREATE POLICY "Authenticated users can update venues"
  ON public.venues FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Allow authenticated users to update venue_registrations (for super admin approval)
CREATE POLICY "Authenticated users can update registrations"
  ON public.venue_registrations FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Allow admins to insert venues (for approval flow)
CREATE POLICY "Admins can insert venues"
  ON public.venues FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
