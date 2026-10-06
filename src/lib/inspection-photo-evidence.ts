import type { InspectionPhoto } from "./types";

export function resolveInspectionPhotoCapturedAt(photo: InspectionPhoto): string {
  return photo.capturedAt?.trim() || photo.uploadedAt;
}

export function formatInspectionPhotoTimestamp(iso: string): string | null {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleString("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  });
}

export function formatInspectionPhotoCoordinates(photo: InspectionPhoto): string | null {
  const { latitude, longitude, locationAccuracyM } = photo;
  if (latitude == null || longitude == null) return null;
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;

  const lat = latitude.toFixed(5);
  const lng = longitude.toFixed(5);
  const accuracy =
    locationAccuracyM != null && Number.isFinite(locationAccuracyM)
      ? ` ±${Math.round(locationAccuracyM)} m`
      : "";

  return `${lat}, ${lng}${accuracy}`;
}

/** Single line for report overlays and PDF captions. */
export function formatInspectionPhotoEvidenceLine(photo: InspectionPhoto): string | null {
  const when = formatInspectionPhotoTimestamp(resolveInspectionPhotoCapturedAt(photo));
  const where = formatInspectionPhotoCoordinates(photo);

  if (when && where) return `${when} · ${where}`;
  if (when) return when;
  if (where) return where;
  return null;
}

export function parseOptionalFloat(value: FormDataEntryValue | null): number | null {
  if (value == null) return null;
  const text = String(value).trim();
  if (!text) return null;
  const n = Number(text);
  return Number.isFinite(n) ? n : null;
}

export function parseOptionalIsoTimestamp(value: FormDataEntryValue | null): string | null {
  if (value == null) return null;
  const text = String(value).trim();
  if (!text) return null;
  const date = new Date(text);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}
