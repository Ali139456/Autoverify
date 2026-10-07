import { DamageAnalysis, DamageFinding } from "./types";

const RAVIN_API_KEY = process.env.RAVIN_API_KEY;

/**
 * True when a real Ravin account is configured (partner invites / webhooks).
 * Ravin does not expose a synchronous image-analysis API: results arrive via
 * webhook after photos are ingested (OTL walkaround or S3 upload), so demo
 * findings must never be shown for a live account.
 */
export function isRavinLiveAccount(): boolean {
  return Boolean(RAVIN_API_KEY);
}

export const RAVIN_DIRECT_ANALYSIS_UNAVAILABLE =
  "Ravin AI analysis is delivered by webhook after Ravin processes the photos; direct image analysis is not available on this account.";

/**
 * Returns deterministic demo findings when no Ravin account is configured so the
 * flow can be tested end to end. Throws for live accounts (see above).
 */
export async function analyzeDamage(
  photos: { name: string; data: Buffer; contentType: string }[]
): Promise<DamageAnalysis> {
  if (isRavinLiveAccount()) {
    throw new Error(RAVIN_DIRECT_ANALYSIS_UNAVAILABLE);
  }
  return buildDemoAnalysis(photos);
}

/* ----------------------- demo fallback ----------------------- */

const PANELS = [
  "Front bumper",
  "Rear bumper",
  "Bonnet",
  "Left front door",
  "Right rear quarter panel",
  "Boot lid",
];
const DAMAGE_TYPES = ["Scratch", "Dent", "Paint chip", "Scuff"];

function buildDemoAnalysis(
  photos: { name: string; data: Buffer }[]
): DamageAnalysis {
  const seed = photos.reduce((s, p) => s + p.data.length + p.name.length, 0);
  const count = seed % 3; // 0-2 findings
  const findings: DamageFinding[] = Array.from({ length: count }, (_, i) => {
    const sev = ((seed >> (i * 2)) % 3) as 0 | 1 | 2;
    const severity: DamageFinding["severity"] =
      sev === 0 ? "Minor" : sev === 1 ? "Moderate" : "Severe";
    return {
      panel: PANELS[(seed + i * 7) % PANELS.length],
      type: DAMAGE_TYPES[(seed + i * 3) % DAMAGE_TYPES.length],
      severity,
      confidence: 0.82 + ((seed + i) % 15) / 100,
      repairEstimate:
        severity === "Minor" ? 180 + (seed % 120) : severity === "Moderate" ? 450 + (seed % 300) : 1200 + (seed % 800),
    };
  });

  return {
    analyzedPhotos: photos.length,
    findings,
    overallCondition: deriveCondition(findings),
    totalRepairEstimate: findings.reduce((s, f) => s + f.repairEstimate, 0),
  };
}

function deriveCondition(
  findings: DamageFinding[]
): DamageAnalysis["overallCondition"] {
  if (findings.some((f) => f.severity === "Severe")) return "Poor";
  if (findings.some((f) => f.severity === "Moderate")) return "Fair";
  if (findings.length > 0) return "Good";
  return "Excellent";
}
