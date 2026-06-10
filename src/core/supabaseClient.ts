import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { env } from "./env";

let clientInstance: SupabaseClient | null = null;

function getClient(): SupabaseClient {
  if (!clientInstance) {
    clientInstance = createClient(
      env.NEXT_PUBLIC_SUPABASE_URL,
      env.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      }
    );
  }
  return clientInstance;
}

/**
 * Production-Grade Secure Supabase Client Proxy
 * Lazily initializes the client on the first property access, bypassing boot-time errors.
 * Uses the service_role key, bypassing Row Level Security (RLS) for internal server operations.
 */
export const supabaseAdmin = new Proxy({} as SupabaseClient, {
  get(target, prop, receiver) {
    const client = getClient();
    const value = Reflect.get(client, prop, receiver);
    if (typeof value === "function") {
      return value.bind(client);
    }
    return value;
  },
});

