export type AustralianState =
  | "ACT"
  | "NSW"
  | "NT"
  | "QLD"
  | "SA"
  | "TAS"
  | "VIC"
  | "WA";

export interface VehicleIdentity {
  rego: string;
  state: AustralianState;
  vin: string;
  make: string;
  model: string;
  variant: string;
  series: string;
  year: number;
  bodyType: string;
  fuelType: string;
  transmission: string;
  engine: string;
  colour: string;
  odometer: number | null;
  /** Where the odometer reading came from, when known. */
  odometerSource?: string | null;
  ancapRating?: string | null;
  warrantyRemaining?: string | null;
  pPlateLegal?: string | null;
  /** Primary listing photo from AutoGrab market/history data. */
  heroImageUrl?: string | null;
}

export interface RegistrationInfo {
  status: "Registered" | "Unregistered" | "Suspended" | "Expired";
  expiryDate: string | null;
  stolen: boolean;
  writtenOff: boolean;
  writeOffDetails: string | null;
  ppsrEncumbrance: boolean;
  financeOwing: boolean;
  financeDetails: string | null;
  /** Safety recalls flagged on the PPSR / NEVDIS certificate when available. */
  hasSafetyRecalls?: boolean | null;
}

export interface ValuationInfo {
  retailLow: number;
  retailHigh: number;
  tradeLow: number;
  tradeHigh: number;
  privateLow: number;
  privateHigh: number;
  confidence: "High" | "Medium" | "Low";
}

export interface FutureValuePoint {
  /** Years from today (0 = present). */
  yearsAhead: number;
  odometer: number;
  value: number;
  confidence: number;
}

export interface FutureValueInfo {
  source: "autograb" | "estimated";
  yearlyKms: number;
  predictions: FutureValuePoint[];
}

export interface MarketListing {
  title: string;
  price: number;
  odometer: number;
  location: string;
  daysListed: number;
}

export interface MarketInfo {
  averagePrice: number;
  medianPrice: number;
  averageOdometer?: number;
  coverImageUrl?: string;
  activeListings: number;
  averageDaysOnMarket: number;
  comparableListings: MarketListing[];
}

export interface AiInsights {
  riskScore: number; // 0-100, lower = safer
  riskLabel: "Low Risk" | "Moderate Risk" | "High Risk";
  riskFactors: string[];
  buyRecommendation: string;
  summary: string;
}

export interface DamageFinding {
  panel: string;
  type: string;
  severity: "Minor" | "Moderate" | "Severe";
  confidence: number;
  repairEstimate: number;
  description?: string;
}

export interface DamageAnalysis {
  analyzedPhotos: number;
  findings: DamageFinding[];
  overallCondition: "Excellent" | "Good" | "Fair" | "Poor";
  totalRepairEstimate: number;
}

export type ReportStatus = "pending_payment" | "paid";

export type ReportTier = "insights" | "insights_plus";

export type InspectionStatus =
  | "pending"
  | "in_progress"
  | "uploaded"
  | "processing"
  | "complete"
  | "failed"
  | "expired";

export interface InspectionPhoto {
  angle: string;
  label: string;
  storagePath: string;
  uploadedAt: string;
  /** Ravin Inspector Lite source URL when photos arrive via webhook. */
  externalUrl?: string;
}

export interface InspectionSession {
  id: string;
  reportId: string;
  accessToken: string;
  status: InspectionStatus;
  phone: string | null;
  photos: InspectionPhoto[];
  ravinInspectionId: string | null;
  ravinInviteUrl: string | null;
  expiresAt: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface VehicleReport {
  id: string;
  createdAt: string;
  status: ReportStatus;
  tier?: ReportTier;
  customerEmail?: string | null;
  customerPhone?: string | null;
  ownerPhone?: string | null;
  stripeSessionId: string | null;
  vehicle: VehicleIdentity;
  registration: RegistrationInfo;
  valuation: ValuationInfo;
  futureValue?: FutureValueInfo | null;
  market: MarketInfo;
  ai: AiInsights;
  damage: DamageAnalysis | null;
}
