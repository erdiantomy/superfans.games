CREATE TABLE public.chat_assistant_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  page_route text NOT NULL DEFAULT '/',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.chat_assistant_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own usage"
  ON public.chat_assistant_usage FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Service role can insert usage"
  ON public.chat_assistant_usage FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE INDEX idx_chat_usage_user_created ON public.chat_assistant_usage (user_id, created_at);