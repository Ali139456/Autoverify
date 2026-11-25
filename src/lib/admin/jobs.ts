import type { ReportTier, VehicleIdentity } from "@/lib/types";
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

function vehicleSummaryFromParts(
  vehicle: VehicleIdentity | null | undefined,
  rego: string | null,
  state: string | null,
): string | null {
  const regoLine =
    vehicle?.rego && vehicle.state
      ? `${vehicle.rego} ${vehicle.state}`
      : vehicle?.rego ?? (rego ? [rego, state].filter(Boolean).join(" ") : null);
  const ymm = vehicle
    ? [vehicle.year, vehicle.make, vehicle.model].filter(Boolean).join(" ")
    : null;
  const bits = [regoLine, ymm].filter(Boolean);
  return bits.length ? bits.join(" · ") : null;
}

type ReportListRow = {
  id: string;
  status: string;
  customer_email: string | null;
  customer_phone: string | null;
  rego: string | null;
  state: string | null;
  stripe_session_id: string | null;
  created_at: string;
  tier?: ReportTier | string | null;
  hist_email?: string | null;
  hist_phone?: string | null;
  vehicle?: VehicleIdentity | null;
};

const REPORT_LIST_SELECT =
  "id, status, customer_email, customer_phone, rego, state, stripe_session_id, created_at, tier:history_data->tier, hist_email:history_data->customerEmail, hist_phone:history_data->customerPhone, vehicle:history_data->vehicle";

async function listReportJobs(limit = 250): Promise<AdminJobRow[]> {
  if (!isSupabaseServerConfigured()) return [];
  const supabase = createServerClient();
  let data: ReportListRow[] | null = null;

  const slim = await supabase
    .from("reports")
    .select(REPORT_LIST_SELECT)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (!slim.error) {
    data = (slim.data ?? []) as ReportListRow[];
  } else {
    const full = await supabase
      .from("reports")
      .select(
        "id, status, customer_email, customer_phone, rego, state, stripe_session_id, created_at, history_data",
      )
      .order("created_at", { ascending: false })
      .limit(limit);
    if (full.error) throw new Error(full.error.message);
    data = (full.data ?? []).map((raw) => {
      const row = raw as {
        history_data: { tier?: ReportTier; customerEmail?: string; customerPhone?: string; vehicle?: VehicleIdentity } | null;
      } & Omit<ReportListRow, "tier" | "hist_email" | "hist_phone" | "vehicle">;
      return {
        ...row,
        tier: row.history_data?.tier ?? null,
        hist_email: row.history_data?.customerEmail ?? null,
        hist_phone: row.history_data?.customerPhone ?? null,
        vehicle: row.history_data?.vehicle ?? null,
      };
    });
  }

  const rows: AdminJobRow[] = [];
  for (const row of data ?? []) {
    if (row.status === "pending_payment" && !row.stripe_session_id) {
      continue;
    }

    const tier = resolveReportTier(row.tier as ReportTier | undefined);
    const type = reportTypeFromTier(tier);

    rows.push({
      id: row.id,
      type,
      typeLabel: typeLabel(type),
      status: row.status,
      customerName: null,
      customerEmail: row.customer_email ?? row.hist_email ?? null,
      customerPhone: row.customer_phone ?? row.hist_phone ?? null,
      vehicleSummary: vehicleSummaryFromParts(row.vehicle, row.rego, row.state),
      amountAud: null,
      createdAt: row.created_at,
      href: `/report/${encodeURIComponent(row.id)}`,
    });
  }

  return rows;
}

function lavToJob(record: LavBookingRecord): AdminJobRow | null {
  const p = record.payload;
  if (!p?.bookingRef) return null;
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

function ppiToJob(record: Awaited<ReturnType<typeof listPpiBookings>>[number]): AdminJobRow | null {
  const p = record.payload;
  if (!p?.bookingRef) return null;
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

async function settleList<T>(
  label: string,
  run: () => Promise<T[]>,
  warnings: string[],
): Promise<T[]> {
  try {
    return await run();
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[admin/jobs] ${label} failed:`, err);
    warnings.push(`${label}: ${message}`);
    return [];
  }
}

export async function listAdminJobs(): Promise<{
  jobs: AdminJobRow[];
  configured: boolean;
  warnings?: string[];
}> {
  if (!isSupabaseServerConfigured()) {
    return { jobs: [], configured: false };
  }

  const warnings: string[] = [];
  const [reports, lav, ppi] = await Promise.all([
    settleList("reports", () => listReportJobs(), warnings),
    settleList("lender asset", () => listLavBookings(), warnings),
    settleList("pre-purchase", () => listPpiBookings(), warnings),
  ]);

  const jobs = [
    ...reports,
    ...lav.map(lavToJob).filter((row): row is AdminJobRow => row !== null),
    ...ppi.map(ppiToJob).filter((row): row is AdminJobRow => row !== null),
  ].sort(
    (a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt),
  );

  if (jobs.length === 0 && warnings.length > 0) {
    throw new Error(warnings.join("; "));
  }

  return { jobs, configured: true, warnings: warnings.length ? warnings : undefined };
}