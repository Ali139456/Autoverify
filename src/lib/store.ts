import { promises as fs } from "fs";
import path from "path";
import { VehicleReport } from "./types";

/**
 * Simple file-based store so reports survive server restarts without
 * requiring a database. Swap for a real DB (e.g. Postgres/MySQL on
 * SiteGround) by re-implementing these four functions.
 */
const DATA_DIR = path.join(process.cwd(), "data", "reports");

async function ensureDir() {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

export async function saveReport(report: VehicleReport): Promise<void> {
  await ensureDir();
  await fs.writeFile(
    path.join(DATA_DIR, `${report.id}.json`),
    JSON.stringify(report, null, 2),
    "utf-8"
  );
}

export async function getReport(id: string): Promise<VehicleReport | null> {
  // Guard against path traversal in the id
  if (!/^[a-zA-Z0-9_-]+$/.test(id)) return null;
  try {
    const raw = await fs.readFile(path.join(DATA_DIR, `${id}.json`), "utf-8");
    return JSON.parse(raw) as VehicleReport;
  } catch {
    return null;
  }
}

export async function updateReport(
  id: string,
  patch: Partial<VehicleReport>
): Promise<VehicleReport | null> {
  const report = await getReport(id);
  if (!report) return null;
  const updated = { ...report, ...patch };
  await saveReport(updated);
  return updated;
}

export function generateReportId(): string {
  const ts = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 10);
  return `AV-${ts}-${rand}`.toUpperCase().replace(/[^A-Z0-9-]/g, "");
}
