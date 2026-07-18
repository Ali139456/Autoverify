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
  activeListings: number;
  averageDaysOnMarket: number;
  comparableListings: MarketListing[];
}

export interface AiInsights {
  riskScore: number; // 0-100, lower = safer
  riskLabel: "Low Risk" | "Moderate Risk" | "High Risk";
  riskFactors: string[];
  /** Predicted value for years 1..5 from now */
  depreciationForecast: { year: number; predictedValue: number }[];
  residualValue3yr: number;
  buyRecommendation: string;
  summary: string;
}

export interface DamageFinding {
  panel: string;
  type: string;
  severity: "Minor" | "Moderate" | "Severe";
  confidence: number;
  repairEstimate: number;
}

export interface DamageAnalysis {
  analyzedPhotos: number;
  findings: DamageFinding[];
  overallCondition: "Excellent" | "Good" | "Fair" | "Poor";
  totalRepairEstimate: number;
}

export type ReportStatus = "pending_payment" | "paid";

export interface VehicleReport {
  id: string;
  createdAt: string;
  status: ReportStatus;
  stripeSessionId: string | null;
  vehicle: VehicleIdentity;
  registration: RegistrationInfo;
  valuation: ValuationInfo;
  market: MarketInfo;
  ai: AiInsights;
  damage: DamageAnalysis | null;
}
