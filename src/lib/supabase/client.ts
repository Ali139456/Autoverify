import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

/** Browser-safe Supabase client (publishable key only). */
export function createBrowserClient() {
  if (!url || !publishableKey) {
    throw new Error("Supabase is not configured.");
  }

  return createClient(url, publishableKey);
}

export function isSupabaseConfigured(): boolean {
  return Boolean(url && publishableKey);
}
