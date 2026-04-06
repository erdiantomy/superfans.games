-- Chat assistant usage tracking for rate limiting
CREATE TABLE IF NOT EXISTS chat_assistant_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  page_route TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for efficient querying
CREATE INDEX idx_chat_assistant_usage_user_created
  ON chat_assistant_usage (user_id, created_at DESC);

CREATE INDEX idx_chat_assistant_usage_route_created
  ON chat_assistant_usage (page_route, created_at DESC);

-- Enable RLS
ALTER TABLE chat_assistant_usage ENABLE ROW LEVEL SECURITY;

-- Users can read their own usage
CREATE POLICY "Users can view own chat usage"
  ON chat_assistant_usage
  FOR SELECT
  USING (auth.uid() = user_id);

-- Only service role can insert (edge function uses service role key)
CREATE POLICY "Service role can insert chat usage"
  ON chat_assistant_usage
  FOR INSERT
  WITH CHECK (true);
