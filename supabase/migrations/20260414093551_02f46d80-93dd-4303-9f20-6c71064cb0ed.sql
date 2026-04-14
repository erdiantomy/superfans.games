-- 1. Add host and venue_owner to the app_role enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'host';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'venue_owner';

-- 2. Add venue tagging columns to sessions
ALTER TABLE public.sessions
  ADD COLUMN IF NOT EXISTS venue_name_tag text,
  ADD COLUMN IF NOT EXISTS venue_city_tag text,
  ADD COLUMN IF NOT EXISTS venue_claim_status text NOT NULL DEFAULT 'unlinked';

-- 3. Venue session claims table
CREATE TABLE IF NOT EXISTS public.venue_session_claims (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id   uuid NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
  venue_id     uuid NOT NULL REFERENCES public.venues(id) ON DELETE CASCADE,
  status       text NOT NULL DEFAULT 'pending',
  created_at   timestamptz NOT NULL DEFAULT now(),
  UNIQUE(session_id, venue_id)
);

ALTER TABLE public.venue_session_claims ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read on claims"
  ON public.venue_session_claims FOR SELECT TO public USING (true);

CREATE POLICY "Authenticated can insert claims"
  ON public.venue_session_claims FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Admin can manage claims"
  ON public.venue_session_claims FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 4. Host stats view
CREATE OR REPLACE VIEW public.host_stats AS
SELECT
  p.id AS host_id,
  p.name,
  p.avatar,
  p.user_id,
  COUNT(s.id) AS total_sessions,
  COUNT(s.id) FILTER (WHERE s.status = 'finished') AS completed_sessions,
  COUNT(s.id) FILTER (WHERE s.status IN ('active','live')) AS active_sessions,
  COALESCE(SUM(
    (SELECT COUNT(*) FROM session_players sp WHERE sp.session_id = s.id)
  ), 0) AS total_players_hosted
FROM public.padel_players p
LEFT JOIN public.sessions s ON s.host_id = p.id
GROUP BY p.id, p.name, p.avatar, p.user_id;

-- 5. Add hosting_xp column to padel_players
ALTER TABLE public.padel_players
  ADD COLUMN IF NOT EXISTS hosting_xp integer NOT NULL DEFAULT 0;

-- 6. Hosting XP trigger
CREATE OR REPLACE FUNCTION public.award_hosting_xp()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER
SET search_path TO 'public' AS $$
BEGIN
  IF NEW.status = 'finished' AND OLD.status != 'finished' THEN
    UPDATE public.padel_players
      SET hosting_xp = hosting_xp + 100
      WHERE id = NEW.host_id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_session_finished ON public.sessions;
CREATE TRIGGER on_session_finished
  AFTER UPDATE ON public.sessions
  FOR EACH ROW EXECUTE FUNCTION public.award_hosting_xp();

-- 7. Enable realtime for venue_session_claims
ALTER PUBLICATION supabase_realtime ADD TABLE public.venue_session_claims;