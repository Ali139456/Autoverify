import {
  getInspectionAngleLabel,
  LAV_DIGITAL_INSPECTION_ANGLES,
} from "@/lib/inspection-angles";
import type { DamageAnalysis, InspectionPhoto, VehicleReport } from "@/lib/types";

const SAMPLE_WALKAROUND_FILES: Record<string, string> = {
  front: "front.jpg",
  left_side: "left-side.jpg",
  rear: "rear.jpg",
  right_side: "right-side.jpg",
  dashboard: "odometer.jpg",
  vin_plate: "vin-plate.jpg",
  service_record: "registration-papers.jpg",
};

const LAV_SAMPLE_CAPTURED_AT = "2026-10-24T10:30:00.000+11:00";

function sampleWalkaroundPath(file: string): string {
  return `/sample/walkaround/${file}`;
}

export function buildLavCarSamplePhotos(): InspectionPhoto[] {
  return LAV_DIGITAL_INSPECTION_ANGLES.filter(({ id }) =>
    Boolean(SAMPLE_WALKAROUND_FILES[id]),
  ).map(({ id }) => {
    const file = SAMPLE_WALKAROUND_FILES[id]!;
    const url = sampleWalkaroundPath(file);
    return {
      angle: id,
      label: getInspectionAngleLabel(id),
      storagePath: url,
      externalUrl: url,
      uploadedAt: LAV_SAMPLE_CAPTURED_AT,
      capturedAt: LAV_SAMPLE_CAPTURED_AT,
      latitude: -33.827,
      longitude: 151.126,
      locationAccuracyM: 8,
      locationLabel: "Gladesville NSW 2111",
    };
  });
}

const LAV_SAMPLE_DAMAGE: DamageAnalysis = {
  analyzedPhotos: 4,
  overallCondition: "Good",
  totalRepairEstimate: 0,
  findings: [],
};

export function buildLavCarSampleReport(): VehicleReport {
  return {
    id: "LAV-SAMPLE-CAR",
    createdAt: "2026-10-24T10:45:00.000+11:00",
    status: "paid",
    tier: "insights_plus",
    stripeSessionId: null,
    customerEmail: null,
    customerPhone: null,
    ownerPhone: null,
    vehicle: {
      rego: "ABC123",
      state: "NSW",
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
    },
    registration: {
      status: "Registered",
      expiryDate: "2027-09-01",
      stolen: false,
      writtenOff: false,
      writeOffDetails: null,
      ppsrEncumbrance: false,
      financeOwing: false,
      financeDetails: null,
      ppsrCertificateUrl: null,
    },
    valuation: {
      retailLow: 0,
      retailHigh: 0,
      tradeLow: 0,
      tradeHigh: 0,
      privateLow: 0,
      privateHigh: 0,
      confidence: "Low",
    },
    futureValue: null,
    market: {
      averagePrice: 0,
      medianPrice: 0,
      activeListings: 0,
      averageDaysOnMarket: 0,
      comparableListings: [],
    },
    ai: {
      riskScore: 40,
      riskLabel: "Low Risk",
      riskFactors: [],
      buyRecommendation: "Sample lender asset verification report.",
      summary: "Sample LAV digital inspection.",
    },
    vehicleSpec: null,
    manufacturerWarrantyService: null,
    damage: LAV_SAMPLE_DAMAGE,
    lavContext: {
      bookingRef: "LAV-SAMPLE",
      assetIndex: 0,
      assetType: "Car",
      inspectionType: "digital",
      productKind: "lender_asset_verification",
    },
    lavVerification: {
      vehicleMake: "Mercedes-Benz",
      vehicleModel: "C-Class",
      badge: "C300",
      colour: "Black",
      buildOrCompliance: "2022",
      vin: "WDD2050472F123456",
      rego: "ABC123",
      state: "NSW",
      identifiersMatched: true,
      autograbSource: "demo",
    },
  };
}
