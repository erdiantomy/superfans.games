
-- Archive table for monthly leaderboard snapshots
CREATE TABLE public.monthly_leaderboard_archives (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id uuid NOT NULL,
  player_name text NOT NULL DEFAULT '',
  month_key text NOT NULL,
  monthly_pts integer NOT NULL DEFAULT 0,
  final_rank integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_archives_month ON public.monthly_leaderboard_archives (month_key);
CREATE INDEX idx_archives_player ON public.monthly_leaderboard_archives (player_id);
CREATE UNIQUE INDEX idx_archives_player_month ON public.monthly_leaderboard_archives (player_id, month_key);

ALTER TABLE public.monthly_leaderboard_archives ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Archives viewable by everyone"
  ON public.monthly_leaderboard_archives FOR SELECT
  TO public USING (true);

CREATE POLICY "System inserts archives"
  ON public.monthly_leaderboard_archives FOR INSERT
  TO authenticated WITH CHECK (true);

-- Function to archive and reset
CREATE OR REPLACE FUNCTION public.archive_and_reset_monthly_pts()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  archive_month text;
BEGIN
  -- Archive previous month
  archive_month := to_char(now() - interval '1 day', 'YYYY-MM');

  -- Insert ranked snapshots (skip players with 0 pts)
  INSERT INTO public.monthly_leaderboard_archives (player_id, player_name, month_key, monthly_pts, final_rank)
  SELECT id, name, archive_month, monthly_pts,
         ROW_NUMBER() OVER (ORDER BY monthly_pts DESC, id)::integer
  FROM public.padel_players
  WHERE monthly_pts > 0
  ON CONFLICT (player_id, month_key) DO NOTHING;

  -- Reset all monthly points
  UPDATE public.padel_players SET monthly_pts = 0;

  -- Reset last_known_rank so the trigger recalculates fresh
  UPDATE public.padel_players SET last_known_rank = NULL;
END;
$$;
