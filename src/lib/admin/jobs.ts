import type { VehicleReport } from "@/lib/types";
import { resolveReportTier } from "@/lib/pricing";
import { createServerClient, isSupabaseServerConfigured } from "@/lib/supabase/server";
import { listPpiBookings } from "@/lib/pre-purchase/booking-store";
import type { LavBookingRecord } from "@/lib/lav/booking-store";
import { listLavBookings } from "@/lib/lav/booking-store";

export type AdminJobType =
  | "pre_purchase"
  | "lender_asset"
  | "insights"
  | "insights_plus";

export type AdminJobRow = {
  id: string;
  type: AdminJobType;
  typeLabel: string;
  status: string;
  customerName: string | null;
  customerEmail: string | null;
  customerPhone: string | null;
  vehicleSummary: string | null;
  amountAud: number | null;
  createdAt: string;
  href: string | null;
};

function reportTypeFromTier(tier: ReturnType<typeof resolveReportTier>): AdminJobType {
  return resolveReportTier(tier) === "insights_plus" ? "insights_plus" : "insights";
}

function typeLabel(type: AdminJobType): string {
  switch (type) {
    case "pre_purchase":
      return "Pre-purchase";
    case "lender_asset":
      return "Lender asset";
    case "insights":
      return "Insights";
    case "insights_plus":
      return "Insights+";
    default:
      return type;
  }
}

function vehicleSummaryFromReport(report: VehicleReport | null): string | null {
  if (!report?.vehicle) return null;
  const { rego, state, make, model, year } = report.vehicle;
  const bits = [
    rego && state ? `${rego} ${state}` : rego,
    [year, make, model].filter(Boolean).join(" "),
  ].filter(Boolean);
  return bits.length ? bits.join(" · ") : null;
}

async function listReportJobs(limit = 250): Promise<AdminJobRow[]> {
  if (!isSupabaseServerConfigured()) return [];
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("reports")
    .select("id, status, customer_email, customer_phone, rego, state, stripe_session_id, created_at, history_data")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);

  const rows: AdminJobRow[] = [];
  for (const raw of data ?? []) {
    const row = raw as {
      id: string;
      status: string;
      customer_email: string | null;
      customer_phone: string | null;
      stripe_session_id: string | null;
      created_at: string;
      history_data: VehicleReport | null;
    };

    if (row.status === "pending_payment" && !row.stripe_session_id) {
      continue;
    }

    const history = row.history_data;
    const tier = resolveReportTier(history?.tier);
    const type = reportTypeFromTier(tier);

    rows.push({
      id: row.id,
      type,
      typeLabel: typeLabel(type),
      status: row.status,
      customerName: null,
      customerEmail: row.customer_email ?? history?.customerEmail ?? null,
      customerPhone: row.customer_phone ?? history?.customerPhone ?? null,
      vehicleSummary: vehicleSummaryFromReport(history),
      amountAud: null,
      createdAt: row.created_at,
      href: `/report/${encodeURIComponent(row.id)}`,
    });
  }

  return rows;
}

function lavToJob(record: LavBookingRecord): AdminJobRow {
  const p = record.payload;
  const firstAsset = p.assets?.[0];
  const vehicle =
    firstAsset?.rego && firstAsset?.regoState
      ? `${firstAsset.rego} ${firstAsset.regoState}`
      : firstAsset?.identifier ?? null;

  return {
    id: record.bookingRef,
    type: "lender_asset",
    typeLabel: typeLabel("lender_asset"),
    status: record.status,
    customerName: p.contactName ?? null,
    customerEmail: p.contactEmail ?? null,
    customerPhone: p.contactPhone ?? null,
    vehicleSummary: vehicle,
    amountAud: p.estimate > 0 ? p.estimate : null,
    createdAt: record.createdAt,
    href: record.assetReportIds[0]
      ? `/report/${encodeURIComponent(record.assetReportIds[0])}`
      : null,
  };
}

function ppiToJob(record: Awaited<ReturnType<typeof listPpiBookings>>[number]): AdminJobRow {
  const p = record.payload;
  return {
    id: record.bookingRef,
    type: "pre_purchase",
    typeLabel: typeLabel("pre_purchase"),
    status: record.status,
    customerName: p.contactName,
    customerEmail: p.contactEmail,
    customerPhone: p.contactPhone,
    vehicleSummary:
      [p.vehicleRego, p.vehicleState].filter(Boolean).join(" ") ||
      [p.vehicleYear, p.vehicleMake, p.vehicleModel].filter(Boolean).join(" "),
    amountAud: p.priceIncGst,
    createdAt: record.createdAt,
    href: null,
  };
}

export async function listAdminJobs(): Promise<{
  jobs: AdminJobRow[];
  configured: boolean;
}> {
  if (!isSupabaseServerConfigured()) {
    return { jobs: [], configured: false };
  }

  const [reports, lav, ppi] = await Promise.all([
    listReportJobs(),
    listLavBookings(),
    listPpiBookings(),
  ]);

  const jobs = [
    ...reports,
    ...lav.map(lavToJob),
    ...ppi.map(ppiToJob),
  ].sort(
    (a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt),
  );

  return { jobs, configured: true };
}