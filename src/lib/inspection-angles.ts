export const INSPECTION_ANGLES = [
  { id: "front_left", label: "Front left" },
  { id: "front", label: "Front" },
  { id: "front_right", label: "Front right" },
  { id: "left_side", label: "Left side" },
  { id: "rear_left", label: "Rear left" },
  { id: "rear", label: "Rear" },
  { id: "rear_right", label: "Rear right" },
  { id: "right_side", label: "Right side" },
  { id: "dashboard", label: "Dashboard" },
  { id: "odometer", label: "Odometer" },
  { id: "interior", label: "Interior" },
  { id: "wheels", label: "Wheels" },
  { id: "vin_plate", label: "VIN plate" },
] as const;

export type InspectionAngleId = (typeof INSPECTION_ANGLES)[number]["id"];

export const INSPECTION_ANGLE_IDS = INSPECTION_ANGLES.map((angle) => angle.id);

export function getInspectionAngleLabel(id: string): string {
  return INSPECTION_ANGLES.find((angle) => angle.id === id)?.label ?? id;
}

export const INSPECTION_PHOTO_BUCKET = "inspection-photos";

export const INSPECTION_LINK_TTL_HOURS = 72;
