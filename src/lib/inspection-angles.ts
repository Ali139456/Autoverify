/** Walk-around order: front → right side → rear → left side, then interior. */
export const INSPECTION_ANGLES = [
  { id: "front_left", label: "Front left" },
  { id: "front", label: "Front" },
  { id: "front_right", label: "Front right" },
  { id: "right_side", label: "Right side" },
  { id: "rear_right", label: "Rear right" },
  { id: "rear", label: "Rear" },
  { id: "rear_left", label: "Rear left" },
  { id: "left_side", label: "Left side" },
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
  if (id === "dashboard") {
    return "Ignition on — odometer and warning lights visible.";
  }
  if (id === "vin_plate") {
    return "Usually located inside the driver door.";
  }
  return undefined;
}

export const INSPECTION_PHOTO_BUCKET = "inspection-photos";

export const INSPECTION_LINK_TTL_HOURS = 72;
