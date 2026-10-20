/**
 * Clockwise walk-around from the front passenger corner (Australian RHD: passenger = left),
 * then roof, mirrors, full body sides, boot, interior, wheels and documents.
 */
export const INSPECTION_ANGLES = [
  { id: "front_left", label: "Front passenger side" },
  { id: "roof", label: "Roof" },
  { id: "mirror_passenger", label: "Passenger side exterior door mirror" },
  { id: "front", label: "Front centre" },
  { id: "windscreen", label: "Windscreen" },
  { id: "front_right", label: "Front driver side" },
  { id: "mirror_driver", label: "Driver side exterior door mirror" },
  { id: "right_side", label: "Full body — driver side" },
  { id: "rear_right", label: "Rear right" },
  { id: "rear", label: "Rear centre" },
  { id: "boot_tray_opened", label: "Boot open" },
  { id: "rear_left", label: "Rear left" },
  { id: "left_side", label: "Full body — passenger side" },
  { id: "dashboard", label: "Dash cluster with engine running" },
  { id: "interior_front", label: "Front interior" },
  { id: "interior_rear", label: "Rear interior" },
  { id: "wheel_right_front", label: "Right front wheel" },
  { id: "wheel_right_rear", label: "Right rear wheel" },
  { id: "wheel_left_rear", label: "Left rear wheel" },
  { id: "wheel_left_front", label: "Left front wheel" },
  { id: "vin_plate", label: "VIN identification photo" },
  { id: "keys", label: "# Keys" },
  {
    id: "service_record",
    label: "Registration papers",
  },
] as const;

export type InspectionAngleId = (typeof INSPECTION_ANGLES)[number]["id"];

/** Exterior walk-around shots; everything else is grouped as "additional photos". */
export const EXTERIOR_INSPECTION_ANGLE_IDS: readonly string[] = [
  "front_left",
  "roof",
  "mirror_passenger",
  "front",
  "windscreen",
  "front_right",
  "mirror_driver",
  "right_side",
  "rear_right",
  "rear",
  "boot_tray_opened",
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
  "interior_driver_front",
  "interior_passenger_front",
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
    return "Ignition on — odometer and warning lights visible.";
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
