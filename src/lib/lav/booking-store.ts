import { createServerClient, isSupabaseServerConfigured } from "@/lib/supabase/server";
import type {
  LavBookingPayload,
  LavBookingStatus,
  LavFulfillmentResult,
} from "./types";

export type LavBookingRecord = {
  bookingRef: string;
  status: LavBookingStatus;
  payload: LavBookingPayload;
  stripeSessionId: string | null;
  assetReportIds: string[];
  fulfillment: LavFulfillmentResult | null;
  createdAt: string;
  updatedAt: string;
};

type LavBookingRow = {
  booking_ref: string;
  status: LavBookingStatus;
  payload: LavBookingPayload;
  stripe_session_id: string | null;
  asset_report_ids: string[] | null;
  fulfillment: LavFulfillmentResult | null;
  created_at: string;
  updated_at: string;
};

function rowToRecord(row: LavBookingRow): LavBookingRecord {
  return {
    bookingRef: row.booking_ref,
    status: row.status,
    payload: row.payload,
    stripeSessionId: row.stripe_session_id,
    assetReportIds: row.asset_report_ids ?? [],
    fulfillment: row.fulfillment,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function isLavBookingStoreConfigured(): boolean {
  return isSupabaseServerConfigured();
}

export async function saveLavBooking(
  payload: LavBookingPayload,
  status: LavBookingStatus = "pending_payment",
): Promise<LavBookingRecord> {
  if (!isSupabaseServerConfigured()) {
    throw new Error("LAV bookings require Supabase.");
  }
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("lav_bookings")
    .upsert({
      booking_ref: payload.bookingRef,
      status,
      payload,
      stripe_session_id: null,
      asset_report_ids: [],
      fulfillment: null,
    })
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return rowToRecord(data as LavBookingRow);
}

export async function getLavBookingByRef(
  bookingRef: string,
): Promise<LavBookingRecord | null> {
  if (!isSupabaseServerConfigured()) return null;
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("lav_bookings")
    .select("*")
    .eq("booking_ref", bookingRef)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return null;
  return rowToRecord(data as LavBookingRow);
}

export async function getLavBookingByStripeSession(
  sessionId: string,
): Promise<LavBookingRecord | null> {
  if (!isSupabaseServerConfigured()) return null;
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("lav_bookings")
    .select("*")
    .eq("stripe_session_id", sessionId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return null;
  return rowToRecord(data as LavBookingRow);
}

export async function updateLavBooking(
  bookingRef: string,
  patch: Partial<{
    status: LavBookingStatus;
    stripeSessionId: string | null;
    assetReportIds: string[];
    fulfillment: LavFulfillmentResult | null;
  }>,
): Promise<LavBookingRecord | null> {
  if (!isSupabaseServerConfigured()) return null;
  const row: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };
  if (patch.status) row.status = patch.status;
  if (patch.stripeSessionId !== undefined) {
    row.stripe_session_id = patch.stripeSessionId;
  }
  if (patch.assetReportIds) row.asset_report_ids = patch.assetReportIds;
  if (patch.fulfillment !== undefined) row.fulfillment = patch.fulfillment;

  const supabase = createServerClient();
  const { error } = await supabase
    .from("lav_bookings")
    .update(row)
    .eq("booking_ref", bookingRef);

  if (error) throw new Error(error.message);
  return getLavBookingByRef(bookingRef);
}
