
CREATE OR REPLACE FUNCTION public.get_host_tier(hosting_xp integer)
RETURNS text LANGUAGE sql IMMUTABLE
SET search_path TO 'public' AS $$
  SELECT CASE
    WHEN hosting_xp >= 2000 THEN 'Pro Host'
    WHEN hosting_xp >= 500  THEN 'Active Host'
    ELSE 'Rookie Host'
  END;
$$;
