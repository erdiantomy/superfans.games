// Tom's Arena — Supabase Client
// Project: toms-arena (qsgwtjcrgedjbjsbibxr)
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
  ?? "https://qsgwtjcrgedjbjsbibxr.supabase.co";

const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
  ?? import.meta.env.VITE_SUPABASE_ANON_KEY
  ?? "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFzZ3d0amNyZ2VkamJqc2JpYnhyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQxOTA0NTEsImV4cCI6MjA4OTc2NjQ1MX0.oaEAJWTGxH5awf2S-NAS3c8x13fm9Xe4Im--5jHLXfE";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  },
  realtime: {
    params: { eventsPerSecond: 10 },
  },
});
