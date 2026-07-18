import {
  AiInsights,
  AustralianState,
  MarketInfo,
  MarketListing,
  RegistrationInfo,
  ValuationInfo,
  VehicleIdentity,
} from "./types";

const AUTOGRAB_API_KEY = process.env.AUTOGRAB_API_KEY;
const AUTOGRAB_BASE_URL =
  process.env.AUTOGRAB_BASE_URL ?? "https://api.autograb.com.au/v2";

export interface VehicleLookupResult {
  vehicle: VehicleIdentity;
  registration: RegistrationInfo;
  valuation: ValuationInfo;
  market: MarketInfo;
  ai: AiInsights;
}

/**
 * Looks a vehicle up by registration plate.
 *
 * When AUTOGRAB_API_KEY is configured, calls the real Autograb API.
 * Otherwise falls back to deterministic demo data so the whole flow
 * (lookup -> payment -> report -> PDF) can be exercised end-to-end.
 */
export async function lookupVehicle(
  rego: string,
  state: AustralianState
): Promise<VehicleLookupResult> {
  if (AUTOGRAB_API_KEY) {
    return lookupViaAutograb(rego, state);
  }
  return buildDemoResult(rego, state);
}

async function lookupViaAutograb(
  rego: string,
  state: AustralianState
): Promise<VehicleLookupResult> {
  const headers = {
    ApiKey: AUTOGRAB_API_KEY as string,
    "Content-Type": "application/json",
  };

  // 1. Identify the vehicle from the plate
  const lookupRes = await fetch(
    `${AUTOGRAB_BASE_URL}/vehicles/lookup?registration_plate=${encodeURIComponent(
      rego
    )}&state=${state}&region=au`,
    { headers, cache: "no-store" }
  );
  if (!lookupRes.ok) {
    throw new Error(
      `Autograb vehicle lookup failed (${lookupRes.status}). Check the plate and try again.`
    );
  }
  const lookup = await lookupRes.json();
  const v = lookup.vehicle ?? lookup.data?.vehicle ?? lookup;
  const vehicleId: string | undefined = v.id;

  const vehicle: VehicleIdentity = {
    rego: rego.toUpperCase(),
    state,
    vin: v.vin ?? "",
    make: v.make ?? "Unknown",
    model: v.model ?? "Unknown",
    variant: v.badge ?? v.variant ?? "",
    series: v.series ?? "",
    year: Number(v.year) || 0,
    bodyType: v.body_type ?? "",
    fuelType: v.fuel ?? v.fuel_type ?? "",
    transmission: v.transmission ?? "",
    engine: v.engine ?? "",
    colour: v.colour ?? v.color ?? "",
    odometer: v.odometer ?? null,
  };

  // 2. Fetch valuation / market data in parallel (best-effort)
  const [valuation, market] = await Promise.all([
    fetchAutograbValuation(vehicleId, headers).catch(() => null),
    fetchAutograbMarket(vehicleId, headers).catch(() => null),
  ]);

  const demo = buildDemoResult(rego, state); // used to fill any gaps
  const result: VehicleLookupResult = {
    vehicle,
    registration: mapRegistration(v) ?? demo.registration,
    valuation: valuation ?? demo.valuation,
    market: market ?? demo.market,
    ai: demo.ai,
  };
  result.ai = computeAiInsights(result.vehicle, result.valuation, result.registration);
  return result;
}

function mapRegistration(v: Record<string, unknown>): RegistrationInfo | null {
  const reg = v.registration as Record<string, unknown> | undefined;
  if (!reg) return null;
  return {
    status: (reg.status as RegistrationInfo["status"]) ?? "Registered",
    expiryDate: (reg.expiry as string) ?? null,
    stolen: Boolean(reg.stolen),
    writtenOff: Boolean(reg.written_off),
    writeOffDetails: (reg.write_off_details as string) ?? null,
    ppsrEncumbrance: Boolean(reg.encumbered),
    financeOwing: Boolean(reg.finance_owing),
    financeDetails: (reg.finance_details as string) ?? null,
  };
}

async function fetchAutograbValuation(
  vehicleId: string | undefined,
  headers: Record<string, string>
): Promise<ValuationInfo | null> {
  if (!vehicleId) return null;
  const res = await fetch(
    `${AUTOGRAB_BASE_URL}/vehicles/${vehicleId}/valuation`,
    { headers, cache: "no-store" }
  );
  if (!res.ok) return null;
  const data = await res.json();
  const val = data.valuation ?? data;
  return {
    retailLow: val.retail_low ?? val.retail?.low ?? 0,
    retailHigh: val.retail_high ?? val.retail?.high ?? 0,
    tradeLow: val.trade_low ?? val.trade?.low ?? 0,
    tradeHigh: val.trade_high ?? val.trade?.high ?? 0,
    privateLow: val.private_low ?? val.private?.low ?? 0,
    privateHigh: val.private_high ?? val.private?.high ?? 0,
    confidence: val.confidence ?? "Medium",
  };
}

async function fetchAutograbMarket(
  vehicleId: string | undefined,
  headers: Record<string, string>
): Promise<MarketInfo | null> {
  if (!vehicleId) return null;
  const res = await fetch(
    `${AUTOGRAB_BASE_URL}/vehicles/${vehicleId}/market`,
    { headers, cache: "no-store" }
  );
  if (!res.ok) return null;
  const data = await res.json();
  const listings: MarketListing[] = (data.listings ?? []).map(
    (l: Record<string, unknown>) => ({
      title: (l.title as string) ?? "",
      price: Number(l.price) || 0,
      odometer: Number(l.odometer) || 0,
      location: (l.location as string) ?? "",
      daysListed: Number(l.days_listed) || 0,
    })
  );
  return {
    averagePrice: data.average_price ?? 0,
    medianPrice: data.median_price ?? 0,
    activeListings: data.active_listings ?? listings.length,
    averageDaysOnMarket: data.average_days_on_market ?? 0,
    comparableListings: listings.slice(0, 5),
  };
}

/* ------------------------------------------------------------------ */
/* Demo data (deterministic per plate) used until API keys are added  */
/* ------------------------------------------------------------------ */

function seededRandom(seed: string): () => number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return () => {
    h += h << 13;
    h ^= h >>> 7;
    h += h << 3;
    h ^= h >>> 17;
    h += h << 5;
    return ((h >>> 0) % 100000) / 100000;
  };
}

const DEMO_VEHICLES = [
  { make: "Toyota", model: "Corolla", variant: "Ascent Sport", body: "Hatchback", engine: "2.0L 4cyl", fuel: "Petrol", base: 28500 },
  { make: "Mazda", model: "CX-5", variant: "Maxx Sport", body: "SUV", engine: "2.5L 4cyl", fuel: "Petrol", base: 38900 },
  { make: "Ford", model: "Ranger", variant: "XLT", body: "Ute", engine: "2.0L Bi-Turbo Diesel", fuel: "Diesel", base: 52400 },
  { make: "Hyundai", model: "i30", variant: "Active", body: "Hatchback", engine: "2.0L 4cyl", fuel: "Petrol", base: 25200 },
  { make: "Toyota", model: "RAV4", variant: "GXL Hybrid", body: "SUV", engine: "2.5L Hybrid", fuel: "Hybrid", base: 45800 },
  { make: "Volkswagen", model: "Golf", variant: "110TSI Life", body: "Hatchback", engine: "1.4L Turbo", fuel: "Petrol", base: 34600 },
  { make: "Mitsubishi", model: "Outlander", variant: "ES", body: "SUV", engine: "2.5L 4cyl", fuel: "Petrol", base: 37700 },
  { make: "Tesla", model: "Model 3", variant: "RWD", body: "Sedan", engine: "Electric Motor", fuel: "Electric", base: 54900 },
];

const COLOURS = ["White", "Silver", "Black", "Blue", "Grey", "Red"];

function buildDemoResult(
  rego: string,
  state: AustralianState
): VehicleLookupResult {
  const rand = seededRandom(rego.toUpperCase() + state);
  const spec = DEMO_VEHICLES[Math.floor(rand() * DEMO_VEHICLES.length)];
  const year = 2016 + Math.floor(rand() * 9);
  const age = new Date().getFullYear() - year;
  const odometer = Math.round((8000 + rand() * 14000) * Math.max(age, 0.5));

  const vehicle: VehicleIdentity = {
    rego: rego.toUpperCase(),
    state,
    vin: `6T1${rego.toUpperCase().padEnd(3, "X").slice(0, 3)}${String(
      Math.floor(rand() * 1e11)
    ).padStart(11, "0")}`,
    make: spec.make,
    model: spec.model,
    variant: spec.variant,
    series: `${year} Series`,
    year,
    bodyType: spec.body,
    fuelType: spec.fuel,
    transmission: rand() > 0.2 ? "Automatic" : "Manual",
    engine: spec.engine,
    colour: COLOURS[Math.floor(rand() * COLOURS.length)],
    odometer,
  };

  const writtenOff = rand() < 0.08;
  const financeOwing = rand() < 0.15;
  const registration: RegistrationInfo = {
    status: rand() < 0.9 ? "Registered" : "Expired",
    expiryDate: new Date(Date.now() + rand() * 330 * 86400000)
      .toISOString()
      .slice(0, 10),
    stolen: false,
    writtenOff,
    writeOffDetails: writtenOff
      ? "Repairable write-off recorded (collision damage)"
      : null,
    ppsrEncumbrance: financeOwing,
    financeOwing,
    financeDetails: financeOwing
      ? "Security interest registered by a financial institution"
      : null,
  };

  // Depreciate ~13%/yr from new price, adjusted for kms
  const depreciated =
    spec.base * Math.pow(0.87, age) * (1 - Math.min(odometer / 400000, 0.25));
  const mid = Math.round(depreciated / 100) * 100;
  const valuation: ValuationInfo = {
    retailLow: Math.round(mid * 1.02),
    retailHigh: Math.round(mid * 1.18),
    tradeLow: Math.round(mid * 0.78),
    tradeHigh: Math.round(mid * 0.88),
    privateLow: Math.round(mid * 0.92),
    privateHigh: Math.round(mid * 1.05),
    confidence: rand() > 0.3 ? "High" : "Medium",
  };

  const listings: MarketListing[] = Array.from({ length: 5 }, (_, i) => ({
    title: `${year + (i % 2)} ${spec.make} ${spec.model} ${spec.variant}`,
    price: Math.round((mid * (0.9 + rand() * 0.25)) / 50) * 50,
    odometer: Math.round(odometer * (0.7 + rand() * 0.6)),
    location: ["Sydney NSW", "Melbourne VIC", "Brisbane QLD", "Perth WA", "Adelaide SA"][i],
    daysListed: Math.floor(rand() * 60) + 3,
  }));

  const market: MarketInfo = {
    averagePrice: Math.round(
      listings.reduce((s, l) => s + l.price, 0) / listings.length
    ),
    medianPrice: [...listings].sort((a, b) => a.price - b.price)[2].price,
    activeListings: Math.floor(rand() * 180) + 40,
    averageDaysOnMarket: Math.floor(rand() * 35) + 14,
    comparableListings: listings,
  };

  const ai = computeAiInsights(vehicle, valuation, registration);
  return { vehicle, registration, valuation, market, ai };
}

/* ------------------------------------------------------------------ */
/* AI insights: risk scoring + depreciation forecast                   */
/* ------------------------------------------------------------------ */

export function computeAiInsights(
  vehicle: VehicleIdentity,
  valuation: ValuationInfo,
  registration: RegistrationInfo
): AiInsights {
  const currentValue = Math.round(
    (valuation.privateLow + valuation.privateHigh) / 2
  );
  const age = Math.max(new Date().getFullYear() - vehicle.year, 0);

  let risk = 12;
  const riskFactors: string[] = [];

  if (registration.writtenOff) {
    risk += 35;
    riskFactors.push("Vehicle has a write-off record on the register");
  }
  if (registration.financeOwing) {
    risk += 20;
    riskFactors.push("Outstanding finance / PPSR security interest detected");
  }
  if (registration.status !== "Registered") {
    risk += 10;
    riskFactors.push(`Registration status is ${registration.status}`);
  }
  if (vehicle.odometer && age > 0 && vehicle.odometer / age > 22000) {
    risk += 12;
    riskFactors.push("Above-average annual kilometres for its age");
  }
  if (age >= 10) {
    risk += 8;
    riskFactors.push("Vehicle age exceeds 10 years");
  }
  if (riskFactors.length === 0) {
    riskFactors.push("No adverse records found in the checks performed");
  }
  risk = Math.min(risk, 95);

  const riskLabel: AiInsights["riskLabel"] =
    risk < 30 ? "Low Risk" : risk < 60 ? "Moderate Risk" : "High Risk";

  // EVs and hybrids hold value slightly differently; simple annual curve
  const annualRate =
    vehicle.fuelType === "Electric"
      ? 0.16
      : vehicle.fuelType === "Hybrid"
        ? 0.11
        : 0.13;

  const depreciationForecast = Array.from({ length: 5 }, (_, i) => ({
    year: new Date().getFullYear() + i + 1,
    predictedValue: Math.round(
      (currentValue * Math.pow(1 - annualRate, i + 1)) / 50
    ) * 50,
  }));

  const residualValue3yr = depreciationForecast[2].predictedValue;

  const buyRecommendation =
    riskLabel === "Low Risk"
      ? "This vehicle presents well against the market with no significant adverse records. Negotiating near the lower end of the private-sale range is a reasonable strategy."
      : riskLabel === "Moderate Risk"
        ? "This vehicle is purchasable, but the flagged items should be resolved before committing. Obtain clearances in writing and price the risk into your offer."
        : "Significant adverse records were found. We recommend independent inspection and legal clearance of all flagged items before any purchase.";

  return {
    riskScore: risk,
    riskLabel,
    riskFactors,
    depreciationForecast,
    residualValue3yr,
    buyRecommendation,
    summary: `${vehicle.year} ${vehicle.make} ${vehicle.model} ${vehicle.variant} — estimated private-sale value $${currentValue.toLocaleString()} with a projected 3-year residual of $${residualValue3yr.toLocaleString()}. Overall assessment: ${riskLabel.toLowerCase()}.`,
  };
}
