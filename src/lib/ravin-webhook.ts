import { DamageAnalysis, DamageFinding } from "./types";

type RavinDamageItem = {
  damageTypeName?: string;
  partName?: string;
  locationName?: string;
  damageDescription?: string;
  aiDescription?: string;
  ai_description?: string;
  issueType?: string;
  issueTypeId?: number;
  issueId?: number;
  issueDataItemTypeId?: number;
  severityId?: number;
  severityName?: string;
  severity?: number | string;
  score?: number;
  confidenceScore?: number;
  cost?: number | null;
  currency?: { sign?: string; acronym?: string };
  issueImagesUrls?: string[];
  issueCrops?: { origin?: string }[];
  url?: string;
  imageUrl?: string;
  image_url?: string;
  photoUrl?: string;
  photo_url?: string;
  thumbnailUrl?: string;
  thumbnail_url?: string;
};

/** Ravin `sendEventReport` / repair-plan severity ids (MT AU export). */
function mapRavinSeverityId(
  severityId: unknown,
  severityName?: string,
): DamageFinding["severity"] {
  if (severityName) {
    const text = severityName.toLowerCase();
    if (text.includes("severe") || text.includes("major") || text.includes("heavy")) {
      return "Severe";
    }
    if (text.includes("medium") || text.includes("moderate")) {
      return "Moderate";
    }
    if (text.includes("polish") || text.includes("light") || text.includes("minor")) {
      return "Minor";
    }
  }

  const numeric = Number(severityId);
  if (Number.isFinite(numeric)) {
    if (numeric === 2) return "Moderate";
    if (numeric === 1 || numeric === 5 || numeric === 7) return "Minor";
    if (numeric >= 3 && numeric !== 5 && numeric !== 7) return "Severe";
    return "Minor";
  }

  return mapSeverity(severityId);
}

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

function isRavinDamageRecord(record: Record<string, unknown>): boolean {
  const issueType = String(record.issueType ?? "");
  if (issueType === "exterior-walkaround" || issueType === "review") {
    return false;
  }
  const itemType = Number(record.issueDataItemTypeId);
  if (itemType === 44) return false;
  if (String(record.partName ?? "").toLowerCase() === "car") return false;
  if (String(record.partName ?? "").toLowerCase() === "review") return false;

  if ("issueId" in record && itemType === 8) return true;

  if (
    typeof record.ai_description === "string" &&
    "damageTypeName" in record &&
    !("issueId" in record)
  ) {
    return false;
  }

  if ("damageDescription" in record) return true;
  if ("damageTypeName" in record && !record.issueType) return true;

  return false;
}

function damageFindingKey(item: RavinDamageItem): string {
  if (item.issueId != null) return `issue:${item.issueId}`;
  const panel = item.partName || item.locationName || "panel";
  const type = item.damageTypeName || item.issueType || "damage";
  return `${panel}:${type}:${item.aiDescription ?? item.ai_description ?? ""}`.slice(
    0,
    120,
  );
}

function firstDamageImageUrl(item: RavinDamageItem): string | undefined {
  const fromList = item.issueImagesUrls?.find(
    (url) => typeof url === "string" && isImageUrl(url),
  );
  if (fromList) return fromList;

  const crop = item.issueCrops?.find(
    (entry) => typeof entry?.origin === "string" && isImageUrl(entry.origin),
  );
  if (crop?.origin) return crop.origin;

  return (
    item.imageUrl ||
    item.image_url ||
    item.url ||
    item.photoUrl ||
    item.photo_url ||
    item.thumbnailUrl ||
    item.thumbnail_url
  );
}

function collectDamageItems(payload: unknown, items: RavinDamageItem[] = []): RavinDamageItem[] {
  if (!payload || typeof payload !== "object") return items;

  if (Array.isArray(payload)) {
    for (const entry of payload) collectDamageItems(entry, items);
    return items;
  }

  const record = payload as Record<string, unknown>;

  if (isRavinDamageRecord(record)) {
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

function dedupeDamageItems(items: RavinDamageItem[]): RavinDamageItem[] {
  const seen = new Set<string>();
  const out: RavinDamageItem[] = [];
  for (const item of items) {
    const key = damageFindingKey(item);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(item);
  }
  return out;
}

function sumRepairPlanTotals(payload: unknown): number | null {
  let total = 0;
  let found = false;

  function walk(node: unknown, depth = 0, skip = false): void {
    if (depth > 16 || node == null || typeof node !== "object") return;

    if (Array.isArray(node)) {
      for (const entry of node) walk(entry, depth + 1, skip);
      return;
    }

    const record = node as Record<string, unknown>;
    if (!skip && Array.isArray(record.actions)) {
      for (const action of record.actions) {
        if (!action || typeof action !== "object") continue;
        const cost = Number((action as Record<string, unknown>).totalCost);
        if (Number.isFinite(cost) && cost > 0) {
          total += cost;
          found = true;
        }
      }
    }

    for (const [key, value] of Object.entries(record)) {
      if (key === "_origin") continue;
      if (value && typeof value === "object") walk(value, depth + 1, skip);
    }
  }

  walk(payload);
  return found ? Math.round(total) : null;
}

function deriveCondition(findings: DamageFinding[]): DamageAnalysis["overallCondition"] {
  if (findings.some((finding) => finding.severity === "Severe")) return "Poor";
  if (findings.some((finding) => finding.severity === "Moderate")) return "Fair";
  if (findings.length > 0) return "Good";
  return "Excellent";
}

function formatPanelLabel(item: RavinDamageItem): string {
  const part = item.partName?.trim();
  const location = item.locationName?.trim();
  if (part && location && part.toLowerCase() !== location.toLowerCase()) {
    return `${location} ${part}`;
  }
  return part || location || "Unknown panel";
}

function formatDamageType(item: RavinDamageItem): string {
  const raw =
    item.damageTypeName ||
    item.issueType ||
    "Damage";
  return raw
    .split(/[-_]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function parseRavinWebhookPayload(
  payload: unknown,
  analyzedPhotos = 0,
): DamageAnalysis {
  const rawItems = dedupeDamageItems(collectDamageItems(payload));
  const findings: DamageFinding[] = rawItems.map((item) => {
    const imageUrl = firstDamageImageUrl(item);
    const confidenceRaw =
      item.confidenceScore ?? item.score ?? (item.issueId ? 0.85 : 0.75);
    const confidence = Math.min(
      1,
      Math.max(
        0,
        Number(confidenceRaw) / (Number(confidenceRaw) > 1 ? 100 : 1),
      ),
    );

    return {
      panel: formatPanelLabel(item),
      type: formatDamageType(item),
      severity: mapRavinSeverityId(
        item.severityId ?? item.severity,
        item.severityName,
      ),
      confidence,
      repairEstimate: Number(item.cost ?? 0) || 0,
      description:
        item.aiDescription ||
        item.ai_description ||
        item.damageDescription ||
        undefined,
      imageUrl: typeof imageUrl === "string" ? imageUrl : undefined,
    };
  });

  const lineItemTotal = findings.reduce(
    (sum, finding) => sum + finding.repairEstimate,
    0,
  );
  const repairPlanTotal = sumRepairPlanTotals(payload);

  return {
    analyzedPhotos,
    findings,
    overallCondition: deriveCondition(findings),
    totalRepairEstimate: lineItemTotal > 0 ? lineItemTotal : repairPlanTotal ?? 0,
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

function formatWalkaroundLabel(locationName: string, index: number): string {
  const base = locationName
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
  return index === 0 ? base : `${base} (${index + 1})`;
}

function collectWalkaroundPhotoRefs(
  payload: unknown,
  refs: RavinPhotoRef[] = [],
): RavinPhotoRef[] {
  if (!payload || typeof payload !== "object") return refs;

  if (Array.isArray(payload)) {
    for (const entry of payload) collectWalkaroundPhotoRefs(entry, refs);
    return refs;
  }

  const record = payload as Record<string, unknown>;
  const issueType = String(record.issueType ?? "");
  const itemType = Number(record.issueDataItemTypeId);
  const isWalkaround =
    issueType === "exterior-walkaround" || itemType === 44;

  if (isWalkaround && Array.isArray(record.issueImagesUrls)) {
    const location =
      (typeof record.locationName === "string" && record.locationName) ||
      "walkaround";
    record.issueImagesUrls.forEach((url, index) => {
      if (typeof url === "string" && isImageUrl(url)) {
        refs.push({
          angle: location,
          label: formatWalkaroundLabel(location, index),
          url,
        });
      }
    });
  }

  if (Array.isArray(record.value)) {
    for (const entry of record.value) {
      if (entry && typeof entry === "object") {
        collectWalkaroundPhotoRefs(entry, refs);
      }
    }
  }

  for (const value of Object.values(record)) {
    if (value && typeof value === "object") {
      collectWalkaroundPhotoRefs(value, refs);
    }
  }

  return refs;
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
  const itemType = Number(record.issueDataItemTypeId);
  if (itemType === 8) {
    for (const value of Object.values(record)) {
      if (value && typeof value === "object") {
        collectPhotoRefs(value, refs);
      }
    }
    return refs;
  }

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

function dedupePhotoRefs(refs: RavinPhotoRef[]): RavinPhotoRef[] {
  const seen = new Set<string>();
  return refs.filter((ref) => {
    if (seen.has(ref.url)) return false;
    seen.add(ref.url);
    return true;
  });
}

/** Pull image URLs from Ravin webhook / inspector-lite payloads. */
export function extractRavinPhotos(payload: unknown): RavinPhotoRef[] {
  const walkaround = dedupePhotoRefs(collectWalkaroundPhotoRefs(payload, []));
  if (walkaround.length > 0) return walkaround;

  return dedupePhotoRefs(collectPhotoRefs(payload, []));
}

const AUTO_VERIFI_REPORT_ID = /\bAV-[A-Z0-9-]{4,}\b/gi;

const INVITATION_ID_KEYS = [
  "invitationId",
  "invitation_id",
  "invitationID",
  "partnerInvitationId",
  "claimId",
  "claim_id",
  "externalId",
  "external_id",
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

/** Ravin payloads often embed Auto Verifi claimId / report id (e.g. AV-MV7TCHG5-OY5ZSWRO). */
export function extractAutoVerifiReportIds(
  payload: unknown,
  ids: string[] = [],
  depth = 0,
): string[] {
  if (depth > 14 || payload == null) return ids;

  if (typeof payload === "string") {
    for (const match of payload.matchAll(AUTO_VERIFI_REPORT_ID)) {
      ids.push(match[0].toUpperCase());
    }
    return [...new Set(ids)];
  }

  if (Array.isArray(payload)) {
    for (const entry of payload) {
      extractAutoVerifiReportIds(entry, ids, depth + 1);
    }
    return [...new Set(ids)];
  }

  if (typeof payload === "object") {
    for (const value of Object.values(payload as Record<string, unknown>)) {
      extractAutoVerifiReportIds(value, ids, depth + 1);
    }
  }

  return [...new Set(ids)];
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
      extractAutoVerifiReportIds(value, ids, depth + 1);
    }
  }

  for (const value of Object.values(record)) {
    if (value && typeof value === "object") {
      collectInvitationIds(value, ids, depth + 1);
    }
  }

  return [...new Set(ids)];
}
