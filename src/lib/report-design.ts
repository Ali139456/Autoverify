import { buildEstimatedFutureValue } from "./autograb";
import type {
  FutureValueInfo,
  FutureValuePoint,
  InspectionPhoto,
  VehicleReport,
} from "./types";

export type InsightStatus = "clear" | "warn" | "info" | "neutral";

export type ReportInsight = {
  id: string;
  title: string;
  status: string;
  /** Secondary line shown beneath the primary status. */
  statusSubtext?: string;
  tone: InsightStatus;
  detail?: string;
};

export type StatusCheck = {
  label: string;
  ok: boolean;
};

const money = (n: number) => `$${n.toLocaleString("en-AU")}`;

export function formatExpiryDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
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

export function buildStatusChecks(report: VehicleReport): StatusCheck[] {
  const { registration, vehicle } = report;

  return [
    {
      label: registration.financeOwing
        ? "Financial encumbrance detected"
        : "No financial encumbrances detected",
      ok: !registration.financeOwing,
    },
    {
      label: registration.writtenOff
        ? "Write-off history recorded"
        : "No write-off history",
      ok: !registration.writtenOff,
    },
    {
      label: vehicle.odometer
        ? "Odometer reading consistent"
        : "Odometer reading not available",
      ok: Boolean(vehicle.odometer),
    },
    {
      label: "Service history available",
      ok: false,
    },
    {
      label: registration.stolen
        ? "Stolen record found"
        : "No stolen record",
      ok: !registration.stolen,
    },
  ];
}

export function buildKeyInsights(report: VehicleReport): ReportInsight[] {
  const { registration, valuation, vehicle, market, ai } = report;
  const future = resolveFutureValue(report);
  const inThreeYears = getFutureValueAtYears(future, 3);

  return [
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
      title: "Odometer",
      status: vehicle.odometer
        ? `${vehicle.odometer.toLocaleString()} km`
        : "Not available",
      tone: vehicle.odometer ? "clear" : "neutral",
      detail: vehicle.odometer
        ? vehicle.odometerSource ??
          "Estimated from vehicle age and market listing data when a live odometer reading is unavailable."
        : "No odometer reading was available from the register or market comparables for this vehicle.",
    },
    {
      id: "ancap",
      title: "ANCAP Safety",
      status: vehicle.ancapRating ?? "Not available",
      tone: vehicle.ancapRating ? "clear" : "neutral",
      detail: vehicle.ancapRating
        ? "ANCAP safety rating sourced from AutoGrab detailed vehicle specifications."
        : "ANCAP rating was not available for this exact vehicle variant in AutoGrab.",
    },
    {
      id: "warranty",
      title: "Warranty Remaining",
      status: vehicle.warrantyRemaining ?? "Not available",
      tone: vehicle.warrantyRemaining ? "clear" : "neutral",
      detail: vehicle.warrantyRemaining
        ? "Factory warranty estimate sourced from AutoGrab build and specification data."
        : "Remaining factory warranty could not be determined for this vehicle.",
    },
    {
      id: "pplate",
      title: "P Plate Legal",
      status: vehicle.pPlateLegal ?? "Not available",
      tone: vehicle.pPlateLegal?.toLowerCase().includes("yes") ? "clear" : "neutral",
      detail: vehicle.pPlateLegal
        ? "Probationary (P plate) eligibility based on vehicle specifications and state restrictions."
        : "P plate eligibility could not be confirmed for this vehicle variant.",
    },
    {
      id: "registration",
      title: "Registration",
      status:
        registration.status === "Registered" ? "Active" : registration.status,
      statusSubtext: registration.expiryDate
        ? `Expiry ${formatExpiryDate(registration.expiryDate)}`
        : undefined,
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
      status: "Not available",
      tone: "neutral",
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
      status: `Retail ${money(valuation.retailLow)}–${money(valuation.retailHigh)} · ${market.activeListings} listings`,
      tone: "neutral",
    },
    {
      id: "specs",
      title: "Specifications",
      status: [vehicle.bodyType, vehicle.engine, vehicle.fuelType]
        .filter(Boolean)
        .join(" · ") || "Available",
      tone: "clear",
    },
    {
      id: "risk",
      title: "Additional Checks",
      status: `${ai.riskLabel} · ${ai.riskScore}/100`,
      tone:
        ai.riskLabel === "Low Risk"
          ? "clear"
          : ai.riskLabel === "Moderate Risk"
            ? "neutral"
            : "warn",
      detail: `Composite risk score out of 100 (lower is better). Factors considered: ${ai.riskFactors.join("; ")}.`,
    },
  ];
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
  return null;
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
