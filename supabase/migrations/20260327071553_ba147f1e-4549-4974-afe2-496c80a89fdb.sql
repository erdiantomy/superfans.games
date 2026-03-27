
-- Monthly leaderboard: players who participated in sessions at a given venue this month
CREATE OR REPLACE FUNCTION public.venue_monthly_leaderboard(p_venue_id uuid)
RETURNS TABLE(
  id uuid,
  user_id uuid,
  name text,
  avatar text,
  division text,
  monthly_pts integer,
  lifetime_xp integer,
  matches_played integer,
  matches_won integer,
  streak integer
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT DISTINCT ON (pp.id)
    pp.id, pp.user_id, pp.name, pp.avatar, pp.division,
    pp.monthly_pts, pp.lifetime_xp, pp.matches_played, pp.matches_won, pp.streak
  FROM padel_players pp
  JOIN session_players sp ON sp.player_id = pp.id
  JOIN sessions s ON s.id = sp.session_id
  WHERE s.venue_id = p_venue_id
    AND sp.status = 'approved'
    AND s.created_at >= date_trunc('month', now())
  ORDER BY pp.id, pp.monthly_pts DESC
$$;

-- Wrap with proper ordering
CREATE OR REPLACE FUNCTION public.venue_monthly_leaderboard(p_venue_id uuid)
RETURNS TABLE(
  id uuid,
  user_id uuid,
  name text,
  avatar text,
  division text,
  monthly_pts integer,
  lifetime_xp integer,
  matches_played integer,
  matches_won integer,
  streak integer
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT pp.id, pp.user_id, pp.name, pp.avatar, pp.division,
         pp.monthly_pts, pp.lifetime_xp, pp.matches_played, pp.matches_won, pp.streak
  FROM padel_players pp
  WHERE pp.id IN (
    SELECT DISTINCT sp.player_id
    FROM session_players sp
    JOIN sessions s ON s.id = sp.session_id
    WHERE s.venue_id = p_venue_id
      AND sp.status = 'approved'
      AND s.created_at >= date_trunc('month', now())
  )
  ORDER BY pp.monthly_pts DESC
  LIMIT 50
$$;

-- Lifetime leaderboard: all-time players at a venue
CREATE OR REPLACE FUNCTION public.venue_lifetime_leaderboard(p_venue_id uuid)
RETURNS TABLE(
  id uuid,
  user_id uuid,
  name text,
  avatar text,
  division text,
  monthly_pts integer,
  lifetime_xp integer,
  matches_played integer,
  matches_won integer,
  streak integer
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT pp.id, pp.user_id, pp.name, pp.avatar, pp.division,
         pp.monthly_pts, pp.lifetime_xp, pp.matches_played, pp.matches_won, pp.streak
  FROM padel_players pp
  WHERE pp.id IN (
    SELECT DISTINCT sp.player_id
    FROM session_players sp
    JOIN sessions s ON s.id = sp.session_id
    WHERE s.venue_id = p_venue_id
      AND sp.status = 'approved'
  )
  ORDER BY pp.lifetime_xp DESC
  LIMIT 50
$$;
