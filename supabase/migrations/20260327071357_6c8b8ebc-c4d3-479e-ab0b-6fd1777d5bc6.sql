
-- ══════════════════════════════════════════════════════════
-- 1. SESSIONS TABLE
-- ══════════════════════════════════════════════════════════
CREATE TABLE public.sessions (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code          text NOT NULL DEFAULT '',
  name          text NOT NULL,
  format        text NOT NULL DEFAULT 'americano',
  partner_type  text NOT NULL DEFAULT 'random',
  courts        integer NOT NULL DEFAULT 2,
  total_rounds  integer NOT NULL DEFAULT 7,
  current_round integer NOT NULL DEFAULT 0,
  points_per_match integer NOT NULL DEFAULT 32,
  status        text NOT NULL DEFAULT 'pending_approval',
  host_id       uuid NOT NULL REFERENCES public.padel_players(id) ON DELETE CASCADE,
  venue_id      uuid REFERENCES public.venues(id) ON DELETE SET NULL,
  max_players   integer NOT NULL DEFAULT 8,
  locked        boolean NOT NULL DEFAULT false,
  scheduled_at  timestamptz,
  admin_note    text,
  approved_at   timestamptz,
  created_at    timestamptz NOT NULL DEFAULT now()
);

-- Auto-generate a short join code on insert
CREATE OR REPLACE FUNCTION public.generate_session_code()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.code = '' OR NEW.code IS NULL THEN
    NEW.code := upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 6));
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_session_code
  BEFORE INSERT ON public.sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_session_code();

ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Sessions viewable by everyone"
  ON public.sessions FOR SELECT TO public USING (true);

CREATE POLICY "Authenticated users can create sessions"
  ON public.sessions FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Host can update own session"
  ON public.sessions FOR UPDATE TO authenticated
  USING (host_id IN (SELECT id FROM padel_players WHERE user_id = auth.uid()));

CREATE POLICY "Admin can manage sessions"
  ON public.sessions FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));

-- ══════════════════════════════════════════════════════════
-- 2. SESSION_PLAYERS TABLE
-- ══════════════════════════════════════════════════════════
CREATE TABLE public.session_players (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id  uuid NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
  player_id   uuid NOT NULL REFERENCES public.padel_players(id) ON DELETE CASCADE,
  role        text NOT NULL DEFAULT 'player',
  status      text NOT NULL DEFAULT 'pending',
  joined_at   timestamptz,
  created_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (session_id, player_id)
);

ALTER TABLE public.session_players ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Session players viewable by everyone"
  ON public.session_players FOR SELECT TO public USING (true);

CREATE POLICY "Players can request to join"
  ON public.session_players FOR INSERT TO authenticated
  WITH CHECK (
    player_id IN (SELECT id FROM padel_players WHERE user_id = auth.uid())
  );

CREATE POLICY "Host can manage session players"
  ON public.session_players FOR UPDATE TO authenticated
  USING (
    session_id IN (
      SELECT s.id FROM sessions s
      JOIN padel_players p ON s.host_id = p.id
      WHERE p.user_id = auth.uid()
    )
  );

CREATE POLICY "Admin can manage session players"
  ON public.session_players FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));

-- ══════════════════════════════════════════════════════════
-- 3. SCORE_SUBMISSIONS TABLE
-- ══════════════════════════════════════════════════════════
CREATE TABLE public.score_submissions (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id           uuid NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
  court                integer NOT NULL DEFAULT 1,
  round                integer NOT NULL DEFAULT 1,
  team_a_p1            text NOT NULL DEFAULT '',
  team_a_p2            text NOT NULL DEFAULT '',
  team_b_p1            text NOT NULL DEFAULT '',
  team_b_p2            text NOT NULL DEFAULT '',
  score_a              text NOT NULL DEFAULT '0',
  score_b              text NOT NULL DEFAULT '0',
  winner_team          text,
  reported_by          uuid NOT NULL REFERENCES public.padel_players(id),
  session_rank_winners integer NOT NULL DEFAULT 0,
  session_rank_losers  integer NOT NULL DEFAULT 0,
  status               text NOT NULL DEFAULT 'pending',
  xp_credited          boolean NOT NULL DEFAULT false,
  reviewed_at          timestamptz,
  created_at           timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.score_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Scores viewable by everyone"
  ON public.score_submissions FOR SELECT TO public USING (true);

CREATE POLICY "Players can submit scores"
  ON public.score_submissions FOR INSERT TO authenticated
  WITH CHECK (
    reported_by IN (SELECT id FROM padel_players WHERE user_id = auth.uid())
  );

CREATE POLICY "Host can manage scores"
  ON public.score_submissions FOR UPDATE TO authenticated
  USING (
    session_id IN (
      SELECT s.id FROM sessions s
      JOIN padel_players p ON s.host_id = p.id
      WHERE p.user_id = auth.uid()
    )
  );

CREATE POLICY "Admin can manage scores"
  ON public.score_submissions FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));

-- ══════════════════════════════════════════════════════════
-- 4. SESSION_SUPPORTS TABLE
-- ══════════════════════════════════════════════════════════
CREATE TABLE public.session_supports (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id    uuid NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
  supporter_id  uuid NOT NULL REFERENCES public.padel_players(id),
  backed_id     uuid NOT NULL REFERENCES public.padel_players(id),
  amount        bigint NOT NULL DEFAULT 0,
  payout        bigint,
  resolved      boolean NOT NULL DEFAULT false,
  created_at    timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.session_supports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Supports viewable by session participants"
  ON public.session_supports FOR SELECT TO public USING (true);

CREATE POLICY "Players can place supports"
  ON public.session_supports FOR INSERT TO authenticated
  WITH CHECK (
    supporter_id IN (SELECT id FROM padel_players WHERE user_id = auth.uid())
  );

CREATE POLICY "Admin can manage supports"
  ON public.session_supports FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));

-- ══════════════════════════════════════════════════════════
-- 5. UPSERT_PADEL_PLAYER RPC (used by ensurePadelPlayer)
-- ══════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION public.upsert_padel_player(
  p_user_id uuid,
  p_name    text,
  p_email   text,
  p_avatar  text
)
RETURNS public.padel_players
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  result public.padel_players;
BEGIN
  INSERT INTO public.padel_players (user_id, name, avatar)
  VALUES (p_user_id, p_name, p_avatar)
  ON CONFLICT (user_id) DO UPDATE SET name = EXCLUDED.name, avatar = EXCLUDED.avatar
  RETURNING * INTO result;
  RETURN result;
END;
$$;

-- ══════════════════════════════════════════════════════════
-- 6. CREDIT_XP_FOR_SCORE RPC (used by useApproveScore)
-- ══════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION public.credit_xp_for_score(submission_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  sub record;
BEGIN
  SELECT * INTO sub FROM score_submissions WHERE id = submission_id AND status = 'pending';
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Score submission not found or already processed';
  END IF;
  UPDATE score_submissions
    SET status = 'approved', xp_credited = true, reviewed_at = now()
    WHERE id = submission_id;
END;
$$;

-- Enable realtime for session tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.session_players;
ALTER PUBLICATION supabase_realtime ADD TABLE public.score_submissions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.session_supports;
