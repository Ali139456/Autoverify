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

/** Human-readable place (reverse-geocoded) with coordinates as a fallback. */
export function formatInspectionPhotoLocation(photo: InspectionPhoto): string | null {
  const label = photo.locationLabel?.trim();
  if (label) return label;
  return formatInspectionPhotoCoordinates(photo);
}

/** Caption lines shown beneath a photo: [timestamp, location]. */
export function formatInspectionPhotoEvidenceLines(photo: InspectionPhoto): string[] {
  const when = formatInspectionPhotoTimestamp(resolveInspectionPhotoCapturedAt(photo));
  const where = formatInspectionPhotoLocation(photo);
  return [when, where].filter((line): line is string => Boolean(line));
}

/** Single line for compact captions. */
export function formatInspectionPhotoEvidenceLine(photo: InspectionPhoto): string | null {
  const lines = formatInspectionPhotoEvidenceLines(photo);
  return lines.length > 0 ? lines.join(" · ") : null;
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
