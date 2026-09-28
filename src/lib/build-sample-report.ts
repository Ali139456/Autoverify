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

/** Illustrative walkaround images (white sedan) for the public sample Insights+ report. */
const SAMPLE_WALKAROUND = [
  {
    angle: "front",
    label: "Front",
    url: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d4?auto=format&fit=crop&w=900&q=80",
  },
  {
    angle: "front_right",
    label: "Front right",
    url: "https://images.unsplash.com/photo-1606664515527-ed6580934936?auto=format&fit=crop&w=900&q=80",
  },
  {
    angle: "rear_right",
    label: "Rear right",
    url: "https://images.unsplash.com/photo-1549315160-64f163341683?auto=format&fit=crop&w=900&q=80",
  },
  {
    angle: "rear",
    label: "Rear",
    url: "https://images.unsplash.com/photo-1552518507-af3bfd703336?auto=format&fit=crop&w=900&q=80",
  },
  {
    angle: "rear_left",
    label: "Rear left",
    url: "https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=900&q=80",
  },
  {
    angle: "front_left",
    label: "Front left",
    url: "https://images.unsplash.com/photo-1583121274602-3b2a1c4c6abc?auto=format&fit=crop&w=900&q=80",
  },
] as const;

const SAMPLE_DAMAGE_PHOTOS = {
  frontBumper:
    "https://images.unsplash.com/photo-1489828101867-5e340edbc935?auto=format&fit=crop&w=900&q=80",
  rearLeftDoor:
    "https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=900&q=80",
} as const;

const SAMPLE_DAMAGE: DamageAnalysis = {
  analyzedPhotos: 6,
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
      imageUrl: SAMPLE_DAMAGE_PHOTOS.frontBumper,
    },
    {
      panel: "Rear left door",
      type: "Dent",
      severity: "Minor",
      confidence: 0.87,
      repairEstimate: 600,
      description: "Small dent — paintless repair may be suitable.",
      imageUrl: SAMPLE_DAMAGE_PHOTOS.rearLeftDoor,
    },
  ],
};

const SAMPLE_PHOTO_TIMESTAMP = "2026-01-15T10:30:00.000Z";

export function buildSampleInspectionPhotos(): InspectionPhoto[] {
  return SAMPLE_WALKAROUND.map((item) => ({
    angle: item.angle,
    label: item.label,
    storagePath: item.url,
    externalUrl: item.url,
    uploadedAt: SAMPLE_PHOTO_TIMESTAMP,
  }));
}

function buildMercedesSampleCore() {
  const vehicle = {
    rego: "MB3NZ",
    state: "NSW" as const,
    vin: "WDD2050472F123456",
    make: "Mercedes-Benz",
    model: "C-Class",
    variant: "C300",
    series: "2022 Series",
    year: 2022,
    bodyType: "Sedan",
    fuelType: "Petrol",
    transmission: "Automatic",
    engine: "2.0L 4cyl Turbo",
    colour: "Black",
    odometer: 57873,
    odometerSource: "Provided at purchase (sample report).",
    ancapRating: null,
    warrantyRemaining: null,
    pPlateLegal: null,
    heroImageUrl:
      "https://images.unsplash.com/photo-1617814076367-b759a7bf4653?auto=format&fit=crop&w=1200&q=80",
    heroImageDisclaimer:
      "Illustrative image for this sample report — may not match the exact vehicle.",
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
    vehicleRecord: {},
    registrationData: {},
    detailedSpecs: [
      { description: "Body", value: "Sedan" },
      { description: "Fuel", value: "Petrol — Mild hybrid" },
      { description: "Transmission", value: "Automatic" },
    ],
  });
  vehicleSpec.factoryFeatures = [
    { code: "sample", label: "Apple CarPlay / Android Auto" },
    { code: "sample", label: "Adaptive cruise control" },
    { code: "sample", label: "Blind spot assist" },
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
