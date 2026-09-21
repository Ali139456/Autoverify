import {
  AiInsights,
  AustralianState,
  FutureValueInfo,
  MarketInfo,
  MarketListing,
  RegistrationInfo,
  ValuationInfo,
  VehicleIdentity,
} from "./types";

const AUTOGRAB_API_KEY = process.env.AUTOGRAB_API_KEY;
const AUTOGRAB_BASE_URL =
  process.env.AUTOGRAB_BASE_URL ?? "https://api.autograb.com.au/v2";

const REGISTRATION_FEATURES = "build_data,performance_info";

export interface VehicleLookupResult {
  vehicle: VehicleIdentity;
  registration: RegistrationInfo;
  valuation: ValuationInfo;
  futureValue: FutureValueInfo;
  market: MarketInfo;
  ai: AiInsights;
}

type JsonRecord = Record<string, unknown>;

/**
 * Looks a vehicle up by registration plate.
 *
 * Uses AutoGrab v2 registration, valuation, and market overlay APIs.
 * Falls back to deterministic demo data when AUTOGRAB_API_KEY is unset.
 */
export async function lookupVehicle(
  rego: string,
  state: AustralianState,
): Promise<VehicleLookupResult> {
  if (AUTOGRAB_API_KEY) {
    return lookupViaAutograb(rego, state);
  }
  return buildDemoResult(rego, state);
}

function autograbHeaders(): Record<string, string> {
  return {
    ApiKey: AUTOGRAB_API_KEY as string,
    "Content-Type": "application/json",
  };
}

async function autograbGet(path: string): Promise<Response> {
  return fetch(`${AUTOGRAB_BASE_URL}${path}`, {
    headers: autograbHeaders(),
    cache: "no-store",
  });
}

async function autograbPost(path: string, body: JsonRecord): Promise<Response> {
  return fetch(`${AUTOGRAB_BASE_URL}${path}`, {
    method: "POST",
    headers: autograbHeaders(),
    body: JSON.stringify(body),
    cache: "no-store",
  });
}

async function lookupViaAutograb(
  rego: string,
  state: AustralianState,
): Promise<VehicleLookupResult> {
  const plate = rego.toUpperCase();
  const registrationRes = await autograbGet(
    `/vehicles/registrations/${encodeURIComponent(plate)}?region=au&state=${state}&features=${REGISTRATION_FEATURES}`,
  );

  if (registrationRes.status === 404) {
    throw new Error(
      `No vehicle found for registration ${plate} (${state}). Check the plate and try again.`,
    );
  }

  if (!registrationRes.ok) {
    const errorBody = await registrationRes.json().catch(() => null);
    const message =
      typeof errorBody?.message === "string"
        ? errorBody.message
        : `Autograb registration lookup failed (${registrationRes.status}).`;
    throw new Error(message);
  }

  const registrationData = (await registrationRes.json()) as JsonRecord;
  const vehicleRecord = registrationData.vehicle as JsonRecord | undefined;
  const vehicleId = vehicleRecord?.id as string | undefined;

  if (!vehicleId || !vehicleRecord) {
    const upstream = registrationData.upstream_vehicle as string | undefined;
    throw new Error(
      upstream
        ? `We found "${upstream}" on the register but couldn't match it to our catalogue.`
        : `No vehicle found for registration ${plate} (${state}). Check the plate and try again.`,
    );
  }

  const vehicle = mapVehicleIdentity(
    plate,
    state,
    vehicleRecord,
    registrationData,
  );

  const market = await fetchMarketOverlay(vehicleId, vehicle);
  if (market?.averageOdometer) {
    vehicle.odometer = market.averageOdometer;
  }

  const [registration, valuation] = await Promise.all([
    fetchRegistrationStatus(plate, state),
    fetchValuation(vehicleId, vehicle),
  ]);

  const demo = buildDemoResult(rego, state);
  const resolvedValuation = valuation ?? demo.valuation;
  const futureValue =
    (await fetchResidualValuation(vehicleId, vehicle)) ??
    buildEstimatedFutureValue(vehicle, resolvedValuation);

  const result: VehicleLookupResult = {
    vehicle,
    registration: registration ?? demo.registration,
    valuation: resolvedValuation,
    futureValue,
    market: market ?? demo.market,
    ai: demo.ai,
  };

  result.ai = computeAiInsights(
    result.vehicle,
    result.valuation,
    result.registration,
  );
  return result;
}

function mapVehicleIdentity(
  plate: string,
  state: AustralianState,
  vehicle: JsonRecord,
  registrationData: JsonRecord,
): VehicleIdentity {
  return {
    rego: plate,
    state,
    vin: String(registrationData.vin ?? ""),
    make: String(vehicle.make ?? "Unknown"),
    model: String(vehicle.model ?? "Unknown"),
    variant: String(vehicle.badge ?? vehicle.variant ?? ""),
    series: String(vehicle.series ?? vehicle.model_year ?? ""),
    year: Number(vehicle.year) || Number(vehicle.release_year) || 0,
    bodyType: String(vehicle.body_type ?? ""),
    fuelType: String(vehicle.fuel ?? vehicle.fuel_type ?? ""),
    transmission: String(vehicle.transmission ?? ""),
    engine: String(vehicle.engine ?? ""),
    colour: String(registrationData.colour ?? vehicle.colour ?? ""),
    odometer: null,
  };
}

async function fetchRegistrationStatus(
  plate: string,
  state: AustralianState,
): Promise<RegistrationInfo | null> {
  const res = await autograbGet(
    `/vehicles/registrations/${encodeURIComponent(plate)}/status?region=au&state=${state}`,
  );
  if (!res.ok) return null;

  const data = (await res.json()) as JsonRecord;
  const incidents = Array.isArray(data.incidents) ? data.incidents : [];
  const incidentText = incidents
    .map((item) => JSON.stringify(item).toLowerCase())
    .join(" ");

  const writtenOff =
    incidentText.includes("write") ||
    incidentText.includes("wov") ||
    incidentText.includes("total loss");
  const stolen = incidentText.includes("stolen");
  const financeOwing =
    incidentText.includes("encumbr") ||
    incidentText.includes("finance") ||
    incidentText.includes("security interest");

  return {
    status: mapRegistrationStatus(String(data.registration_status ?? "")),
    expiryDate: (data.registration_expiry as string) ?? null,
    stolen,
    writtenOff,
    writeOffDetails: writtenOff
      ? "Write-off or incident recorded on registration status check"
      : null,
    ppsrEncumbrance: financeOwing,
    financeOwing,
    financeDetails: financeOwing
      ? "Security interest or finance record detected"
      : null,
  };
}

function mapRegistrationStatus(
  status: string,
): RegistrationInfo["status"] {
  const normalized = status.toUpperCase();
  if (normalized.includes("REGISTER")) return "Registered";
  if (normalized.includes("SUSPEND")) return "Suspended";
  if (normalized.includes("EXPIRE")) return "Expired";
  if (normalized.includes("UNREGISTER")) return "Unregistered";
  return "Registered";
}

async function fetchValuation(
  vehicleId: string,
  vehicle: VehicleIdentity,
): Promise<ValuationInfo | null> {
  const kms = vehicle.odometer ?? estimateKmsFromYear(vehicle.year);
  const res = await autograbPost("/valuations/predict", {
    region: "au",
    catalogue: "autograb",
    vehicle_id: vehicleId,
    kms,
    condition_score: 3,
  });
  if (!res.ok) return null;

  const data = (await res.json()) as JsonRecord;
  const prediction = (data.prediction ?? data) as JsonRecord;
  const retail = Number(prediction.retail_price ?? prediction.price) || 0;
  const trade = Number(prediction.trade_price) || Math.round(retail * 0.82);

  if (!retail) return null;

  const privateMid = Math.round((retail + trade) / 2);
  return {
    retailLow: Math.round(retail * 0.95),
    retailHigh: Math.round(retail * 1.05),
    tradeLow: Math.round(trade * 0.92),
    tradeHigh: Math.round(trade * 1.08),
    privateLow: Math.round(privateMid * 0.95),
    privateHigh: Math.round(privateMid * 1.05),
    confidence: Number(prediction.score ?? 0) >= 0.85 ? "High" : "Medium",
  };
}

function estimateKmsFromYear(year: number): number {
  const age = Math.max(new Date().getFullYear() - year, 1);
  return Math.round(age * 12000);
}

function estimateYearlyKms(vehicle: VehicleIdentity): number {
  const initialKms = vehicle.odometer ?? estimateKmsFromYear(vehicle.year);
  const age = Math.max(new Date().getFullYear() - vehicle.year, 1);
  const yearly = Math.round(initialKms / age);
  return Math.min(Math.max(yearly || 15000, 5000), 40000);
}

async function fetchResidualValuation(
  vehicleId: string,
  vehicle: VehicleIdentity,
): Promise<FutureValueInfo | null> {
  const initialKms = vehicle.odometer ?? estimateKmsFromYear(vehicle.year);
  const yearlyKms = estimateYearlyKms(vehicle);

  const body: JsonRecord = {
    region: "au",
    vehicle_id: vehicleId,
    initial_kms: initialKms,
    yearly_kms: yearlyKms,
  };
  if (vehicle.colour) {
    body.color = vehicle.colour;
  }

  const res = await autograbPost("/valuations/residual", body);
  if (!res.ok) return null;

  const data = (await res.json()) as JsonRecord;
  const rawPredictions = Array.isArray(data.predictions) ? data.predictions : [];
  if (!rawPredictions.length) return null;

  const predictions = rawPredictions
    .map((item) => {
      const point = item as JsonRecord;
      return {
        yearsAhead: Number(point.year),
        odometer: Number(point.kms),
        value: Number(point.valuation),
        confidence: Number(point.score) || 0,
      };
    })
    .filter((point) => Number.isFinite(point.value) && point.value > 0);

  if (!predictions.length) return null;

  return {
    source: "autograb",
    yearlyKms,
    predictions,
  };
}

export function buildEstimatedFutureValue(
  vehicle: VehicleIdentity,
  valuation: ValuationInfo,
): FutureValueInfo {
  const currentValue = Math.round(
    (valuation.privateLow + valuation.privateHigh) / 2,
  );
  const initialKms = vehicle.odometer ?? estimateKmsFromYear(vehicle.year);
  const yearlyKms = estimateYearlyKms(vehicle);
  const horizonYears = [0, 1, 2, 3, 5];

  return {
    source: "estimated",
    yearlyKms,
    predictions: horizonYears.map((yearsAhead) => ({
      yearsAhead,
      odometer: initialKms + yearsAhead * yearlyKms,
      value: Math.round(currentValue * Math.pow(0.88, yearsAhead)),
      confidence: 0.75,
    })),
  };
}

async function fetchMarketOverlay(
  vehicleId: string,
  vehicle: VehicleIdentity,
): Promise<MarketInfo | null> {
  const res = await autograbGet(
    `/sourcing/market_overlay/${vehicleId}?region=au&features=avg_price,avg_kms,days_supply,vehicle_rrp`,
  );
  if (!res.ok) return null;

  const data = (await res.json()) as JsonRecord;
  const leads = Array.isArray(data.leads) ? data.leads : [];
  const listings: MarketListing[] = leads.slice(0, 5).map((lead) => {
    const item = lead as JsonRecord;
    const year = Number(item.year) || vehicle.year;
    const title = `${year} ${vehicle.make} ${vehicle.model} ${vehicle.variant}`.trim();

    return {
      title,
      price: Number(item.price) || 0,
      odometer: Number(item.kms ?? item.odometer) || 0,
      location: String(item.state ?? "AU"),
      daysListed: Number(item.days_listed) || 0,
    };
  });

  const avgPrice = Number(data.avg_price) || 0;
  if (!avgPrice && listings.length === 0) return null;

  const prices = listings.map((listing) => listing.price).filter(Boolean);
  const medianPrice =
    prices.length > 0
      ? [...prices].sort((a, b) => a - b)[Math.floor(prices.length / 2)]
      : avgPrice;

  const averageOdometer =
    Number(data.avg_kms ?? data.avg_odometer) ||
    (listings.length
      ? Math.round(
          listings.reduce((sum, listing) => sum + listing.odometer, 0) /
            listings.length,
        )
      : 0);

  return {
    averagePrice: avgPrice,
    medianPrice,
    averageOdometer: averageOdometer || undefined,
    activeListings: Number(data.sample_size) || listings.length,
    averageDaysOnMarket:
      Number(data.avg_days_to_sell) || Number(data.days_supply) || 0,
    comparableListings: listings,
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
  state: AustralianState,
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
      Math.floor(rand() * 1e11),
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
      listings.reduce((s, l) => s + l.price, 0) / listings.length,
    ),
    medianPrice: [...listings].sort((a, b) => a.price - b.price)[2].price,
    activeListings: Math.floor(rand() * 180) + 40,
    averageDaysOnMarket: Math.floor(rand() * 35) + 14,
    comparableListings: listings,
  };

  const futureValue = buildEstimatedFutureValue(vehicle, valuation);
  const ai = computeAiInsights(vehicle, valuation, registration);
  return { vehicle, registration, valuation, futureValue, market, ai };
}

export function computeAiInsights(
  vehicle: VehicleIdentity,
  valuation: ValuationInfo,
  registration: RegistrationInfo,
): AiInsights {
  const currentValue = Math.round(
    (valuation.privateLow + valuation.privateHigh) / 2,
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
    buyRecommendation,
    summary: `${vehicle.year} ${vehicle.make} ${vehicle.model} ${vehicle.variant} — estimated private-sale value $${currentValue.toLocaleString()}. Overall assessment: ${riskLabel.toLowerCase()}.`,
  };
}
