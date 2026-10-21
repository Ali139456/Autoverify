/**
 * Parse and optionally apply a Ravin sendEventReport JSON export.
 *
 *   npx tsx scripts/replay-ravin-event-report.mjs [path-to.json] [--apply] [--report AV-…]
 *
 * Default file: Report_sendEventReport_*10175*.json in repo root.
 * --apply writes damage + photos via Supabase (requires .env.local).
 */
import { readFileSync, readdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function loadEnvLocal() {
  try {
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
  } catch {
    /* optional */
  }
}

loadEnvLocal();

const args = process.argv.slice(2);
const apply = args.includes("--apply");
const reportFlag = args.indexOf("--report");
const reportOverride =
  reportFlag >= 0 ? args[reportFlag + 1]?.trim() : undefined;
const fileArg = args.find((a) => !a.startsWith("--") && a !== reportOverride);

function defaultJsonPath() {
  const matches = readdirSync(root).filter(
    (name) =>
      name.startsWith("Report_sendEventReport") && name.endsWith(".json"),
  );
  if (matches.length === 0) {
    throw new Error("No Report_sendEventReport*.json in repo root.");
  }
  return join(root, matches.sort().at(-1));
}

const jsonPath = fileArg ? join(process.cwd(), fileArg) : defaultJsonPath();
const raw = readFileSync(jsonPath, "utf8");
const payload = JSON.parse(raw);

const {
  parseRavinWebhookPayload,
  extractRavinPhotos,
  extractAutoVerifiReportIds,
} = await import("../src/lib/ravin-webhook.ts");

const reportIds = extractAutoVerifiReportIds(payload);
const reportId = reportOverride || reportIds[0];

const photos = extractRavinPhotos(payload);
const damage = parseRavinWebhookPayload(payload, photos.length);

const preview = {
  jsonPath,
  reportId: reportId ?? null,
  reportIdsFound: reportIds,
  walkaroundPhotos: photos.length,
  findingsCount: damage.findings.length,
  overallCondition: damage.overallCondition,
  totalRepairEstimate: damage.totalRepairEstimate,
  findings: damage.findings.map((f) => ({
    panel: f.panel,
    type: f.type,
    severity: f.severity,
    hasImage: Boolean(f.imageUrl),
    descriptionPreview: f.description?.slice(0, 100),
  })),
};

console.log(JSON.stringify(preview, null, 2));

if (!apply) {
  console.error("\nDry run only. Pass --apply to merge onto the inspection report.");
  process.exit(0);
}

if (!reportId) {
  console.error("No AV- report id in payload; pass --report AV-…");
  process.exit(1);
}

const { getInspectionByReportId } = await import("../src/lib/inspections.ts");
const { applyRavinWebhookPayload } = await import(
  "../src/lib/ravin-apply-webhook.ts"
);

const inspection = await getInspectionByReportId(reportId);
if (!inspection) {
  console.error(`No inspection session for report ${reportId}.`);
  process.exit(1);
}

const result = await applyRavinWebhookPayload(inspection, payload, {
  notifyCustomer: false,
});

console.log(
  JSON.stringify(
    { applied: true, reportId, inspectionId: inspection.id, ...result },
    null,
    2,
  ),
);
