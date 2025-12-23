import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

const FALLBACK_SUPABASE_URL = "https://zydbiezwlxoqckfexhqr.supabase.co";
const FALLBACK_SUPABASE_PUBLISHABLE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp5ZGJpZXp3bHhvcWNrZmV4aHFyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYyNzQ5OTMsImV4cCI6MjA4MTg1MDk5M30.STd9dTsX54pnpUQHxq5m15DgdqKuuVcQJWQM_wk4bs8";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || FALLBACK_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || FALLBACK_SUPABASE_PUBLISHABLE_KEY;

if (!import.meta.env.VITE_SUPABASE_URL) {
  console.warn("VITE_SUPABASE_URL missing at runtime; using fallback URL.");
}
if (!import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY) {
  console.warn(
    "VITE_SUPABASE_PUBLISHABLE_KEY missing at runtime; using fallback publishable key."
  );
}

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  },
});
