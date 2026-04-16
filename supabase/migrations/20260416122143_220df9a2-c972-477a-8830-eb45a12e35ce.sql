DROP VIEW IF EXISTS public.player_profile_full;
CREATE VIEW public.player_profile_full AS
SELECT
  pp.id AS profile_id,
  pp.player_id,
  pp.slug,
  pp.display_name,
  pp.bio,
  pp.avatar_url,
  pp.social_links,
  pp.is_public,
  pp.created_at AS profile_created_at,
  pp.location,
  pp.padel_level,
  pp.other_sports,
  p.division,
  p.lifetime_xp,
  p.monthly_pts,
  p.matches_played AS games_played,
  p.matches_won AS wins,
  (p.matches_played - p.matches_won) AS losses,
  p.streak,
  CASE WHEN p.matches_played > 0 THEN ROUND((p.matches_won::numeric / p.matches_played) * 100) ELSE 0 END AS win_rate,
  COALESCE(ds.total_raised, 0) AS total_raised,
  COALESCE(ds.total_donations, 0) AS total_donations,
  COALESCE(ds.supporter_count, 0) AS supporter_count
FROM public.player_profiles pp
JOIN public.padel_players p ON p.id = pp.player_id
LEFT JOIN public.donation_stats ds ON ds.player_id = pp.player_id;