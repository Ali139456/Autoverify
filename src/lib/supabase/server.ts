import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

/** Server-only Supabase client (bypasses RLS). Never expose this key to the browser. */
export function createServerClient() {
  if (!url || !serviceRoleKey) {
    throw new Error("Supabase server client is not configured.");
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export function isSupabaseServerConfigured(): boolean {
  return Boolean(url && serviceRoleKey);
}
