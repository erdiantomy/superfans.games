-- Add last_known_rank to track previous rank position
ALTER TABLE public.padel_players ADD COLUMN IF NOT EXISTS last_known_rank integer DEFAULT NULL;

-- Create player_notifications table
CREATE TABLE IF NOT EXISTS public.player_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id uuid NOT NULL REFERENCES public.padel_players(id) ON DELETE CASCADE,
  title text NOT NULL,
  body text NOT NULL DEFAULT '',
  type text NOT NULL DEFAULT 'general',
  read boolean NOT NULL DEFAULT false,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.player_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Players see own notifications"
  ON public.player_notifications FOR SELECT
  TO authenticated
  USING (player_id IN (SELECT id FROM public.padel_players WHERE user_id = auth.uid()));

CREATE POLICY "Players update own notifications"
  ON public.player_notifications FOR UPDATE
  TO authenticated
  USING (player_id IN (SELECT id FROM public.padel_players WHERE user_id = auth.uid()));

CREATE POLICY "System inserts notifications"
  ON public.player_notifications FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Enable realtime for player_notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.player_notifications;

-- Create rank change detection function
CREATE OR REPLACE FUNCTION public.detect_rank_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_rank integer;
  old_rank integer;
  direction text;
  player_name text;
BEGIN
  -- Only act on XP changes
  IF NEW.monthly_pts = OLD.monthly_pts AND NEW.lifetime_xp = OLD.lifetime_xp THEN
    RETURN NEW;
  END IF;

  -- Calculate new monthly rank
  SELECT COUNT(*) + 1 INTO new_rank
  FROM public.padel_players
  WHERE monthly_pts > NEW.monthly_pts
    OR (monthly_pts = NEW.monthly_pts AND id < NEW.id);

  old_rank := OLD.last_known_rank;

  -- Update stored rank
  NEW.last_known_rank := new_rank;

  -- If no previous rank or rank changed, create notification
  IF old_rank IS NOT NULL AND old_rank != new_rank THEN
    direction := CASE WHEN new_rank < old_rank THEN 'up' ELSE 'down' END;
    player_name := NEW.name;

    INSERT INTO public.player_notifications (player_id, title, body, type, metadata)
    VALUES (
      NEW.id,
      CASE WHEN direction = 'up'
        THEN '🚀 You moved up to #' || new_rank || '!'
        ELSE '📉 You dropped to #' || new_rank
      END,
      CASE WHEN direction = 'up'
        THEN 'Great job! You climbed from #' || old_rank || ' to #' || new_rank || ' in the monthly rankings.'
        ELSE 'You moved from #' || old_rank || ' to #' || new_rank || ' in the monthly rankings. Keep playing to climb back!'
      END,
      'rank_change',
      jsonb_build_object('old_rank', old_rank, 'new_rank', new_rank, 'direction', direction)
    );
  END IF;

  RETURN NEW;
END;
$$;

-- Attach trigger to padel_players
CREATE TRIGGER trg_detect_rank_change
  BEFORE UPDATE ON public.padel_players
  FOR EACH ROW
  EXECUTE FUNCTION public.detect_rank_change();