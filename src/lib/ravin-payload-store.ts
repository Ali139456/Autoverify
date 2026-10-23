import type { RavinIngestTrace } from "./ravin-ingest-log";

export type StoredRavinPayload = Record<string, unknown> & {
  lastS3Ingest?: RavinIngestTrace;
  lastS3IngestAt?: string;
  lastS3IngestError?: string;
  lastS3IngestErrorAt?: string;
  /** Ops alert sent when Ravin webhook missing long after S3 ingest. */
  ravinStuckNotifiedAt?: string;
};

export function normalizeRavinPayload(existing: unknown): StoredRavinPayload {
  if (existing && typeof existing === "object" && !Array.isArray(existing)) {
    return { ...(existing as Record<string, unknown>) };
  }
  if (existing != null) {
    return { webhookPayload: existing };
  }
  return {};
}

export function withRavinIngestTrace(
  existing: unknown,
  ingestTrace: RavinIngestTrace,
): StoredRavinPayload {
  return {
    ...normalizeRavinPayload(existing),
    lastS3Ingest: ingestTrace,
    lastS3IngestAt: new Date().toISOString(),
  };
}

export function withRavinIngestError(
  existing: unknown,
  message: string,
): StoredRavinPayload {
  return {
    ...normalizeRavinPayload(existing),
    lastS3IngestError: message,
    lastS3IngestErrorAt: new Date().toISOString(),
  };
}

export function withRavinStuckNotified(existing: unknown): StoredRavinPayload {
  return {
    ...normalizeRavinPayload(existing),
    ravinStuckNotifiedAt: new Date().toISOString(),
  };
}

export function readRavinStuckNotifiedAt(payload: unknown): string | null {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) return null;
  const at = (payload as StoredRavinPayload).ravinStuckNotifiedAt;
  return typeof at === "string" && at.trim() ? at.trim() : null;
}

export function readLastS3Ingest(payload: unknown): RavinIngestTrace | null {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) return null;
  const record = payload as StoredRavinPayload;
  const trace = record.lastS3Ingest;
  if (!trace || typeof trace !== "object") return null;
  if (!Array.isArray(trace.events)) return null;
  return trace as RavinIngestTrace;
}
