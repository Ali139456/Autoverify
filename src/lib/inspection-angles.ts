/**
 * Continuous clockwise walk-around starting at the front-left corner:
 * front left → front → front right → right side → rear right → rear → rear left → left side,
 * then interior, wheels and documents.
 */
export const INSPECTION_ANGLES = [
  { id: "front_left", label: "Front left" },
  { id: "front", label: "Front" },
  { id: "front_right", label: "Front right" },
  { id: "right_side", label: "Right side (body)" },
  { id: "rear_right", label: "Rear right" },
  { id: "rear", label: "Rear" },
  { id: "rear_left", label: "Rear left" },
  { id: "left_side", label: "Left side (body)" },
  { id: "dashboard", label: "Dash cluster with engine running" },
  { id: "interior_driver_front", label: "Driver side front interior" },
  { id: "interior_passenger_front", label: "Passenger side front interior" },
  { id: "interior_passenger_rear", label: "Passenger side rear interior" },
  { id: "interior_driver_rear", label: "Driver side rear interior" },
  { id: "interior_rear_boot", label: "Rear boot interior" },
  { id: "wheel_right_front", label: "Right front wheel" },
  { id: "wheel_right_rear", label: "Right rear wheel" },
  { id: "wheel_left_rear", label: "Left rear wheel" },
  { id: "wheel_left_front", label: "Left front wheel" },
  { id: "vin_plate", label: "VIN plate" },
  { id: "keys", label: "# Keys" },
  {
    id: "service_record",
    label: "Invoice or logbook — last service date",
  },
] as const;

export type InspectionAngleId = (typeof INSPECTION_ANGLES)[number]["id"];

export const INSPECTION_ANGLE_IDS = INSPECTION_ANGLES.map((angle) => angle.id);

/** Still accepted on upload for older inspection links. */
export const LEGACY_INSPECTION_ANGLE_IDS = [
  "odometer",
  "wheels",
  "interior",
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
  return undefined;
}

export const INSPECTION_PHOTO_BUCKET = "inspection-photos";

export const INSPECTION_LINK_TTL_HOURS = 72;

/** Max photos for manual desktop upload (matches guided capture count). */
export const MANUAL_DAMAGE_UPLOAD_MAX_PHOTOS = INSPECTION_ANGLES.length;
