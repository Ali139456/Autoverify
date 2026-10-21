import { NextRequest, NextResponse } from "next/server";
import { parseReportIdFromRouteParam } from "@/lib/ravin-report-trace";
import { syncStoredRavinWebhooksForReport } from "@/lib/ravin-sync-report";
import { getReport } from "@/lib/store";
import { guardRateLimit } from "@/lib/security";
import { createServerClient } from "@/lib/supabase/server";
import { isSupabaseServerConfigured } from "@/lib/supabase/server";

async function readReportWorkflowStatus(reportId: string): Promise<string | null> {
  if (!isSupabaseServerConfigured()) return null;
  const supabase = createServerClient();
  const { data } = await supabase
    .from("reports")
    .select("status")
    .eq("id", reportId)
    .maybeSingle();
  return typeof data?.status === "string" ? data.status : null;
}

/** Poll endpoint: replay stored Ravin webhooks and return current damage/workflow state. */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: rawId } = await params;
  const reportId = parseReportIdFromRouteParam(rawId);

  const rateLimited = guardRateLimit(
    req,
    `report-insights-sync:${reportId}`,
    120,
    60 * 60 * 1000,
  );
  if (rateLimited) return rateLimited;

  const report = await getReport(reportId);
  if (!report || report.status !== "paid") {
    return NextResponse.json({ error: "Report not found." }, { status: 404 });
  }

  const sync = report.damage
    ? { applied: false, findings: 0, reason: "already_complete" as const }
    : await syncStoredRavinWebhooksForReport(reportId);

  const fresh = (await getReport(reportId)) ?? report;
  const findings = fresh.damage?.findings.length ?? 0;

  return NextResponse.json({
    ok: true,
    reportId,
    workflowStatus: await readReportWorkflowStatus(reportId),
    hasDamage: Boolean(fresh.damage),
    findings,
    synced: sync.applied,
    syncReason: sync.reason ?? null,
  });
}
