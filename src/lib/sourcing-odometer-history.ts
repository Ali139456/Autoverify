import type { VehicleIdentity } from "./types";

type JsonRecord = Record<string, unknown>;

export type OdometerHistoryEntry = NonNullable<
  VehicleIdentity["odometerHistory"]
>[number];

/** Public label for listing events — never include marketplace hostnames (AutoGrab contract). */
export function listingSourceLabel(sellerType: unknown): string {
  const normalized = String(sellerType ?? "")
    .trim()
    .toLowerCase();
  if (normalized === "dealer") return "Dealer listing";
  if (normalized === "private") return "Private listing";
  return "Listing record";
}

function parseEventTimestamp(value: unknown): string | null {
  if (value === null || value === undefined || value === "") return null;
  const trimmed = String(value).trim();
  if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) return trimmed.slice(0, 10);
  const parsed = Date.parse(trimmed);
  if (Number.isNaN(parsed)) return null;
  return new Date(parsed).toISOString().slice(0, 10);
}

/**
 * Maps AutoGrab `/sourcing/history` events to stored history.
 * Marketplace fields from the API are discarded and must not be persisted or shown.
 */
export function mapSourcingHistoryPayload(data: JsonRecord): OdometerHistoryEntry[] {
  const vehicleHistory = data.vehicle_history;
  if (!vehicleHistory || typeof vehicleHistory !== "object") return [];

  const events = (vehicleHistory as JsonRecord).events;
  if (!Array.isArray(events)) return [];

  const rows: OdometerHistoryEntry[] = [];
  for (const raw of events) {
    if (!raw || typeof raw !== "object") continue;
    const event = raw as JsonRecord;
    const odometer = Number(event.odometer);
    if (!Number.isFinite(odometer) || odometer <= 0) continue;
    const date = parseEventTimestamp(event.timestamp);
    if (!date) continue;
    rows.push({
      date,
      odometer: Math.round(odometer),
      source: listingSourceLabel(event.seller_type),
    });
  }

  rows.sort((a, b) => a.date.localeCompare(b.date) || a.odometer - b.odometer);

  const deduped: OdometerHistoryEntry[] = [];
  for (const row of rows) {
    const prev = deduped[deduped.length - 1];
    if (prev && prev.date === row.date && prev.odometer === row.odometer) continue;
    deduped.push(row);
  }
  return deduped;
}
