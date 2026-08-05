import { VehicleReport } from "./types";
import { createServerClient } from "./supabase/server";

type ReportRow = {
  id: string;
  status: string;
  rego: string | null;
  state: string | null;
  vin: string | null;
  customer_phone: string | null;
  customer_email: string | null;
  history_data: VehicleReport | null;
  damage_data: VehicleReport["damage"];
  ravin_payload: unknown;
  stripe_session_id: string | null;
  created_at: string;
  updated_at: string;
};

function rowToReport(row: ReportRow): VehicleReport {
  const base = row.history_data;
  if (!base) {
    throw new Error(`Report ${row.id} is missing history_data.`);
  }

  const paidStatuses = new Set([
    "paid",
    "history_ready",
    "awaiting_inspection",
    "processing_ravin",
    "complete",
  ]);

  return {
    ...base,
    id: row.id,
    createdAt: base.createdAt ?? row.created_at,
    status: paidStatuses.has(row.status) ? "paid" : "pending_payment",
    stripeSessionId: row.stripe_session_id ?? base.stripeSessionId,
    damage: row.damage_data ?? base.damage ?? null,
  };
}

function reportToRow(report: VehicleReport) {
  return {
    id: report.id,
    status: report.status,
    rego: report.vehicle.rego,
    state: report.vehicle.state,
    vin: report.vehicle.vin,
    history_data: report,
    damage_data: report.damage,
    stripe_session_id: report.stripeSessionId,
  };
}

export async function saveReportSupabase(report: VehicleReport): Promise<void> {
  const supabase = createServerClient();
  const { error } = await supabase.from("reports").upsert(reportToRow(report));
  if (error) throw new Error(error.message);
}

export async function getReportSupabase(id: string): Promise<VehicleReport | null> {
  if (!/^[a-zA-Z0-9_-]+$/.test(id)) return null;
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("reports")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return null;
  return rowToReport(data as ReportRow);
}

export async function updateReportSupabase(
  id: string,
  patch: Partial<VehicleReport> & {
    workflowStatus?: string;
    ravin_payload?: unknown;
    customer_phone?: string | null;
  },
): Promise<VehicleReport | null> {
  const report = await getReportSupabase(id);
  if (!report) return null;

  const updated: VehicleReport = { ...report, ...patch };
  const supabase = createServerClient();

  const row: Record<string, unknown> = {
    ...reportToRow(updated),
    updated_at: new Date().toISOString(),
  };

  if (patch.workflowStatus) row.status = patch.workflowStatus;
  if (patch.ravin_payload !== undefined) row.ravin_payload = patch.ravin_payload;
  if (patch.customer_phone !== undefined) row.customer_phone = patch.customer_phone;

  const { error } = await supabase.from("reports").update(row).eq("id", id);
  if (error) throw new Error(error.message);
  return getReportSupabase(id);
}

export async function updateReportWorkflowStatus(
  id: string,
  workflowStatus: string,
): Promise<void> {
  const supabase = createServerClient();
  const { error } = await supabase
    .from("reports")
    .update({ status: workflowStatus, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw new Error(error.message);
}

export async function saveRavinWebhookEvent(input: {
  reportId?: string | null;
  inspectionId?: string | null;
  invitationId?: string | null;
  payload: unknown;
}): Promise<void> {
  const supabase = createServerClient();
  const { error } = await supabase.from("ravin_webhook_events").insert({
    report_id: input.reportId ?? null,
    inspection_id: input.inspectionId ?? null,
    invitation_id: input.invitationId ?? null,
    payload: input.payload,
  });
  if (error) throw new Error(error.message);
}
