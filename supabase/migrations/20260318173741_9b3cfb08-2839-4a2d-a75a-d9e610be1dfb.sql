
-- ==========================================
-- 1. PROFILES TABLE
-- ==========================================
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL DEFAULT '',
  display_name TEXT NOT NULL DEFAULT '',
  avatar_url TEXT,
  points INTEGER NOT NULL DEFAULT 0,
  rank INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ==========================================
-- 2. MATCHES TABLE
-- ==========================================
CREATE TYPE public.match_status AS ENUM ('live', 'upcoming', 'finished');

CREATE TABLE public.matches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  player_a_name TEXT NOT NULL,
  player_a_avatar TEXT NOT NULL DEFAULT 'PA',
  player_a_sport TEXT NOT NULL DEFAULT 'Padel',
  player_a_tier TEXT NOT NULL DEFAULT 'Pro',
  player_a_win_rate INTEGER NOT NULL DEFAULT 50,
  player_b_name TEXT NOT NULL,
  player_b_avatar TEXT NOT NULL DEFAULT 'PB',
  player_b_sport TEXT NOT NULL DEFAULT 'Padel',
  player_b_tier TEXT NOT NULL DEFAULT 'Pro',
  player_b_win_rate INTEGER NOT NULL DEFAULT 50,
  status match_status NOT NULL DEFAULT 'upcoming',
  score_a INTEGER NOT NULL DEFAULT 0,
  score_b INTEGER NOT NULL DEFAULT 0,
  pool BIGINT NOT NULL DEFAULT 0,
  support_a INTEGER NOT NULL DEFAULT 50,
  support_b INTEGER NOT NULL DEFAULT 50,
  fans INTEGER NOT NULL DEFAULT 0,
  winner TEXT, -- 'a' or 'b'
  starts_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Matches are viewable by everyone" ON public.matches FOR SELECT USING (true);

-- ==========================================
-- 3. SUPPORTS TABLE (user votes/supports)
-- ==========================================
CREATE TABLE public.supports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  match_id UUID NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
  player TEXT NOT NULL CHECK (player IN ('a', 'b')),
  amount BIGINT NOT NULL DEFAULT 0,
  points_earned INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, match_id)
);

ALTER TABLE public.supports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own supports" ON public.supports FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own supports" ON public.supports FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ==========================================
-- 4. WALLET TRANSACTIONS TABLE
-- ==========================================
CREATE TYPE public.tx_type AS ENUM ('support', 'reward', 'topup', 'redeem', 'bonus');

CREATE TABLE public.wallet_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type tx_type NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  idr_amount BIGINT NOT NULL DEFAULT 0,
  sp_amount INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own transactions" ON public.wallet_transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own transactions" ON public.wallet_transactions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ==========================================
-- 5. LEADERBOARD VIEW
-- ==========================================
CREATE VIEW public.leaderboard AS
SELECT 
  p.user_id,
  p.username,
  p.avatar_url,
  p.points,
  COUNT(s.id) AS total_supports,
  ROW_NUMBER() OVER (ORDER BY p.points DESC) AS rank
FROM public.profiles p
LEFT JOIN public.supports s ON s.user_id = p.user_id
GROUP BY p.user_id, p.username, p.avatar_url, p.points
ORDER BY p.points DESC;

-- ==========================================
-- 6. AUTO-CREATE PROFILE ON SIGNUP
-- ==========================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, username, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==========================================
-- 7. UPDATED_AT TRIGGER
-- ==========================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_matches_updated_at BEFORE UPDATE ON public.matches FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
