import { createClient } from "@supabase/supabase-js";
import { env } from "./env";

/**
 * Production-Grade Secure Supabase Client
 * Uses the service_role key, bypassing Row Level Security (RLS) for internal server operations.
 * Highly secure as it runs purely on the server side.
 */
export const supabaseAdmin = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
);
