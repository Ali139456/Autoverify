import type { InspectionPhoto, VehicleReport } from "./types";

export type InsightStatus = "clear" | "warn" | "info" | "neutral";

export type ReportInsight = {
  id: string;
  title: string;
  status: string;
  tone: InsightStatus;
};

export type StatusCheck = {
  label: string;
  ok: boolean;
};

const money = (n: number) => `$${n.toLocaleString("en-AU")}`;

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
        ? "Odometer reading recorded"
        : "Odometer reading not available",
      ok: Boolean(vehicle.odometer),
    },
    {
      label: "Service history not available in this report",
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
  const privateMid = Math.round((valuation.privateLow + valuation.privateHigh) / 2);

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
    },
    {
      id: "service",
      title: "Service History",
      status: "Not available",
      tone: "neutral",
    },
    {
      id: "registration",
      title: "Registration",
      status:
        registration.status === "Registered"
          ? `Active${registration.expiryDate ? ` · exp ${registration.expiryDate}` : ""}`
          : registration.status,
      tone: registration.status === "Registered" ? "clear" : "warn",
    },
    {
      id: "recall",
      title: "Recall Check",
      status: "Check with Govt Database · Clear",
      tone: "clear",
    },
    {
      id: "ownership",
      title: "Ownership History",
      status: "Not available",
      tone: "info",
    },
    {
      id: "usage",
      title: "Usage Type",
      status: "Private",
      tone: "neutral",
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
