import {
  buildEstimatedFutureValue,
  computeAiInsights,
} from "./autograb";
import {
  EXTERIOR_INSPECTION_ANGLE_IDS,
  getInspectionAngleLabel,
} from "./inspection-angles";
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

function sampleDamageUrl(file: string): string {
  return samplePublicUrl(`/sample/damage/${file}`);
}

/**
 * Mercedes C300 demo walkaround — synced from `images/` → `public/sample/walkaround/` (see README + scripts/sync-sample-walkaround.ps1).
 */
const SAMPLE_WALKAROUND_FILES: Record<string, string> = {
  front_left: "front-left.jpg",
  front: "front.jpg",
  front_right: "front-right.jpg",
  right_side: "right-side.jpg",
  rear_right: "rear-right.jpg",
  rear: "rear.jpg",
  rear_left: "rear-left.jpg",
  left_side: "left-side.jpg",
  wheel_right_front: "wheels.jpg",
  interior_driver_front: "interior-front.jpg",
  interior_passenger_rear: "interior-rear.jpg",
  dashboard: "odometer.jpg",
  keys: "keys.jpg",
  service_record: "service-record.jpg",
};

const SAMPLE_WALKAROUND_ANGLES = [
  ...EXTERIOR_INSPECTION_ANGLE_IDS,
  "wheel_right_front",
  "interior_driver_front",
  "interior_passenger_rear",
  "dashboard",
  "keys",
  "service_record",
] as const;

const SAMPLE_DAMAGE: DamageAnalysis = {
  analyzedPhotos: SAMPLE_WALKAROUND_ANGLES.length,
  overallCondition: "Good",
  totalRepairEstimate: 920,
  findings: [
    {
      panel: "Front bumper",
      type: "Scratch",
      severity: "Minor",
      confidence: 0.91,
      repairEstimate: 320,
      description: "Scuff and scratch damage on the lower front bumper.",
      imageUrl: sampleDamageUrl("front-bumper.jpg"),
    },
    {
      panel: "Rear left door",
      type: "Dent",
      severity: "Minor",
      confidence: 0.87,
      repairEstimate: 600,
      description: "Minor dent below the rear door handle — paintless repair may be suitable.",
      imageUrl: sampleDamageUrl("rear-left-door.jpg"),
    },
  ],
};

const SAMPLE_PHOTO_TIMESTAMP = "2026-01-15T10:30:00.000Z";

export function buildSampleInspectionPhotos(): InspectionPhoto[] {
  return SAMPLE_WALKAROUND_ANGLES.map((angle) => {
    const file = SAMPLE_WALKAROUND_FILES[angle] ?? "front-left.jpg";
    const url = sampleWalkaroundUrl(file);
    return {
      angle,
      label: getInspectionAngleLabel(angle),
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
    year: 2022,
    bodyType: "Sedan",
    fuelType: "Petrol",
    transmission: "Automatic",
    engine: "2.0L 4cyl Turbo",
    colour: "Black",
    odometer: 51890,
    odometerSource: "Self reported at purchase (sample report).",
    odometerHistory: [
      { date: "2024-06-12", odometer: 38200, source: "Dealer listing" },
      { date: "2025-01-08", odometer: 44100, source: "Private listing" },
      { date: "2025-09-20", odometer: 49850, source: "Dealer listing" },
    ],
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
      {
        title: "2022 Mercedes-Benz C-Class C300",
        price: 54500,
        odometer: 38900,
        location: "Adelaide SA",
        daysListed: 17,
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
      num_gears: 9,
      engine_size: "2.0L",
      engine_type: "T4",
      battery_kwh: 0.96,
      performance_info: {
        power_kw: 190,
        torque_nm: 400,
        weight_tonnes: 1.74,
        power_to_weight_ratio: 109,
      },
    },
    registrationData: {
      build_data: {
        build_date: "2021-11-18",
      },
    },
    detailedSpecs: [
      { description: "Body", value: "Sedan" },
      {
        description: "Fuel type",
        value: "Premium unleaded / electric (mild hybrid)",
      },
      { description: "Transmission", value: "Automatic" },
    ],
  });
  vehicleSpec.factoryFeatures = [
    { code: "16U", label: "APPLE CARPLAY SMARTPHONE INTEGRATION" },
    { code: "17U", label: "ANDROID AUTO SMARTPHONE INTEGRATION" },
    { code: "14U", label: "SMARTPHONE INTEGRATION PACKAGE" },
    { code: "218", label: "REVERSING CAMERA" },
    { code: "223", label: "SEAT COMFORT PACKAGE" },
    { code: "231", label: "GARAGE DOOR OPENER" },
    { code: "235", label: "ACTIVE PARKING ASSIST" },
    { code: "237", label: "ACTIVE BLIND SPOT ASSIST" },
    { code: "243", label: "ACTIVE STEERING ASSIST" },
    { code: "249", label: "AUTOMATICALLY DIMMING INSIDE REAR VIEW MIRROR" },
    { code: "255", label: "DRIVING ASSISTANCE PACKAGE" },
    {
      code: "275",
      label: "MEMORY PACKAGE (DRIVER SEAT, STEERING COLUMN, MIRRORS)",
    },
    { code: "293", label: "SIDEBAGS IN THE REAR" },
    { code: "294", label: "KNEEBAG" },
    { code: "321", label: "AMG LINE EXTERIOR" },
    { code: "401", label: "FRONT CLIMATISED SEATS" },
    { code: "413", label: "PANORAMIC SLIDING SUNROOF" },
    { code: "427", label: "9G-TRONIC AUTOMATIC TRANSMISSION" },
    { code: "440", label: "CRUISE CONTROL" },
    { code: "475", label: "TYRE PRESSURE MONITORING SYSTEM" },
    { code: "500", label: "OUTSIDE REAR VIEW MIRRORS, FOLDING" },
    { code: "501", label: "360 DEGREE CAMERA" },
    { code: "513", label: "TRAFFIC SIGN ASSIST" },
    { code: "531", label: "MBUX NAVIGATION PREMIUM" },
    { code: "537", label: "DIGITAL RADIO (DAB+)" },
    { code: "581", label: "THERMOTRONIC AUTOMATIC CLIMATE CONTROL" },
    { code: "608", label: "ADAPTIVE HIGHBEAM ASSIST PLUS" },
    { code: "632", label: "DIGITAL LIGHT HEADLAMPS" },
    { code: "810", label: "BURMESTER 3D SURROUND SOUND SYSTEM" },
    { code: "840", label: "GLASS SHADED" },
    { code: "859", label: "AMBIENT LIGHTING (64 COLOURS)" },
    { code: "873", label: "SEAT HEATING FOR DRIVER AND FRONT PASSENGER" },
    { code: "889", label: "KEYLESS-GO" },
    { code: "893", label: "KEYLESS-START" },
    { code: "897", label: "WIRELESS CHARGING FOR MOBILE DEVICES" },
    { code: "R01", label: "SUMMER TYRES" },
    { code: "RVM", label: "19-INCH AMG MULTI-SPOKE LIGHT-ALLOY WHEELS" },
    { code: "U35", label: "DIGITAL DISPLAY FOR TACHOMETER / SPEEDOMETER" },
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
