import { VehicleReport } from "./types";
import { isSupabaseServerConfigured } from "./supabase/server";
import {
  getReportFile,
  saveReportFile,
  updateReportFile,
} from "./store-file";
import {
  getReportSupabase,
  saveReportSupabase,
  updateReportSupabase,
} from "./store-supabase";

export async function saveReport(report: VehicleReport): Promise<void> {
  if (isSupabaseServerConfigured()) {
    await saveReportSupabase(report);
    return;
  }
  await saveReportFile(report);
}

export async function getReport(id: string): Promise<VehicleReport | null> {
  if (isSupabaseServerConfigured()) {
    const report = await getReportSupabase(id);
    if (report) return report;
  }
  return getReportFile(id);
}

export async function updateReport(
  id: string,
  patch: Partial<VehicleReport> & {
    workflowStatus?: string;
    ravin_payload?: unknown;
    customer_phone?: string | null;
  },
): Promise<VehicleReport | null> {
  if (isSupabaseServerConfigured()) {
    const report = await updateReportSupabase(id, patch);
    if (report) return report;
  }
  return updateReportFile(id, patch);
}

export function generateReportId(): string {
  const ts = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 10);
  return `AV-${ts}-${rand}`.toUpperCase().replace(/[^A-Z0-9-]/g, "");
}
