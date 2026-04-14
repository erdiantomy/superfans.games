
-- 1. Quest definitions (static, seeded)
CREATE TABLE IF NOT EXISTS public.quest_definitions (
  id           text PRIMARY KEY,
  title        text NOT NULL,
  description  text NOT NULL,
  cadence      text NOT NULL,
  reward_type  text NOT NULL,
  reward_value integer NOT NULL DEFAULT 0,
  reward_badge text,
  target_count integer NOT NULL DEFAULT 1,
  action_type  text NOT NULL,
  active       boolean NOT NULL DEFAULT true
);

ALTER TABLE public.quest_definitions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Quest definitions are public"
  ON public.quest_definitions FOR SELECT TO public USING (true);

-- 2. Player quest progress
CREATE TABLE IF NOT EXISTS public.player_quests (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id       uuid NOT NULL REFERENCES public.padel_players(id) ON DELETE CASCADE,
  quest_id        text NOT NULL REFERENCES public.quest_definitions(id),
  period_key      text NOT NULL,
  progress        integer NOT NULL DEFAULT 0,
  completed       boolean NOT NULL DEFAULT false,
  completed_at    timestamptz,
  reward_claimed  boolean NOT NULL DEFAULT false,
  created_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE(player_id, quest_id, period_key)
);

ALTER TABLE public.player_quests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Players see own quests"
  ON public.player_quests FOR SELECT TO authenticated
  USING (player_id IN (SELECT id FROM padel_players WHERE user_id = auth.uid()));

CREATE POLICY "Players update own quests"
  ON public.player_quests FOR ALL TO authenticated
  USING (player_id IN (SELECT id FROM padel_players WHERE user_id = auth.uid()))
  WITH CHECK (player_id IN (SELECT id FROM padel_players WHERE user_id = auth.uid()));

-- 3. Badge awards
CREATE TABLE IF NOT EXISTS public.player_badges (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id   uuid NOT NULL REFERENCES public.padel_players(id) ON DELETE CASCADE,
  badge_id    text NOT NULL,
  label       text NOT NULL,
  icon        text NOT NULL,
  earned_at   timestamptz NOT NULL DEFAULT now(),
  UNIQUE(player_id, badge_id)
);

ALTER TABLE public.player_badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Badges are public"
  ON public.player_badges FOR SELECT TO public USING (true);

CREATE POLICY "System inserts badges"
  ON public.player_badges FOR INSERT TO authenticated WITH CHECK (true);

-- 4. Backer reputation on padel_players
ALTER TABLE public.padel_players
  ADD COLUMN IF NOT EXISTS backs_total    integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS backs_correct  integer NOT NULL DEFAULT 0;

-- 5. Seed quest definitions
INSERT INTO public.quest_definitions VALUES
  ('daily_play',    'Play Today',            'Join any session today',                  'daily',   'xp',      25,  null,              1, 'play_session'),
  ('daily_back',    'Back a Player',         'Support a player in a live match',        'daily',   'credits', 10,  null,              1, 'back_player'),
  ('weekly_3play',  'Active Player',         'Complete 3 sessions this week',           'weekly',  'xp',      150, 'active_player',   3, 'complete_sessions'),
  ('weekly_3back',  'Fan Supporter',         'Back 3 different players this week',      'weekly',  'credits', 50,  null,              3, 'back_player'),
  ('monthly_venues','Explorer',              'Play at 2 or more venues this month',     'monthly', 'xp',      200, 'explorer',        2, 'play_venues'),
  ('monthly_top10', 'Contender',             'Reach top 10 in monthly rankings',        'monthly', 'xp',      300, 'contender',       1, 'top10_rank'),
  ('host_first',    'First Session',         'Host your first session',                 'monthly', 'xp',      100, 'first_host',      1, 'host_session'),
  ('weekly_host',   'Community Builder',     'Host a session this week',                'weekly',  'xp',      100, null,              1, 'host_session')
ON CONFLICT (id) DO NOTHING;

-- 6. Host tier function
CREATE OR REPLACE FUNCTION public.get_host_tier(hosting_xp integer)
RETURNS text LANGUAGE sql IMMUTABLE AS $$
  SELECT CASE
    WHEN hosting_xp >= 2000 THEN 'Pro Host'
    WHEN hosting_xp >= 500  THEN 'Active Host'
    ELSE 'Rookie Host'
  END;
$$;

-- 7. Backer reputation trigger
CREATE OR REPLACE FUNCTION public.update_backer_reputation()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER
SET search_path TO 'public' AS $$
BEGIN
  UPDATE public.padel_players
    SET backs_total = backs_total + 1,
        backs_correct = backs_correct + (
          CASE WHEN NEW.payout > 0 THEN 1 ELSE 0 END
        )
    WHERE id = NEW.supporter_id;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_support_resolved
  AFTER UPDATE OF resolved ON public.session_supports
  FOR EACH ROW
  WHEN (NEW.resolved = true AND OLD.resolved = false)
  EXECUTE FUNCTION public.update_backer_reputation();
