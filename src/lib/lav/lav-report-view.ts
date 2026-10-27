import {
  formatExpiryDate,
  formatReportReference,
  getInspectionPhotoUrl,
} from "@/lib/report-design";
import { LAV_DIGITAL_INSPECTION_ANGLES } from "@/lib/inspection-angles";
import type {
  DamageAnalysis,
  InspectionPhoto,
  VehicleReport,
} from "@/lib/types";

export const LAV_ASSET_TYPE_OPTIONS = [
  "Car",
  "Bike",
  "Caravan",
  "Heavy Vehicle",
  "Boat",
  "Equipment",
  "Other",
] as const;

export type LavConditionGrade = "good" | "fair" | "poor";

export type LavReportPhotoSlot = {
  angleId: string;
  title: string;
  photo: InspectionPhoto | null;
};

const WALKAROUND_ANGLES = [
  { id: "front", title: "Front" },
  { id: "left_side", title: "Left passenger side" },
  { id: "rear", title: "Rear" },
  { id: "right_side", title: "Right driver side" },
] as const;

const ID_ANGLES = [
  { id: "vin_plate", title: "VIN identification" },
  { id: "dashboard", title: "Odometer reading" },
  { id: "service_record", title: "Registration papers" },
] as const;

function normalizeAssetType(raw: string | undefined): string {
  const t = raw?.trim() || "Car";
  const match = LAV_ASSET_TYPE_OPTIONS.find(
    (o) => o.toLowerCase() === t.toLowerCase(),
  );
  return match ?? "Other";
}

function photoForAngle(
  photos: InspectionPhoto[],
  angleId: string,
): InspectionPhoto | null {
  return (
    photos.find((p) => p.angle.trim().toLowerCase() === angleId) ?? null
  );
}

export function resolveLavConditionGrade(
  damage: DamageAnalysis | null | undefined,
): LavConditionGrade | null {
  if (!damage?.overallCondition) return null;
  const o = damage.overallCondition;
  if (o === "Excellent" || o === "Good") return "good";
  if (o === "Fair") return "fair";
  return "poor";
}

function panelMatchesAngle(panel: string, angleId: string): boolean {
  const p = panel.trim().toLowerCase();
  const id = angleId.toLowerCase();
  if (id === "front") return p.includes("front");
  if (id === "rear") return p.includes("rear");
  if (id === "left_side")
    return p.includes("passenger") || p.includes("left");
  if (id === "right_side") return p.includes("driver") || p.includes("right");
  return false;
}

export function lavDamageLabelForAngle(
  angleId: string,
  damage: DamageAnalysis | null | undefined,
): string {
  if (!damage?.findings?.length) return "No damage detected";
  const hit = damage.findings.some((f) => panelMatchesAngle(f.panel, angleId));
  return hit ? "Damage detected" : "No damage detected";
}

export function buildLavReportViewModel(
  report: VehicleReport,
  photos: InspectionPhoto[],
  damage: DamageAnalysis | null | undefined,
) {
  const v = report.lavVerification;
  const vehicle = report.vehicle;
  const regoPlate = v?.rego?.trim() || vehicle.rego?.trim() || "—";
  const regoState = v?.state?.trim() || vehicle.state?.trim() || "";
  const expiry = report.registration.expiryDate?.trim()
    ? formatExpiryDate(report.registration.expiryDate)
    : "—";
  const odometer =
    vehicle.odometer != null
      ? `${vehicle.odometer.toLocaleString("en-AU")} km`
      : "—";

  const heroPhoto =
    photoForAngle(photos, "front") ??
    photos.find((p) => getInspectionPhotoUrl(p)) ??
    null;

  const walkaround: LavReportPhotoSlot[] = WALKAROUND_ANGLES.map((slot) => ({
    angleId: slot.id,
    title: slot.title,
    photo: photoForAngle(photos, slot.id),
  }));

  const identification: LavReportPhotoSlot[] = ID_ANGLES.map((slot) => ({
    angleId: slot.id,
    title: slot.title,
    photo: photoForAngle(photos, slot.id),
  }));

  const expectedAngles = LAV_DIGITAL_INSPECTION_ANGLES.length;
  const uploadedAngles = new Set(
    photos.map((p) => p.angle.trim().toLowerCase()),
  ).size;

  return {
    reportRef: formatReportReference(vehicle),
    title: "Lender Asset Verification Inspection Report",
    assetType: normalizeAssetType(report.lavContext?.assetType),
    assetTypes: LAV_ASSET_TYPE_OPTIONS,
    bookingRef: report.lavContext?.bookingRef ?? null,
    make: v?.vehicleMake?.trim() || vehicle.make,
    model: v?.vehicleModel?.trim() || vehicle.model,
    badge: v?.badge?.trim() || vehicle.variant?.trim() || "—",
    year:
      v?.buildOrCompliance?.trim() ||
      (vehicle.year ? String(vehicle.year) : "—"),
    vin: v?.vin?.trim() || vehicle.vin?.trim() || "—",
    regoPlate,
    regoState,
    regoDisplay: regoState ? `${regoPlate} ${regoState}` : regoPlate,
    registrationExpiry: expiry,
    odometer,
    body: vehicle.bodyType?.trim() || "—",
    colour: v?.colour?.trim() || vehicle.colour?.trim() || "—",
    conditionGrade: resolveLavConditionGrade(damage),
    inspectorComments: "Inspector comments not supplied.",
    aiScanSummary:
      damage?.findings?.length && damage.findings.length > 0
        ? "Damage detected on one or more panels — see panel results below."
        : damage
          ? "No significant damage detected"
          : "Awaiting AI damage scan",
    heroPhoto,
    walkaround,
    identification,
    captureProgress: `${uploadedAngles} / ${expectedAngles}`,
    hasPhotos: photos.length > 0,
  };
}

export type LavReportViewModel = ReturnType<typeof buildLavReportViewModel>;
