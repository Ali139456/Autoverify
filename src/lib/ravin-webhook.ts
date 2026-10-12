import { DamageAnalysis, DamageFinding } from "./types";

type RavinDamageItem = {
  damageTypeName?: string;
  partName?: string;
  locationName?: string;
  damageDescription?: string;
  severity?: number | string;
  score?: number;
  cost?: number;
  currency?: { sign?: string; acronym?: string };
};

function mapSeverity(value: unknown): DamageFinding["severity"] {
  const numeric = Number(value);
  if (Number.isFinite(numeric)) {
    if (numeric >= 3) return "Severe";
    if (numeric === 2) return "Moderate";
    return "Minor";
  }

  const text = String(value ?? "").toLowerCase();
  if (text.includes("severe") || text.includes("major")) return "Severe";
  if (text.includes("moderate") || text.includes("medium")) return "Moderate";
  return "Minor";
}

function collectDamageItems(payload: unknown, items: RavinDamageItem[] = []): RavinDamageItem[] {
  if (!payload || typeof payload !== "object") return items;

  if (Array.isArray(payload)) {
    for (const entry of payload) collectDamageItems(entry, items);
    return items;
  }

  const record = payload as Record<string, unknown>;

  if ("damageTypeName" in record || "partName" in record || "damageDescription" in record) {
    items.push(record as RavinDamageItem);
  }

  if (Array.isArray(record.value)) {
    for (const entry of record.value) {
      if (entry && typeof entry === "object") {
        collectDamageItems(entry, items);
      }
    }
  }

  for (const value of Object.values(record)) {
    if (value && typeof value === "object") {
      collectDamageItems(value, items);
    }
  }

  return items;
}

function deriveCondition(findings: DamageFinding[]): DamageAnalysis["overallCondition"] {
  if (findings.some((finding) => finding.severity === "Severe")) return "Poor";
  if (findings.some((finding) => finding.severity === "Moderate")) return "Fair";
  if (findings.length > 0) return "Good";
  return "Excellent";
}

export function parseRavinWebhookPayload(
  payload: unknown,
  analyzedPhotos = 0,
): DamageAnalysis {
  const rawItems = collectDamageItems(payload);
  const findings: DamageFinding[] = rawItems.map((item) => ({
    panel: item.partName || item.locationName || "Unknown panel",
    type: item.damageTypeName || "Damage",
    severity: mapSeverity(item.severity ?? item.score),
    confidence: Math.min(1, Math.max(0, Number(item.score ?? 0.85) / (Number(item.score) > 1 ? 100 : 1))),
    repairEstimate: Number(item.cost ?? 0),
    description: item.damageDescription || undefined,
  }));

  return {
    analyzedPhotos,
    findings,
    overallCondition: deriveCondition(findings),
    totalRepairEstimate: findings.reduce((sum, finding) => sum + finding.repairEstimate, 0),
  };
}

type RavinPhotoRef = {
  angle: string;
  label: string;
  url: string;
};

function isImageUrl(value: unknown): value is string {
  if (typeof value !== "string") return false;
  const lower = value.toLowerCase();
  return (
    lower.startsWith("http") &&
    (lower.includes(".jpg") ||
      lower.includes(".jpeg") ||
      lower.includes(".png") ||
      lower.includes(".webp") ||
      lower.includes("image") ||
      lower.includes("photo"))
  );
}

function collectPhotoRefs(payload: unknown, refs: RavinPhotoRef[] = []): RavinPhotoRef[] {
  if (!payload || typeof payload !== "object") return refs;

  if (Array.isArray(payload)) {
    payload.forEach((entry) => {
      if (typeof entry === "string" && isImageUrl(entry)) {
        refs.push({
          angle: `photo-${refs.length + 1}`,
          label: `Photo ${refs.length + 1}`,
          url: entry,
        });
        return;
      }
      collectPhotoRefs(entry, refs);
    });
    return refs;
  }

  const record = payload as Record<string, unknown>;
  const urlCandidates = [
    record.url,
    record.imageUrl,
    record.image_url,
    record.photoUrl,
    record.photo_url,
    record.src,
    record.thumbnailUrl,
    record.thumbnail_url,
  ];

  for (const candidate of urlCandidates) {
    if (isImageUrl(candidate)) {
      const label =
        (typeof record.label === "string" && record.label) ||
        (typeof record.name === "string" && record.name) ||
        (typeof record.angle === "string" && record.angle) ||
        (typeof record.partName === "string" && record.partName) ||
        `Photo ${refs.length + 1}`;

      refs.push({
        angle:
          (typeof record.angle === "string" && record.angle) ||
          (typeof record.name === "string" && record.name) ||
          `photo-${refs.length + 1}`,
        label,
        url: candidate,
      });
    }
  }

  for (const value of Object.values(record)) {
    if (value && typeof value === "object") {
      collectPhotoRefs(value, refs);
    }
  }

  return refs;
}

/** Pull image URLs from Ravin webhook / inspector-lite payloads. */
export function extractRavinPhotos(payload: unknown): RavinPhotoRef[] {
  const refs = collectPhotoRefs(payload, []);
  const seen = new Set<string>();

  return refs.filter((ref) => {
    if (seen.has(ref.url)) return false;
    seen.add(ref.url);
    return true;
  });
}

const INVITATION_ID_KEYS = [
  "invitationId",
  "invitation_id",
  "invitationID",
  "partnerInvitationId",
  "inspectionId",
  "inspection_id",
  "reportId",
  "report_id",
  "eventId",
  "event_id",
];

export function extractInvitationId(payload: unknown): string | null {
  const found = collectInvitationIds(payload);
  return found[0] ?? null;
}

/** All candidate ids from a Ravin webhook (report uuid, insp- prefix, event id, etc.). */
export function collectInvitationIds(
  payload: unknown,
  ids: string[] = [],
  depth = 0,
): string[] {
  if (depth > 12 || payload == null || typeof payload !== "object") return ids;

  if (Array.isArray(payload)) {
    for (const entry of payload) {
      collectInvitationIds(entry, ids, depth + 1);
    }
    return [...new Set(ids)];
  }

  const record = payload as Record<string, unknown>;
  for (const key of INVITATION_ID_KEYS) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) {
      ids.push(value.trim());
    }
  }

  for (const value of Object.values(record)) {
    if (value && typeof value === "object") {
      collectInvitationIds(value, ids, depth + 1);
    }
  }

  return [...new Set(ids)];
}
