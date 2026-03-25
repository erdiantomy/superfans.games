
-- credit_packages table
CREATE TABLE IF NOT EXISTS public.credit_packages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  credits bigint NOT NULL,
  price_idr bigint NOT NULL,
  bonus_pct integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0
);

ALTER TABLE public.credit_packages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Credit packages are viewable by everyone"
  ON public.credit_packages FOR SELECT
  TO public USING (true);

-- Seed packages
INSERT INTO public.credit_packages (name, credits, price_idr, bonus_pct, sort_order) VALUES
  ('Starter', 50000, 50000, 0, 1),
  ('Regular', 110000, 100000, 10, 2),
  ('Pro', 250000, 200000, 25, 3),
  ('Elite', 600000, 500000, 20, 4);

-- payment_orders table
CREATE TABLE IF NOT EXISTS public.payment_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id uuid NOT NULL,
  package_id uuid REFERENCES public.credit_packages(id),
  credits_amount bigint NOT NULL DEFAULT 0,
  price_idr bigint NOT NULL DEFAULT 0,
  xendit_invoice_id text,
  xendit_invoice_url text,
  payment_channel text,
  status text NOT NULL DEFAULT 'pending',
  paid_at timestamptz,
  expired_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.payment_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own orders"
  ON public.payment_orders FOR SELECT
  TO authenticated USING (player_id = auth.uid());

CREATE POLICY "Users can insert their own orders"
  ON public.payment_orders FOR INSERT
  TO authenticated WITH CHECK (player_id = auth.uid());

-- Add payment_order_id to wallet_transactions if not exists
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'wallet_transactions' AND column_name = 'payment_order_id'
  ) THEN
    ALTER TABLE public.wallet_transactions ADD COLUMN payment_order_id uuid REFERENCES public.payment_orders(id);
  END IF;
END $$;

-- padel_players table
CREATE TABLE IF NOT EXISTS public.padel_players (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  name text NOT NULL DEFAULT '',
  avatar text NOT NULL DEFAULT '',
  credits bigint NOT NULL DEFAULT 0,
  monthly_pts integer NOT NULL DEFAULT 0,
  lifetime_xp integer NOT NULL DEFAULT 0,
  matches_played integer NOT NULL DEFAULT 0,
  matches_won integer NOT NULL DEFAULT 0,
  streak integer NOT NULL DEFAULT 0,
  division text NOT NULL DEFAULT 'rookie',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.padel_players ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Players are viewable by everyone"
  ON public.padel_players FOR SELECT
  TO public USING (true);

CREATE POLICY "Users can insert their own player"
  ON public.padel_players FOR INSERT
  TO authenticated WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own player"
  ON public.padel_players FOR UPDATE
  TO authenticated USING (user_id = auth.uid());
