import {
  allRequiredAnglesUploaded,
  requiredInspectionAngles,
  type InspectionAngleDef,
} from "@/lib/inspection-angles";

/** LAV legacy uploads may still use `odometer` while the UI step is `dashboard`. */
export function normalizeCaptureAngleId(
  angleId: string,
  lavDigital: boolean,
): string {
  if (lavDigital && angleId === "odometer") return "dashboard";
  return angleId;
}

export function uploadedAngleIds(
  photos: ReadonlyArray<{ angle: string }>,
  lavDigital: boolean,
): Set<string> {
  return new Set(
    photos.map((photo) => normalizeCaptureAngleId(photo.angle, lavDigital)),
  );
}

export function findFirstIncompleteCaptureStep(
  uploaded: Set<string>,
  angles: readonly InspectionAngleDef[],
): number {
  const required = requiredInspectionAngles(angles);
  for (const req of required) {
    if (!uploaded.has(req.id)) {
      const idx = angles.findIndex((angle) => angle.id === req.id);
      if (idx >= 0) return idx;
    }
  }
  for (let i = 0; i < angles.length; i++) {
    if (!uploaded.has(angles[i].id)) return i;
  }
  return Math.max(0, angles.length - 1);
}

/** Next step after upload — required angles in order before optional angles. */
export function findNextCaptureStepIndex(
  uploaded: Set<string>,
  fromStep: number,
  angles: readonly InspectionAngleDef[],
): number {
  if (allRequiredAnglesUploaded(uploaded, angles)) {
    return fromStep;
  }
  const requiredIds = new Set(
    requiredInspectionAngles(angles).map((angle) => angle.id),
  );

  for (let i = fromStep + 1; i < angles.length; i++) {
    const id = angles[i].id;
    if (requiredIds.has(id) && !uploaded.has(id)) return i;
  }
  for (let i = 0; i < fromStep; i++) {
    const id = angles[i].id;
    if (requiredIds.has(id) && !uploaded.has(id)) return i;
  }
  for (let i = fromStep + 1; i < angles.length; i++) {
    if (!uploaded.has(angles[i].id)) return i;
  }
  return fromStep;
}

const INSPECTION_STEP_KEY = (reportId: string) =>
  `autoverifi-inspection-step:${reportId}`;

export function readPersistedCaptureStep(reportId: string): number | null {
  try {
    const raw = sessionStorage.getItem(INSPECTION_STEP_KEY(reportId));
    if (raw == null) return null;
    const n = Number.parseInt(raw, 10);
    return Number.isFinite(n) && n >= 0 ? n : null;
  } catch {
    return null;
  }
}

export function persistCaptureStep(reportId: string, step: number): void {
  try {
    sessionStorage.setItem(INSPECTION_STEP_KEY(reportId), String(step));
  } catch {
    // sessionStorage may be unavailable
  }
}

export function resolveInitialCaptureStep(
  reportId: string,
  photos: ReadonlyArray<{ angle: string }>,
  angles: readonly InspectionAngleDef[],
  lavDigital: boolean,
): number {
  const uploaded = uploadedAngleIds(photos, lavDigital);
  const firstIncomplete = findFirstIncompleteCaptureStep(uploaded, angles);
  const persisted = readPersistedCaptureStep(reportId);
  if (persisted == null) return firstIncomplete;

  const clamped = Math.min(
    Math.max(persisted, 0),
    Math.max(0, angles.length - 1),
  );
  if (clamped > firstIncomplete) return clamped;

  const atPersisted = angles[clamped];
  if (atPersisted && !uploaded.has(atPersisted.id)) return clamped;

  return Math.max(firstIncomplete, clamped);
}
