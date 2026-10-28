import { randomBytes } from "crypto";
import { createServerClient, isSupabaseServerConfigured } from "@/lib/supabase/server";

/** Display format for sequential LAV bookings (see `next_lav_booking_ref` in Supabase). */
export function formatLavBookingRef(sequence: number): string {
  return `AV-LAV-${String(sequence).padStart(6, "0")}`;
}

/** When Supabase is unavailable (email-only fallback). Not sequential across instances. */
export function allocateLavBookingRefFallback(): string {
  const d = new Date();
  const ymd = [
    d.getUTCFullYear(),
    String(d.getUTCMonth() + 1).padStart(2, "0"),
    String(d.getUTCDate()).padStart(2, "0"),
  ].join("");
  const suffix = randomBytes(3).toString("hex").toUpperCase();
  return `AV-LAV-${ymd}-${suffix}`;
}

/** Server-assigned booking reference (requires migration 006 in Supabase). */
export async function allocateLavBookingRef(): Promise<string> {
  if (!isSupabaseServerConfigured()) {
    return allocateLavBookingRefFallback();
  }

  const supabase = createServerClient();
  const { data, error } = await supabase.rpc("next_lav_booking_ref");
  if (error) {
    console.error("[lav] next_lav_booking_ref failed:", error.message);
    throw new Error("Could not allocate a booking reference.");
  }

  const ref = typeof data === "string" ? data.trim() : "";
  if (!/^AV-LAV-\d{6}$/.test(ref)) {
    throw new Error("Invalid booking reference from database.");
  }
  return ref;
}
