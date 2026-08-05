import { promises as fs } from "fs";
import path from "path";
import { VehicleReport } from "./types";

const DATA_DIR = path.join(process.cwd(), "data", "reports");

async function ensureDir() {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

export async function saveReportFile(report: VehicleReport): Promise<void> {
  await ensureDir();
  await fs.writeFile(
    path.join(DATA_DIR, `${report.id}.json`),
    JSON.stringify(report, null, 2),
    "utf-8",
  );
}

export async function getReportFile(id: string): Promise<VehicleReport | null> {
  if (!/^[a-zA-Z0-9_-]+$/.test(id)) return null;
  try {
    const raw = await fs.readFile(path.join(DATA_DIR, `${id}.json`), "utf-8");
    return JSON.parse(raw) as VehicleReport;
  } catch {
    return null;
  }
}

export async function updateReportFile(
  id: string,
  patch: Partial<VehicleReport>,
): Promise<VehicleReport | null> {
  const report = await getReportFile(id);
  if (!report) return null;
  const updated = { ...report, ...patch };
  await saveReportFile(updated);
  return updated;
}
