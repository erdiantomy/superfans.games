ALTER TABLE public.player_profiles
  ADD COLUMN IF NOT EXISTS location text DEFAULT '',
  ADD COLUMN IF NOT EXISTS padel_level text DEFAULT '',
  ADD COLUMN IF NOT EXISTS other_sports text DEFAULT '';