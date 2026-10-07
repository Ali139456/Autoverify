import {
  buildEstimatedFutureValue,
  computeAiInsights,
} from "./autograb";
import { buildVehicleSpecSheet } from "./vehicle-spec-sheet";
import type {
  DamageAnalysis,
  InspectionPhoto,
  ReportTier,
  VehicleReport,
} from "./types";

function samplePublicUrl(path: string): string {
  const base = process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, "");
  return base ? `${base}${path}` : path;
}

function sampleWalkaroundUrl(file: string): string {
  return samplePublicUrl(`/sample/walkaround/${file}`);
}

function sampleAssetUrl(file: string): string {
  return samplePublicUrl(`/sample/${file}`);
}

/** Black Mercedes-Benz C-Class walkaround (Unsplash, sample only) for Insights+. */
const SAMPLE_WALKAROUND = [
  { angle: "front", label: "Front", file: "front.jpg" },
  { angle: "front_right", label: "Front right", file: "front-right.jpg" },
  { angle: "front_left", label: "Front left", file: "front-left.jpg" },
  { angle: "rear", label: "Rear", file: "rear.jpg" },
  { angle: "rear_right", label: "Rear right", file: "rear-right.jpg" },
  { angle: "rear_left", label: "Rear left", file: "rear-left.jpg" },
  { angle: "wheels", label: "Tyres / wheels", file: "wheels.jpg" },
  { angle: "interior_front", label: "Interior front", file: "interior-front.jpg" },
  { angle: "interior_rear", label: "Interior rear", file: "interior-rear.jpg" },
  { angle: "odometer", label: "Odometer", file: "odometer.jpg" },
] as const;

const SAMPLE_DAMAGE: DamageAnalysis = {
  analyzedPhotos: SAMPLE_WALKAROUND.length,
  overallCondition: "Good",
  totalRepairEstimate: 920,
  findings: [
    {
      panel: "Front bumper",
      type: "Scratch",
      severity: "Minor",
      confidence: 0.91,
      repairEstimate: 320,
      description: "Light scuff consistent with parking contact.",
      imageUrl: sampleWalkaroundUrl("front.jpg"),
    },
    {
      panel: "Rear left door",
      type: "Dent",
      severity: "Minor",
      confidence: 0.87,
      repairEstimate: 600,
      description: "Small dent — paintless repair may be suitable.",
      imageUrl: sampleWalkaroundUrl("rear-left.jpg"),
    },
  ],
};

const SAMPLE_PHOTO_TIMESTAMP = "2026-01-15T10:30:00.000Z";

export function buildSampleInspectionPhotos(): InspectionPhoto[] {
  return SAMPLE_WALKAROUND.map((item) => {
    const url = sampleWalkaroundUrl(item.file);
    return {
      angle: item.angle,
      label: item.label,
      storagePath: url,
      externalUrl: url,
      uploadedAt: SAMPLE_PHOTO_TIMESTAMP,
      capturedAt: SAMPLE_PHOTO_TIMESTAMP,
      latitude: -33.86882,
      longitude: 151.20929,
      locationAccuracyM: 12,
      locationLabel: "25 Martin Place, Sydney NSW 2000, Australia",
    };
  });
}

function buildMercedesSampleCore() {
  const vehicle = {
    rego: "MB3NZ",
    state: "NSW" as const,
    vin: "WDD2050472F123456",
    make: "Mercedes-Benz",
    model: "C-Class",
    variant: "C300",
    series: "W206",
    year: 2023,
    bodyType: "Sedan",
    fuelType: "Petrol",
    transmission: "Automatic",
    engine: "2.0L 4cyl Turbo",
    colour: "Black",
    odometer: 101800,
    odometerSource: "Provided at purchase (sample report).",
    ancapRating: null,
    warrantyRemaining: null,
    pPlateLegal: "Check state restrictions for P plate drivers",
    doors: 4,
    seats: 5,
    heroImageUrl: sampleAssetUrl("c300-hero.jpg"),
    heroImageDisclaimer:
      "Illustrative sample image — 2022 Mercedes-Benz C-Class C300 (reference photos).",
    heroImageKind: "stock" as const,
  };

  const registration = {
    status: "Registered" as const,
    expiryDate: "2027-02-16",
    stolen: false,
    writtenOff: false,
    writeOffDetails: null,
    ppsrEncumbrance: true,
    financeOwing: true,
    financeDetails: "Security interest registered by a financial institution",
    hasSafetyRecalls: false,
    ppsrCertificateUrl: null,
  };

  const valuation = {
    retailLow: 50016,
    retailHigh: 55280,
    tradeLow: 42000,
    tradeHigh: 46500,
    privateLow: 47500,
    privateHigh: 52000,
    confidence: "High" as const,
  };

  const market = {
    averagePrice: 52648,
    medianPrice: 51900,
    averageOdometer: 61200,
    activeListings: 34,
    averageDaysOnMarket: 28,
    comparableListings: [
      {
        title: "2022 Mercedes-Benz C-Class C300",
        price: 52990,
        odometer: 52100,
        location: "Sydney NSW",
        daysListed: 12,
      },
      {
        title: "2021 Mercedes-Benz C-Class C300",
        price: 49800,
        odometer: 68400,
        location: "Melbourne VIC",
        daysListed: 21,
      },
      {
        title: "2022 Mercedes-Benz C-Class C250",
        price: 51200,
        odometer: 44500,
        location: "Brisbane QLD",
        daysListed: 8,
      },
      {
        title: "2023 Mercedes-Benz C-Class C300",
        price: 56800,
        odometer: 31800,
        location: "Perth WA",
        daysListed: 34,
      },
    ],
  };

  const futureValue = buildEstimatedFutureValue(vehicle, valuation);
  const ai = computeAiInsights(vehicle, valuation, registration);
  const vehicleSpec = buildVehicleSpecSheet({
    vehicle,
    registration,
    vehicleRecord: {
      num_doors: 4,
      num_seats: 5,
      engine_size: "2.0L",
      engine_type: "T4",
      performance_info: { power_kw: 190, torque_nm: 400 },
    },
    registrationData: {},
    detailedSpecs: [
      { description: "Body", value: "Sedan" },
      { description: "Fuel type", value: "Premium unleaded / electric (mild hybrid)" },
      { description: "Transmission", value: "Automatic" },
    ],
  });
  vehicleSpec.factoryFeatures = [
    { code: "16U", label: "APPLE CARPLAY SMARTPHONE INTEGRATION" },
    { code: "17U", label: "ANDROID AUTO SMARTPHONE INTEGRATION" },
    { code: "235", label: "Conti tires for taxi" },
    { code: "249", label: "automatically dipping inside rear view mirror" },
    { code: "255", label: "auto pilot system" },
    { code: "500", label: "outside rear view mirror, folding" },
    { code: "587", label: "code 581 and 583" },
    { code: "608", label: "AUTOMATIC HIGH BEAM CONTROL (IHC)" },
    { code: "840", label: "glass shaded" },
    { code: "889", label: "keyless go" },
    { code: "893", label: "KEYLESS-START" },
  ];

  return { vehicle, registration, valuation, market, futureValue, ai, vehicleSpec };
}

export function buildSampleReport(tier: ReportTier): VehicleReport {
  const core = buildMercedesSampleCore();
  const includesPlus = tier === "insights_plus";

  return {
    id: includesPlus ? "SAMPLE-INSIGHTS-PLUS" : "SAMPLE-INSIGHTS",
    createdAt: new Date().toISOString(),
    status: "paid",
    tier,
    stripeSessionId: null,
    damage: includesPlus ? SAMPLE_DAMAGE : null,
    ...core,
  };
}
