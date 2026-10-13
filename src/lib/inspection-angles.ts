/**
 * Continuous clockwise walk-around starting at the front-left corner:
 * front left → front → front right → right side → rear right → rear → rear left → left side,
 * then interior, wheels and documents.
 */
export const INSPECTION_ANGLES = [
  { id: "front_left", label: "Front left" },
  { id: "front", label: "Front centre" },
  { id: "front_right", label: "Front right" },
  { id: "right_side", label: "Right side (body)" },
  { id: "rear_right", label: "Rear right" },
  { id: "rear", label: "Rear centre" },
  { id: "rear_left", label: "Rear left" },
  { id: "left_side", label: "Left side (body)" },
  { id: "dashboard", label: "Dash cluster with engine running" },
  { id: "interior_driver_front", label: "Driver side front interior" },
  { id: "interior_passenger_front", label: "Passenger side front interior" },
  { id: "interior_rear", label: "Rear interior" },
  { id: "wheel_right_front", label: "Right front wheel" },
  { id: "wheel_right_rear", label: "Right rear wheel" },
  { id: "wheel_left_rear", label: "Left rear wheel" },
  { id: "wheel_left_front", label: "Left front wheel" },
  { id: "vin_plate", label: "VIN identification photo" },
  { id: "keys", label: "# Keys" },
  {
    id: "service_record",
    label: "Invoice or logbook — last service date",
  },
] as const;

export type InspectionAngleId = (typeof INSPECTION_ANGLES)[number]["id"];

/** Exterior walk-around shots; everything else is grouped as "additional photos". */
export const EXTERIOR_INSPECTION_ANGLE_IDS: readonly string[] = [
  "front_left",
  "front",
  "front_right",
  "right_side",
  "rear_right",
  "rear",
  "rear_left",
  "left_side",
];

export function isExteriorInspectionAngle(id: string): boolean {
  return EXTERIOR_INSPECTION_ANGLE_IDS.includes(id);
}

export const INSPECTION_ANGLE_IDS = INSPECTION_ANGLES.map((angle) => angle.id);

/** Still accepted on upload for older inspection links. */
export const LEGACY_INSPECTION_ANGLE_IDS = [
  "odometer",
  "wheels",
  "interior",
  "interior_passenger_rear",
  "interior_driver_rear",
  "interior_rear_boot",
] as const;

export function isValidInspectionAngleId(id: string): boolean {
  return (
    INSPECTION_ANGLE_IDS.includes(id as (typeof INSPECTION_ANGLE_IDS)[number]) ||
    (LEGACY_INSPECTION_ANGLE_IDS as readonly string[]).includes(id)
  );
}

export function getInspectionAngleLabel(id: string): string {
  if (id === "odometer") return "Odometer";
  if (id === "wheels") return "Wheels";
  if (id === "interior") return "Interior";
  if (id === "interior_passenger_rear" || id === "interior_driver_rear") {
    return "Rear interior";
  }
  if (id === "interior_rear_boot") return "Rear boot interior";
  return INSPECTION_ANGLES.find((angle) => angle.id === id)?.label ?? id;
}

export function getInspectionAngleHint(id: string): string | undefined {
  if (id === "front") {
    return "Centre the front of the car with the registration plate clearly readable.";
  }
  if (id === "dashboard") {
    return "Ignition on — odometer and warning lights visible.";
  }
  if (id === "vin_plate") {
    return "Location either: Driver door jam · Lower windscreen dashboard · Engine bay";
  }
  if (id === "interior_rear") {
    return "One photo showing the rear seats — either side is fine.";
  }
  return undefined;
}

export const INSPECTION_PHOTO_BUCKET = "inspection-photos";

export const INSPECTION_LINK_TTL_HOURS = 72;

/** Max photos for manual desktop upload (matches guided capture count). */
export const MANUAL_DAMAGE_UPLOAD_MAX_PHOTOS = INSPECTION_ANGLES.length;

/** Keys and service invoice — shown on report for record only (no Ravin AI). */
export const RECORD_ONLY_INSPECTION_ANGLE_IDS = ["keys", "service_record"] as const;

export function isRecordOnlyInspectionPhoto(angle: string): boolean {
  return (RECORD_ONLY_INSPECTION_ANGLE_IDS as readonly string[]).includes(angle);
}

export const INSPECTION_RECORD_ONLY_FOOTNOTE =
  "No AI scan on this image. This image is for a matter of record only.";

/** Shown once per photo group when any tile is record-only (keys, service invoice). */
export const INSPECTION_RECORD_ONLY_FOOTNOTE_WITH_STAR = `* ${INSPECTION_RECORD_ONLY_FOOTNOTE}`;
