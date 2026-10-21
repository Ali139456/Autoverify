import { buildEstimatedFutureValue } from "./autograb";
import { hasDamageAnalysis, resolveReportTier } from "./pricing";
import {
  evaluateRideShareQuickEligibility,
  type RideShareQuickCheck,
} from "./ride-share-eligibility";
import {
  applyRegistrationExpiryInference,
  registrationDisplayStatus,
} from "./registration-info";
import { resolveVehicleDoorAndSeatCounts } from "./vehicle-door-seats";
import { getInspectionAngleLabel } from "./inspection-angles";
import type {
  DamageFinding,
  FutureValueInfo,
  FutureValuePoint,
  InspectionPhoto,
  ManufacturerWarrantyServiceInfo,
  MarketListing,
  ValuationInfo,
  VehicleIdentity,
  VehicleReport,
} from "./types";

/** Hide "Listed" when AutoGrab leads omit days on market (avoids a column of 0d). */
export function comparableListingsShowDaysListed(
  listings: Pick<MarketListing, "daysListed">[],
): boolean {
  return listings.some((entry) => entry.daysListed > 0);
}

/** `muted`: light grey, data not reported (neither pass nor fault). */
export type InsightStatus = "clear" | "warn" | "info" | "neutral" | "muted";

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
  /** Secondary list under status (e.g. dated odometer readings). */
  listItems?: string[];
};

export type StatusCheck = {
  label: string;
  ok: boolean;
  /** When true, show red X (issue detected). When false with ok false, show neutral grey. */
  issue?: boolean;
  muted?: boolean;
  /** Orange advisory (e.g. data not reported) — neither a pass nor a fault. */
  advisory?: boolean;
};

export const ODOMETER_NO_HISTORY_LABEL = "No odometer history reported";

/** Keep whole words on one line in narrow insight tiles (no require-ments / re-ported). */
export function reportInsightCopy(text: string): string {
  if (!text) return text;
  return text
    .replace(/\bhistory reported\b/gi, "history\u00A0reported")
    .replace(/\bstate specific requirements\b/gi, "state\u00A0specific\u00A0requirements")
    .replace(/\breading reported\b/gi, "reading\u00A0reported")
    .replace(/\bcheck requirements\b/gi, "check\u00A0requirements")
    .replace(/\bSelf reported\b/g, "Self\u00A0reported");
}

export function hasOdometerHistory(vehicle: VehicleReport["vehicle"]): boolean {
  return Boolean(vehicle.odometerHistory && vehicle.odometerHistory.length > 0);
}

/** Latest reading from history when present, otherwise the supplied/estimated odometer. */
export function formatOdometerReading(vehicle: VehicleReport["vehicle"]): string | null {
  return vehicle.odometer ? `${vehicle.odometer.toLocaleString("en-AU")} km` : null;
}

export const ODOMETER_HISTORY_LISTING_LINE =
  "Historical readings from listing records.";

export const ODOMETER_HISTORY_CONSISTENT_STATUS =
  "Odometer history consistent with reading reported at purchase";

export function formatOdometerHistoryEntry(entry: {
  date: string;
  odometer: number;
  source?: string | null;
}): string {
  const date = formatExpiryDate(entry.date);
  const km = `${entry.odometer.toLocaleString("en-AU")} km`;
  const source = entry.source?.trim();
  return source ? `${date} — ${km} · ${source}` : `${date} — ${km}`;
}

export function readingAtPurchaseOfReportDetail(
  vehicle: VehicleReport["vehicle"],
): string | undefined {
  if (vehicle.odometer == null || !Number.isFinite(vehicle.odometer)) {
    return undefined;
  }
  return `Reading at purchase of this report ${vehicle.odometer.toLocaleString("en-AU")}kms.`;
}

export function buildOdometerHistoryInsight(
  vehicle: VehicleReport["vehicle"],
): Pick<
  ReportInsight,
  "status" | "statusSubtext" | "detail" | "tone" | "listItems"
> {
  const history = vehicle.odometerHistory ?? [];
  if (history.length === 0) {
    const purchaseDetail = readingAtPurchaseOfReportDetail(vehicle);
    return {
      status: ODOMETER_NO_HISTORY_LABEL,
      tone: "muted",
      detail:
        purchaseDetail ??
        (formatOdometerReading(vehicle)
          ? `Self reported reading of ${formatOdometerReading(vehicle)} at purchase`
          : undefined),
    };
  }

  return {
    status: ODOMETER_HISTORY_CONSISTENT_STATUS,
    tone: "clear",
  };
}

export function odometerHistoryCountLabel(count: number): string {
  return `${count} historical reading${count === 1 ? "" : "s"} on record.`;
}

const money = (n: number) => `$${n.toLocaleString("en-AU")}`;

export const ANCAP_SAFETY_RATINGS_URL = "https://www.ancap.com.au/safety-ratings";

export const VEHICLE_RECALLS_GOV_AU_URL = "https://www.vehiclerecalls.gov.au";

export const SERVICE_HISTORY_DETAIL =
  "Contact the vehicle owner or selling dealer for service history records and review owners manual/vehicle handbook for servicing intervals and guidelines.";

export const MANUFACTURER_WARRANTY_CONFIRM_DETAIL =
  "Contact Authorised Dealer/service centre and quote VIN to confirm remaining Manufacturer's warranty.";

/** Warranty remaining / expiry line for the overview block (when AutoGrab supplies a value). */
export function formatWarrantyRemainingDisplay(
  warrantyRemaining: string | null | undefined,
): string | null {
  const raw = warrantyRemaining?.trim();
  if (!raw) return null;
  if (/^\d{4}-\d{2}-\d{2}/.test(raw)) {
    return formatExpiryDate(raw);
  }
  return raw;
}

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

function formatRegistrationPlateOverview(vehicle: VehicleIdentity): string {
  const rego = vehicle.rego?.trim();
  if (!rego) return "—";
  return rego.toUpperCase();
}

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
      label: "Registration plate",
      value: formatRegistrationPlateOverview(vehicle),
    },
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

/** Sale / listing price from checkout (handles numeric strings in stored JSON). */
export function resolveAdvertisedListingPrice(
  report: Pick<VehicleReport, "advertisedPrice">,
): number | null {
  const raw: unknown = report.advertisedPrice;
  if (raw == null || raw === "") return null;
  const parsed =
    typeof raw === "number" ? raw : Number(String(raw).replace(/[^\d.]/g, ""));
  if (!Number.isFinite(parsed) || parsed <= 0) return null;
  return Math.round(parsed);
}

function scaleValuationBands(
  valuation: ValuationInfo,
  anchorRetailMid: number,
): ValuationInfo {
  const retailMid = (valuation.retailLow + valuation.retailHigh) / 2;
  if (!Number.isFinite(retailMid) || retailMid <= 0) return valuation;
  const factor = anchorRetailMid / retailMid;
  if (!Number.isFinite(factor) || Math.abs(factor - 1) < 0.04) {
    return valuation;
  }
  const scale = (amount: number) => Math.round(amount * factor);
  return {
    retailLow: scale(valuation.retailLow),
    retailHigh: scale(valuation.retailHigh),
    tradeLow: scale(valuation.tradeLow),
    tradeHigh: scale(valuation.tradeHigh),
    privateLow: scale(valuation.privateLow),
    privateHigh: scale(valuation.privateHigh),
    confidence: valuation.confidence,
  };
}

function marketComparableMidPrice(report: VehicleReport): number | null {
  const listings = report.market?.comparableListings ?? [];
  const prices = listings
    .map((entry) => entry.price)
    .filter((price) => Number.isFinite(price) && price > 0);
  if (prices.length >= 3) {
    const sorted = [...prices].sort((a, b) => a - b);
    return sorted[Math.floor(sorted.length / 2)] ?? null;
  }
  const median = report.market?.medianPrice;
  if (median != null && Number.isFinite(median) && median > 0) {
    return Math.round(median);
  }
  const average = report.market?.averagePrice;
  if (average != null && Number.isFinite(average) && average > 0) {
    return Math.round(average);
  }
  return null;
}

/** Present-value bands for display — aligned to listing or live comparables when catalogue is low. */
export function resolveValuation(report: VehicleReport): ValuationInfo {
  const listing = resolveAdvertisedListingPrice(report);
  if (listing != null) {
    return scaleValuationBands(report.valuation, listing);
  }

  const marketMid = marketComparableMidPrice(report);
  if (marketMid != null) {
    const retailMid =
      (report.valuation.retailLow + report.valuation.retailHigh) / 2;
    if (retailMid > 0 && marketMid / retailMid >= 1.2) {
      return scaleValuationBands(report.valuation, marketMid);
    }
  }

  return report.valuation;
}

export function presentValuationNote(report: VehicleReport): string | null {
  const listing = resolveAdvertisedListingPrice(report);
  if (listing != null) {
    return `Valuation bands are aligned to your listing price of $${listing.toLocaleString("en-AU")}. Automated catalogue estimates can sit below live asking prices for some variants.`;
  }

  const resolved = resolveValuation(report);
  const rawMid =
    (report.valuation.retailLow + report.valuation.retailHigh) / 2;
  const resolvedMid = (resolved.retailLow + resolved.retailHigh) / 2;
  if (resolvedMid > rawMid * 1.15) {
    const marketMid = marketComparableMidPrice(report);
    if (marketMid != null) {
      return `Valuation bands are aligned to comparable vehicles currently listed (around $${marketMid.toLocaleString("en-AU")}). The automated catalogue estimate was lower than live market for this model.`;
    }
  }

  return null;
}

/** Re-anchors the full forecast curve to the customer's listing / sale price. */
function anchorFutureValueToListingPrice(
  future: FutureValueInfo,
  listingPrice: number,
  fallbackOdometer: number,
): FutureValueInfo {
  const price = Math.round(listingPrice);
  const predictions = [...future.predictions].sort(
    (a, b) => a.yearsAhead - b.yearsAhead,
  );

  if (!predictions.length) {
    return {
      ...future,
      predictions: [
        {
          yearsAhead: 0,
          odometer: Math.round(fallbackOdometer),
          value: price,
          confidence: 0.75,
        },
      ],
    };
  }

  const basePoint =
    predictions.find((point) => point.yearsAhead === 0) ?? predictions[0];
  const baseValue = basePoint.value;

  if (!Number.isFinite(baseValue) || baseValue <= 0) {
    const today: FutureValuePoint = {
      yearsAhead: 0,
      odometer: Math.round(basePoint.odometer ?? fallbackOdometer),
      value: price,
      confidence: basePoint.confidence ?? 0.75,
    };
    const index = predictions.findIndex((point) => point.yearsAhead === 0);
    if (index >= 0) {
      predictions[index] = today;
    } else {
      predictions.unshift(today);
    }
    return { ...future, predictions };
  }

  const scale = price / baseValue;
  const rescaled = predictions.map((point) => ({
    ...point,
    value: Math.max(1, Math.round(point.value * scale)),
  }));

  const todayIndex = rescaled.findIndex((point) => point.yearsAhead === 0);
  if (todayIndex >= 0) {
    rescaled[todayIndex] = { ...rescaled[todayIndex], value: price };
  } else {
    rescaled.unshift({
      yearsAhead: 0,
      odometer: Math.round(basePoint.odometer ?? fallbackOdometer),
      value: price,
      confidence: basePoint.confidence ?? 0.75,
    });
    rescaled.sort((a, b) => a.yearsAhead - b.yearsAhead);
  }

  return { ...future, predictions: rescaled };
}

export function futureValueForecastNote(report: VehicleReport): string {
  const listing = resolveAdvertisedListingPrice(report);
  if (listing != null) {
    return `Forecast anchored to your listing price of $${listing.toLocaleString("en-AU")}. Future years follow the same depreciation curve from that starting point.`;
  }
  return "This forecast uses predicted market value. If you have not purchased yet, compare it to the advertised listing price — enter that price when you order your report to anchor the forecast to what you expect to pay.";
}

export function resolveFutureValue(report: VehicleReport): FutureValueInfo {
  const listingPrice = resolveAdvertisedListingPrice(report);
  const initialKms =
    report.vehicle.odometer ??
    Math.max(new Date().getFullYear() - report.vehicle.year, 1) * 12000;

  let future: FutureValueInfo;
  if (report.futureValue?.predictions?.length) {
    future = report.futureValue;
  } else {
    future = buildEstimatedFutureValue(
      report.vehicle,
      resolveValuation(report),
      listingPrice,
    );
  }

  if (listingPrice != null) {
    future = anchorFutureValueToListingPrice(future, listingPrice, initialKms);
  } else {
    const marketMid = marketComparableMidPrice(report);
    const today = getFutureValueAtYears(future, 0);
    const todayValue = today?.value ?? 0;
    if (
      marketMid != null &&
      todayValue > 0 &&
      marketMid / todayValue >= 1.2
    ) {
      future = anchorFutureValueToListingPrice(future, marketMid, initialKms);
    }
  }

  return future;
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

function formatManufacturerWarrantyStatus(
  info: ManufacturerWarrantyServiceInfo | null | undefined,
): Pick<ReportInsight, "status" | "statusSubtext" | "tone" | "detail"> {
  if (!info) {
    return {
      status: "",
      tone: "muted",
      detail: MANUFACTURER_WARRANTY_CONFIRM_DETAIL,
    };
  }
  const years =
    info.warrantyYears != null
      ? `${info.warrantyYears} year${info.warrantyYears === 1 ? "" : "s"}`
      : null;
  const km =
    info.warrantyKmUnlimited
      ? "unlimited kilometres"
      : info.warrantyKm != null
        ? `${info.warrantyKm.toLocaleString("en-AU")} km`
        : null;
  let status = "";
  if (years && km) status = `${years}/${km}`;
  else if (years) status = years;
  else if (km) status = km;
  const anti =
    info.warrantyAntiCorrosionYears != null
      ? `${info.warrantyAntiCorrosionYears} year${info.warrantyAntiCorrosionYears === 1 ? "" : "s"} anti corrosion`
      : undefined;
  if (!status && !anti) {
    return {
      status: "",
      tone: "muted",
      detail: MANUFACTURER_WARRANTY_CONFIRM_DETAIL,
    };
  }
  return {
    status: status || anti || "",
    statusSubtext: status && anti ? anti : undefined,
    tone: "clear",
    detail: MANUFACTURER_WARRANTY_CONFIRM_DETAIL,
  };
}

function formatServicingGuidelines(
  info: ManufacturerWarrantyServiceInfo | null | undefined,
): Pick<ReportInsight, "status" | "statusSubtext" | "tone" | "detail"> {
  const serviceHistoryNote = SERVICE_HISTORY_DETAIL;
  if (!info) {
    return {
      status: "",
      tone: "muted",
      detail: serviceHistoryNote,
    };
  }
  const km =
    info.regularServiceKm != null
      ? `Every ${info.regularServiceKm.toLocaleString("en-AU")} km`
      : null;
  const months =
    info.regularServiceMonths != null
      ? `Every ${info.regularServiceMonths} month${info.regularServiceMonths === 1 ? "" : "s"}`
      : null;
  if (!km && !months) {
    return {
      status: "",
      tone: "muted",
      detail: serviceHistoryNote,
    };
  }
  const combined =
    km && months
      ? `${km} or ${months}, whichever comes first.`
      : (km ?? months ?? "");
  return {
    status: combined,
    statusSubtext: undefined,
    tone: "clear",
    detail: serviceHistoryNote,
  };
}

function buildRideShareKeyInsight(report: VehicleReport): ReportInsight {
  const check = evaluateRideShareQuickEligibility(
    report.vehicle,
    report,
    new Date(report.createdAt).getFullYear(),
  );

  const quickLine = (
    label: string,
    result: RideShareQuickCheck,
  ): ReportInsightLine => {
    if (result === "eligible") {
      return { text: `${label} — eligible`, variant: "eligible" };
    }
    if (result === "ineligible") {
      return { text: `${label} — ineligible`, variant: "ineligible" };
    }
    return { text: `${label} — check requirements`, variant: "action" };
  };

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
        {
          text: "Check state specific requirements",
          variant: "action",
        },
        { text: "Refer table below.", variant: "action" },
      ],
    };
  }

  return {
    id: "rideshare",
    title: "Ride Share Eligibility",
    status: "Quick checks not met",
    tone: "neutral",
    lines: [
      quickLine("Age", check.ageCheck),
      quickLine("Doors", check.doorsCheck),
      quickLine("Passenger capacity", check.passengersCheck),
      {
        text: "Check state specific requirements",
        variant: "action",
      },
    ],
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
      issue: registration.writtenOff,
    },
    {
      label: registration.stolen
        ? "Stolen record found"
        : "No stolen record",
      ok: !registration.stolen,
      issue: registration.stolen,
    },
    hasOdometerHistory(vehicle)
      ? { label: "Odometer history consistent", ok: true }
      : {
          label: `Odometer history — ${ODOMETER_NO_HISTORY_LABEL}`,
          ok: false,
          advisory: true,
        },
  ];
}

export function rideShareInsightColumnIndex(insights: ReportInsight[]): number {
  const idx = insights.findIndex((i) => i.id === "rideshare");
  return idx >= 0 ? idx % 4 : 0;
}

export function buildKeyInsights(report: VehicleReport): ReportInsight[] {
  const { vehicle, market } = report;
  const valuation = resolveValuation(report);
  const registration = applyRegistrationExpiryInference(report.registration);
  const future = resolveFutureValue(report);
  const inThreeYears = getFutureValueAtYears(future, 3);

  const insights: ReportInsight[] = [
    {
      id: "ppsr",
      title: "PPSR / Finance",
      status: registration.financeOwing
        ? "Encumbered - Finance owing"
        : "Clear",
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
      ...buildOdometerHistoryInsight(vehicle),
    },
    {
      id: "ancap",
      title: "ANCAP Safety",
      status: vehicle.ancapRating ?? "",
      tone: vehicle.ancapRating ? "clear" : "muted",
      detail: vehicle.ancapRating
        ? "ANCAP safety rating sourced from AutoGrab detailed vehicle specifications."
        : undefined,
    },
    {
      id: "registration",
      title: "Registration",
      status: registrationDisplayStatus(registration),
      statusSubtext: vehicle.state,
      detail: registration.expiryDate
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
            ? ""
            : "Check with Govt Database",
      statusSubtext:
        registration.hasSafetyRecalls === true
          ? "Safety recall flagged on PPSR / NEVDIS"
          : registration.hasSafetyRecalls === false
            ? undefined
            : "Recall data unavailable for this vehicle",
      tone: registration.hasSafetyRecalls
        ? "warn"
        : registration.hasSafetyRecalls === false
          ? "muted"
          : "neutral",
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
      id: "warranty-status",
      title: "Warranty Status",
      ...formatManufacturerWarrantyStatus(report.manufacturerWarrantyService),
    },
    {
      id: "servicing-guidelines",
      title: "Servicing Guidelines and Service History",
      ...formatServicingGuidelines(report.manufacturerWarrantyService),
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
function normalizePanelMatchText(value: string): string {
  return value.trim().toLowerCase().replace(/[_-]+/g, " ");
}

/** Prefer explicit panel → angle mapping so "Front bumper" does not tag every front corner shot. */
const DAMAGE_PANEL_TO_ANGLE_IDS: Record<string, readonly string[]> = {
  "front bumper": ["front"],
  "rear left door": ["rear_left"],
};

function inspectionPhotoMatchesPanel(
  photo: InspectionPhoto,
  panel: string,
): boolean {
  const key = normalizePanelMatchText(panel);
  if (!key) return false;

  const mapped = DAMAGE_PANEL_TO_ANGLE_IDS[key];
  if (mapped) {
    return mapped.includes(photo.angle);
  }

  const label = normalizePanelMatchText(photo.label);
  const angle = normalizePanelMatchText(photo.angle);
  const angleLabel = normalizePanelMatchText(getInspectionAngleLabel(photo.angle));

  const candidates = [label, angle, angleLabel].filter(Boolean);
  return candidates.some((candidate) => candidate === key);
}

export function findInspectionPhotoForPanel(
  photos: InspectionPhoto[],
  panel: string,
): InspectionPhoto | undefined {
  return photos.find((photo) => inspectionPhotoMatchesPanel(photo, panel));
}

/** Maps each inspection photo angle to a damage caption when Ravin panel names differ from angle ids. */
export function buildDamageCaptionByPhotoAngle(
  findings: DamageFinding[],
  photos: InspectionPhoto[],
): Map<string, string> {
  const map = new Map<string, string>();
  for (const finding of findings) {
    const caption = `${finding.type} · ${finding.severity}`;
    map.set(finding.panel.trim().toLowerCase(), caption);
    const matched = findInspectionPhotoForPanel(photos, finding.panel);
    if (matched) {
      map.set(matched.angle.trim().toLowerCase(), caption);
    }
  }
  return map;
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
    case "muted":
      return "text-slate-400";
    default:
      return "text-amber-600";
  }
}
