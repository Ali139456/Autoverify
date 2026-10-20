import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
readFileSync(join(root, ".env.local"), "utf8")
  .split(/\r?\n/)
  .forEach((line) => {
    if (!line || line.startsWith("#") || !line.includes("=")) return;
    const i = line.indexOf("=");
    const k = line.slice(0, i).trim();
    let v = line.slice(i + 1).trim();
    if (
      (v.startsWith('"') && v.endsWith('"')) ||
      (v.startsWith("'") && v.endsWith("'"))
    ) {
      v = v.slice(1, -1);
    }
    if (!process.env[k]) process.env[k] = v;
  });

const reportId = process.argv[2]?.trim() || "AV-MVESZB76-4U7EPFLN";
const { createClient } = await import("@supabase/supabase-js");
const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

const { data: events } = await sb
  .from("ravin_webhook_events")
  .select("id, created_at, report_id, inspection_id, invitation_id")
  .order("created_at", { ascending: false })
  .limit(15);

const { data: report } = await sb
  .from("reports")
  .select("id, status, ravin_payload, damage")
  .eq("id", reportId)
  .maybeSingle();

const findings =
  report?.damage &&
  typeof report.damage === "object" &&
  Array.isArray(report.damage.findings)
    ? report.damage.findings.length
    : null;

console.log(
  JSON.stringify(
    {
      reportId,
      workflowStatus: report?.status ?? null,
      findingsCount: findings,
      hasReportRavinPayload: report?.ravin_payload != null,
      recentWebhookEvents: events,
      matchedForReport: (events ?? []).filter(
        (e) =>
          e.report_id === reportId ||
          e.invitation_id === reportId,
      ),
    },
    null,
    2,
  ),
);
