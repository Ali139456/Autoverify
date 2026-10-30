/**
 * Guided capture order (Australian RHD) — Denise sample report sequence.
 */
export const INSPECTION_ANGLES = [
  { id: "front", label: "Front centre" },
  { id: "windscreen", label: "Windscreen" },
  { id: "front_left", label: "Front corner guard - passenger side" },
  {
    id: "mirror_passenger",
    label: "Front passenger exterior door mirror",
  },
  { id: "left_side", label: "Passenger side (full body)" },
  { id: "rear", label: "Rear centre" },
  { id: "boot_tray_opened", label: "Boot open" },
  { id: "right_side", label: "Driver side (full body)" },
  {
    id: "mirror_driver",
    label: "Front driver side exterior door mirror",
  },
  { id: "front_right", label: "Front corner guard - driver side" },
  { id: "roof", label: "Roof" },
  { id: "wheel_left_front", label: "Passenger side front tyre" },
  { id: "wheel_left_rear", label: "Passenger side rear tyre" },
  { id: "wheel_right_rear", label: "Driver side rear tyre" },
  { id: "wheel_right_front", label: "Driver side front tyre" },
  { id: "vin_plate", label: "VIN identification image" },
  {
    id: "dashboard",
    label: "Interior odometer reading (with engine running)",
  },
  { id: "interior_front", label: "Interior front" },
  { id: "interior_rear", label: "Interior rear" },
  { id: "keys", label: "# Keys" },
  {
    id: "service_record",
    label: "Registration papers",
  },
] as const;

/** Lender asset verification — digital self inspection (7 photos). */
export const LAV_DIGITAL_INSPECTION_ANGLES = [
  { id: "front", label: "Front centre" },
  { id: "left_side", label: "Passenger side (full body)" },
  { id: "rear", label: "Rear centre" },
  { id: "right_side", label: "Driver side (full body)" },
  {
    id: "dashboard",
    label: "Interior odometer reading (with engine running)",
  },
  { id: "vin_plate", label: "VIN identification image" },
  { id: "service_record", label: "Registration papers" },
] as const;

export type InspectionAngleDef = (typeof INSPECTION_ANGLES)[number];
export type InspectionAngleId = (typeof INSPECTION_ANGLES)[number]["id"];

export function isLavDigitalInspectionReport(report: {
  lavContext?: unknown;
} | null): boolean {
  return Boolean(report?.lavContext);
}

export function resolveInspectionAnglesForReport(report: {
  lavContext?: unknown;
} | null): readonly InspectionAngleDef[] {
  return isLavDigitalInspectionReport(report)
    ? LAV_DIGITAL_INSPECTION_ANGLES
    : INSPECTION_ANGLES;
}

/** @deprecated Use {@link isPrimaryWalkaroundInspectionAngle} — kept for older call sites. */
export const EXTERIOR_INSPECTION_ANGLE_IDS: readonly string[] =
  INSPECTION_ANGLES.filter(
    (a) => a.id !== "keys" && a.id !== "service_record",
  ).map((a) => a.id);

export function isExteriorInspectionAngle(id: string): boolean {
  return EXTERIOR_INSPECTION_ANGLE_IDS.includes(id);
}

/** Main inspection grid (everything except keys + registration papers). */
export function isPrimaryWalkaroundInspectionAngle(id: string): boolean {
  return isExteriorInspectionAngle(id);
}

export const INSPECTION_ANGLE_IDS = INSPECTION_ANGLES.map((angle) => angle.id);

/** Still accepted on upload for older inspection links. */
export const LEGACY_INSPECTION_ANGLE_IDS = [
  "rear_right",
  "rear_left",
  "odometer",
  "wheels",
  "interior",
  "interior_passenger_rear",
  "interior_driver_rear",
  "interior_rear_boot",
  "interior_driver_front",
  "interior_passenger_front",
] as const;

export function isValidInspectionAngleId(id: string): boolean {
  return (
    INSPECTION_ANGLE_IDS.includes(id as (typeof INSPECTION_ANGLE_IDS)[number]) ||
    (LEGACY_INSPECTION_ANGLE_IDS as readonly string[]).includes(id)
  );
}

/** Capture UI: put “(full body)” on its own line under the side name. */
export function splitInspectionAngleLabelLines(label: string): {
  primary: string;
  secondary?: string;
} {
  const match = label.match(/^(.+?) \((full body)\)$/i);
  if (match) {
    return { primary: match[1].trim(), secondary: `(${match[2]})` };
  }
  return { primary: label };
}

export function getInspectionAngleLabel(id: string): string {
  if (id === "odometer") return "Odometer";
  if (id === "wheels") return "Wheels";
  if (id === "interior") return "Interior";
  if (id === "rear_right") return "Rear right";
  if (id === "rear_left") return "Rear left";
  if (id === "interior_passenger_rear" || id === "interior_driver_rear") {
    return "Rear interior";
  }
  if (id === "interior_rear_boot") return "Rear boot interior";
  if (id === "interior_driver_front" || id === "interior_passenger_front") {
    return "Front interior";
  }
  return INSPECTION_ANGLES.find((angle) => angle.id === id)?.label ?? id;
}

export function getInspectionAngleHint(id: string): string | undefined {
  if (id === "front") {
    return "Centre the front of the car with the registration plate clearly readable.";
  }
  if (id === "windscreen") {
    return "Capture the full windscreen and front glass from outside the vehicle.";
  }
  if (id === "roof") {
    return "Photograph the roof from an angle that shows its full length and condition.";
  }
  if (id === "mirror_passenger" || id === "mirror_driver") {
    return "Close-up of the exterior door mirror including the mirror housing.";
  }
  if (id === "dashboard") {
    return "Ignition on — odometer reading and warning lights visible.";
  }
  if (id === "vin_plate") {
    return "Location either: Driver door jam · Lower windscreen dashboard · Engine bay";
  }
  if (id === "interior_rear") {
    return "One photo showing the rear seats — either side is fine.";
  }
  if (id === "interior_front") {
    return "One photo showing the front seats — either side is fine.";
  }
  if (id === "boot_tray_opened") {
    return "Open the boot or tray and photograph the cargo area.";
  }
  return undefined;
}

export const INSPECTION_PHOTO_BUCKET = "inspection-photos";

export const INSPECTION_LINK_TTL_HOURS = 72;

/** Max photos for manual desktop upload (matches guided capture count). */
export const MANUAL_DAMAGE_UPLOAD_MAX_PHOTOS = INSPECTION_ANGLES.length;

/** Keys and registration papers — shown on report for record only (no Ravin AI). */
export const RECORD_ONLY_INSPECTION_ANGLE_IDS = ["keys", "service_record"] as const;

export function isRecordOnlyInspectionPhoto(angle: string): boolean {
  return (RECORD_ONLY_INSPECTION_ANGLE_IDS as readonly string[]).includes(angle);
}

export const INSPECTION_RECORD_ONLY_FOOTNOTE =
  "No AI scan on this image. This image is for a matter of record only.";

/** Shown once per photo group when any tile is record-only (keys, registration papers). */
export const INSPECTION_RECORD_ONLY_FOOTNOTE_WITH_STAR = `* ${INSPECTION_RECORD_ONLY_FOOTNOTE}`;

/** Tile title; record-only angles get * to match the shared footnote below the grid. */
export function formatInspectionPhotoTileLabel(
  label: string,
  angle: string,
): string {
  if (isRecordOnlyInspectionPhoto(angle)) {
    return `${label}*`;
  }
  return label;
}

const LEGACY_INSPECTION_PHOTO_SORT_INDEX: Record<string, number> = {
  rear_right: 850,
  rear_left: 851,
  odometer: 900,
  wheels: 901,
  interior: 902,
  interior_passenger_rear: 903,
  interior_driver_rear: 903,
  interior_rear_boot: 904,
  interior_driver_front: 905,
  interior_passenger_front: 905,
};

/**
 * Walkaround tile labels — must stay in sync with Insights+ sample report
 * (`buildSampleInspectionPhotos` uses {@link getInspectionAngleLabel}).
 */
export function sortInspectionPhotos<T extends { angle: string }>(
  photos: T[],
): T[] {
  const order = new Map<string, number>(
    INSPECTION_ANGLE_IDS.map((id, index) => [id, index]),
  );
  return [...photos].sort((a, b) => {
    const ai =
      order.get(a.angle) ??
      LEGACY_INSPECTION_PHOTO_SORT_INDEX[a.angle] ??
      9999;
    const bi =
      order.get(b.angle) ??
      LEGACY_INSPECTION_PHOTO_SORT_INDEX[b.angle] ??
      9999;
    if (ai !== bi) return ai - bi;
    return a.angle.localeCompare(b.angle);
  });
}
