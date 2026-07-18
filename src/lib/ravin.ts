import { DamageAnalysis, DamageFinding } from "./types";

const RAVIN_API_KEY = process.env.RAVIN_API_KEY;
const RAVIN_BASE_URL = process.env.RAVIN_BASE_URL ?? "https://api.ravin.ai/v1";

/**
 * Sends vehicle photos to Ravin.ai for AI damage detection.
 *
 * When RAVIN_API_KEY is configured, calls the real Ravin.ai inspection API.
 * Otherwise returns deterministic demo findings so the flow can be tested.
 */
export async function analyzeDamage(
  photos: { name: string; data: Buffer; contentType: string }[]
): Promise<DamageAnalysis> {
  if (RAVIN_API_KEY) {
    return analyzeViaRavin(photos);
  }
  return buildDemoAnalysis(photos);
}

async function analyzeViaRavin(
  photos: { name: string; data: Buffer; contentType: string }[]
): Promise<DamageAnalysis> {
  // 1. Create an inspection session
  const sessionRes = await fetch(`${RAVIN_BASE_URL}/inspections`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RAVIN_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ type: "damage_detection" }),
  });
  if (!sessionRes.ok) {
    throw new Error(`Ravin.ai inspection creation failed (${sessionRes.status})`);
  }
  const session = await sessionRes.json();
  const inspectionId = session.id ?? session.inspection_id;

  // 2. Upload each photo
  for (const photo of photos) {
    const form = new FormData();
    form.append(
      "image",
      new Blob([new Uint8Array(photo.data)], { type: photo.contentType }),
      photo.name
    );
    await fetch(`${RAVIN_BASE_URL}/inspections/${inspectionId}/images`, {
      method: "POST",
      headers: { Authorization: `Bearer ${RAVIN_API_KEY}` },
      body: form,
    });
  }

  // 3. Retrieve results
  const resultRes = await fetch(
    `${RAVIN_BASE_URL}/inspections/${inspectionId}/results`,
    { headers: { Authorization: `Bearer ${RAVIN_API_KEY}` } }
  );
  if (!resultRes.ok) {
    throw new Error(`Ravin.ai results retrieval failed (${resultRes.status})`);
  }
  const result = await resultRes.json();

  const findings: DamageFinding[] = (result.damages ?? []).map(
    (d: Record<string, unknown>) => ({
      panel: (d.panel as string) ?? "Unknown panel",
      type: (d.type as string) ?? "Damage",
      severity: (d.severity as DamageFinding["severity"]) ?? "Minor",
      confidence: Number(d.confidence) || 0,
      repairEstimate: Number(d.repair_estimate) || 0,
    })
  );

  return {
    analyzedPhotos: photos.length,
    findings,
    overallCondition: result.overall_condition ?? deriveCondition(findings),
    totalRepairEstimate: findings.reduce((s, f) => s + f.repairEstimate, 0),
  };
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
