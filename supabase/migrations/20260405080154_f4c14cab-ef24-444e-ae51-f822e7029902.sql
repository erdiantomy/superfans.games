
CREATE OR REPLACE FUNCTION public.credit_player_balance(p_player_id uuid, p_credits bigint)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE public.padel_players
  SET credits = credits + p_credits
  WHERE id = p_player_id;
END;
$$;
