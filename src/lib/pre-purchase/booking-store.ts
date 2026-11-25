import { createServerClient, isSupabaseServerConfigured } from "@/lib/supabase/server";
import type { PrePurchaseBookingPayload } from "./types";

export type PpiBookingStatus = "pending_payment" | "paid" | "invoiced";

export type PpiBookingRecord = {
  bookingRef: string;
  status: PpiBookingStatus;
  payload: PrePurchaseBookingPayload;
  stripeSessionId: string | null;
  createdAt: string;
  updatedAt: string;
};

type PpiBookingRow = {
  booking_ref: string;
  status: PpiBookingStatus;
  payload: PrePurchaseBookingPayload;
  stripe_session_id: string | null;
  created_at: string;
  updated_at: string;
};

function rowToRecord(row: PpiBookingRow): PpiBookingRecord {
  return {
    bookingRef: row.booking_ref,
    status: row.status,
    payload: row.payload,
    stripeSessionId: row.stripe_session_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function isPpiBookingStoreConfigured(): boolean {
  return isSupabaseServerConfigured();
}

export async function savePpiBooking(
  payload: PrePurchaseBookingPayload,
  status: PpiBookingStatus = "pending_payment",
  stripeSessionId: string | null = null,
): Promise<PpiBookingRecord | null> {
  if (!isSupabaseServerConfigured()) return null;
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("ppi_bookings")
    .upsert({
      booking_ref: payload.bookingRef,
      status,
      payload,
      stripe_session_id: stripeSessionId,
    })
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return rowToRecord(data as PpiBookingRow);
}

export async function updatePpiBooking(
  bookingRef: string,
  patch: Partial<{
    status: PpiBookingStatus;
    stripeSessionId: string | null;
    payload: PrePurchaseBookingPayload;
  }>,
): Promise<PpiBookingRecord | null> {
  if (!isSupabaseServerConfigured()) return null;
  const row: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };
  if (patch.status) row.status = patch.status;
  if (patch.stripeSessionId !== undefined) {
    row.stripe_session_id = patch.stripeSessionId;
  }
  if (patch.payload) row.payload = patch.payload;

  const supabase = createServerClient();
  const { error } = await supabase
    .from("ppi_bookings")
    .update(row)
    .eq("booking_ref", bookingRef);

  if (error) throw new Error(error.message);

  const { data, error: readError } = await supabase
    .from("ppi_bookings")
    .select("*")
    .eq("booking_ref", bookingRef)
    .maybeSingle();

  if (readError) throw new Error(readError.message);
  if (!data) return null;
  return rowToRecord(data as PpiBookingRow);
}

export async function listPpiBookings(limit = 200): Promise<PpiBookingRecord[]> {
  if (!isSupabaseServerConfigured()) return [];
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("ppi_bookings")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => rowToRecord(row as PpiBookingRow));
}