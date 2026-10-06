import { buildEstimatedFutureValue } from "./autograb";
import { hasDamageAnalysis, resolveReportTier } from "./pricing";
import { evaluateRideShareQuickEligibility } from "./ride-share-eligibility";
import { resolveVehicleDoorAndSeatCounts } from "./vehicle-door-seats";
import type {
  FutureValueInfo,
  FutureValuePoint,
  InspectionPhoto,
  VehicleIdentity,
  VehicleReport,
} from "./types";

export type InsightStatus = "clear" | "warn" | "info" | "neutral";

export type ReportInsightLineVariant =
  | "eligible"
  | "action"
  | "ineligible"
  | "muted";

export type ReportInsightLine = {
  text: string;
  variant: ReportInsightLineVariant;
};

export type ReportInsight = {
  id: string;
  title: string;
  status: string;
  /** Secondary line shown beneath the primary status. */
  statusSubtext?: string;
  tone: InsightStatus;
  detail?: string;
  /** Multi-line body (e.g. ride share quick checks). Replaces default status row when set. */
  lines?: ReportInsightLine[];
};

export type StatusCheck = {
  label: string;
  ok: boolean;
  /** When true, show red X (issue detected). When false with ok false, show neutral grey. */
  issue?: boolean;
  muted?: boolean;
};

const money = (n: number) => `$${n.toLocaleString("en-AU")}`;

export const ANCAP_SAFETY_RATINGS_URL = "https://www.ancap.com.au/safety-ratings";

export const MANUFACTURERS_WARRANTY_NOTICE =
  "Contact Authorised Dealer/service centre and quote VIN to confirm remaining Manufacturer's warranty.";

/** Registration expiry for reports: DD-MM-YYYY (e.g. 16-02-2027). */
export function formatExpiryDate(iso: string): string {
  const trimmed = iso.trim();
  const ymd = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (ymd) {
    return `${ymd[3]}-${ymd[2]}-${ymd[1]}`;
  }
  const date = new Date(trimmed);
  if (Number.isNaN(date.getTime())) return trimmed;
  const day = String(date.getUTCDate()).padStart(2, "0");
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const year = date.getUTCFullYear();
  return `${day}-${month}-${year}`;
}

export { resolveVehicleDoorAndSeatCounts } from "./vehicle-door-seats";

export function buildReportOverviewSpecs(
  vehicle: VehicleIdentity,
  report?: Pick<VehicleReport, "vehicleSpec">,
): { label: string; value: string }[] {
  const { doors, passengers } = resolveVehicleDoorAndSeatCounts(vehicle, report);
  return [
    { label: "Make", value: vehicle.make },
    { label: "Model", value: vehicle.model },
    { label: "Badge", value: vehicle.variant || "—" },
    { label: "Year", value: String(vehicle.year) },
    { label: "VIN", value: vehicle.vin || "—" },
    {
      label: "Odometer",
      value: vehicle.odometer ? `${vehicle.odometer.toLocaleString()} km` : "—",
    },
    { label: "Doors", value: doors },
    { label: "Seat capacity", value: passengers },
    { label: "Colour", value: vehicle.colour?.trim() || "—" },
    { label: "Body", value: vehicle.bodyType?.trim() || "—" },
    { label: "Fuel", value: vehicle.fuelType?.trim() || "—" },
  ];
}

export function formatPPlateStatus(vehicle: VehicleIdentity): string {
  const raw = vehicle.pPlateLegal?.trim();
  if (raw) return raw;
  return "Check state restrictions for P plate drivers";
}

export function resolveFutureValue(report: VehicleReport): FutureValueInfo {
  if (report.futureValue?.predictions?.length) {
    return report.futureValue;
  }
  return buildEstimatedFutureValue(report.vehicle, report.valuation);
}

export function getFutureValueAtYears(
  future: FutureValueInfo,
  yearsAhead: number,
): FutureValuePoint | undefined {
  return future.predictions.find((point) => point.yearsAhead === yearsAhead);
}

export function futureValueConfidenceLabel(future: FutureValueInfo): string {
  const present = getFutureValueAtYears(future, 0);
  const score = present?.confidence ?? 0;
  if (future.source === "autograb" && score >= 0.85) return "High";
  if (future.source === "autograb") return "Medium";
  return "Estimated";
}

function buildRideShareKeyInsight(report: VehicleReport): ReportInsight {
  const check = evaluateRideShareQuickEligibility(
    report.vehicle,
    report,
    new Date(report.createdAt).getFullYear(),
  );

  const quickLine = (label: string, eligible: boolean): ReportInsightLine => ({
    text: eligible ? `${label} — eligible` : `${label} — check requirements`,
    variant: eligible ? "eligible" : "ineligible",
  });

  if (check.allEligible) {
    return {
      id: "rideshare",
      title: "Ride Share Eligibility",
      status: "",
      tone: "clear",
      lines: [
        { text: "Age — eligible", variant: "eligible" },
        { text: "Doors — eligible", variant: "eligible" },
        { text: "Passenger capacity — eligible", variant: "eligible" },
        { text: "Check remaining requirements", variant: "action" },
      ],
      detail: "Refer table below.",
    };
  }

  return {
    id: "rideshare",
    title: "Ride Share Eligibility",
    status: "Quick checks not met",
    tone: "neutral",
    lines: [
      quickLine("Age", check.ageEligible),
      quickLine("Doors", check.doorsEligible),
      quickLine("Passenger capacity", check.passengersEligible),
    ],
    detail: "See the ride share requirements table below.",
  };
}

export function buildStatusChecks(report: VehicleReport): StatusCheck[] {
  const { registration, vehicle } = report;

  return [
    {
      label: registration.financeOwing
        ? "Financial encumbrance detected"
        : "No financial encumbrances detected",
      ok: !registration.financeOwing,
      issue: registration.financeOwing,
    },
    {
      label: registration.writtenOff
        ? "Write-off history recorded"
        : "No write-off history",
      ok: !registration.writtenOff,
    },
    {
      label: registration.stolen
        ? "Stolen record found"
        : "No stolen record",
      ok: !registration.stolen,
    },
    {
      label: vehicle.odometer
        ? "Odometer reading consistent"
        : "Odometer reading not available",
      ok: Boolean(vehicle.odometer),
    },
    {
      label: "Service history available at dealer",
      ok: false,
      muted: true,
    },
  ];
}

export function buildKeyInsights(report: VehicleReport): ReportInsight[] {
  const { registration, valuation, vehicle, market } = report;
  const future = resolveFutureValue(report);
  const inThreeYears = getFutureValueAtYears(future, 3);

  const insights: ReportInsight[] = [
    {
      id: "ppsr",
      title: "PPSR / Finance",
      status: registration.financeOwing ? "Encumbered" : "Clear",
      tone: registration.financeOwing ? "warn" : "clear",
    },
    {
      id: "stolen",
      title: "Stolen Check",
      status: registration.stolen ? "Record found" : "Clear",
      tone: registration.stolen ? "warn" : "clear",
    },
    {
      id: "writeoff",
      title: "Written-Off",
      status: registration.writtenOff ? "Recorded" : "Clear",
      tone: registration.writtenOff ? "warn" : "clear",
    },
    {
      id: "odometer",
      title: "Odometer history",
      status: vehicle.odometer
        ? `${vehicle.odometer.toLocaleString()} km`
        : "No odometer history reported",
      tone: vehicle.odometer ? "clear" : "neutral",
      detail: vehicle.odometer
        ? vehicle.odometerSource ??
          "Estimated from vehicle age and market listing data when a live odometer reading is unavailable."
        : undefined,
    },
    {
      id: "ancap",
      title: "ANCAP Safety",
      status: vehicle.ancapRating ?? "Not available",
      tone: vehicle.ancapRating ? "clear" : "neutral",
      detail: vehicle.ancapRating
        ? "ANCAP safety rating sourced from AutoGrab detailed vehicle specifications."
        : undefined,
    },
    {
      id: "registration",
      title: "Registration",
      status:
        registration.status === "Registered" ? "Active" : registration.status,
      statusSubtext: registration.expiryDate
        ? `${vehicle.state} · Expiry ${formatExpiryDate(registration.expiryDate)}`
        : vehicle.state,
      tone: registration.status === "Registered" ? "clear" : "warn",
    },
    {
      id: "recall",
      title: "Recall Check",
      status:
        registration.hasSafetyRecalls === true
          ? "Recalls found"
          : registration.hasSafetyRecalls === false
            ? "Clear"
            : "Check with Govt Database",
      statusSubtext:
        registration.hasSafetyRecalls === true
          ? "Safety recall flagged on PPSR / NEVDIS"
          : registration.hasSafetyRecalls === false
            ? "No recalls on PPSR / NEVDIS certificate"
            : "Recall data unavailable for this vehicle",
      tone: registration.hasSafetyRecalls ? "warn" : "clear",
    },
    {
      id: "service",
      title: "Service History",
      status: "Available at dealer",
      tone: "neutral",
      detail: "Contact the selling dealer for full service history records.",
    },
    {
      id: "future",
      title: "Future Value",
      status: inThreeYears
        ? `${money(inThreeYears.value)} in 3 yrs`
        : "Forecast unavailable",
      statusSubtext: inThreeYears
        ? `Assumed ${inThreeYears.odometer.toLocaleString()} km`
        : undefined,
      tone: "info",
    },
    {
      id: "market",
      title: "Market Insights",
      status: `Retail ${money(valuation.retailLow)}–${money(valuation.retailHigh)}`,
      statusSubtext: `${market.activeListings.toLocaleString("en-AU")} listings`,
      tone: "clear",
    },
    {
      id: "specs",
      title: "Specifications",
      status: [vehicle.bodyType, vehicle.engine, vehicle.fuelType]
        .filter(Boolean)
        .join(" · ") || "Available",
      tone: "clear",
    },
    buildRideShareKeyInsight(report),
  ];

  const tier = resolveReportTier(report.tier);
  const includeFutureValue = hasDamageAnalysis(tier);

  return insights.filter((insight) => {
    if (insight.id === "risk") return false;
    if (insight.id === "future" && !includeFutureValue) return false;
    if (includeFutureValue && (insight.id === "future" || insight.id === "market")) {
      return false;
    }
    return true;
  });
}

/** Public report reference: AV-{rego} or AV-{last 4 of VIN} when rego is unavailable. */
export function formatReportReference(vehicle: {
  rego?: string | null;
  vin?: string | null;
}): string {
  const rego = vehicle.rego?.trim();
  if (rego) {
    return `AV-${rego.toUpperCase()}`;
  }
  const vinCompact = (vehicle.vin ?? "").replace(/[^a-zA-Z0-9]/g, "");
  const lastFour = vinCompact.slice(-4).toUpperCase();
  if (lastFour.length === 4) {
    return `AV-${lastFour}`;
  }
  return lastFour ? `AV-${lastFour}` : "AV-—";
}

export function formatReportDate(iso: string): string {
  return new Date(iso)
    .toLocaleDateString("en-AU", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
    .toUpperCase();
}

export function getInspectionPhotoUrl(photo: InspectionPhoto): string | null {
  if (photo.externalUrl?.startsWith("http")) return photo.externalUrl;
  if (photo.storagePath.startsWith("http")) return photo.storagePath;
  if (photo.storagePath.startsWith("/")) return photo.storagePath;
  return null;
}

/** Match a walkaround photo to a damage panel label when possible. */
export function findInspectionPhotoForPanel(
  photos: InspectionPhoto[],
  panel: string,
): InspectionPhoto | undefined {
  const key = panel.trim().toLowerCase();
  if (!key) return undefined;

  return photos.find((photo) => {
    const label = photo.label.trim().toLowerCase();
    const angle = photo.angle.trim().toLowerCase();
    return (
      label === key ||
      angle === key ||
      label.includes(key) ||
      key.includes(label) ||
      angle.includes(key) ||
      key.includes(angle)
    );
  });
}

export function resolveDamageFindingImageUrl(
  finding: { panel: string; imageUrl?: string | null },
  photos: InspectionPhoto[],
): string | null {
  if (finding.imageUrl?.startsWith("http") || finding.imageUrl?.startsWith("/")) {
    return finding.imageUrl;
  }
  const matched = findInspectionPhotoForPanel(photos, finding.panel);
  return matched ? getInspectionPhotoUrl(matched) : null;
}

export function insightToneClass(tone: InsightStatus): string {
  switch (tone) {
    case "clear":
      return "text-emerald-600";
    case "warn":
      return "text-red-600";
    case "info":
      return "text-sky-600";
    default:
      return "text-amber-600";
  }
}
