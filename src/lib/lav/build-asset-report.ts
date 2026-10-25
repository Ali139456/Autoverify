import { lookupVehicle, type VehicleLookupResult } from "@/lib/autograb";
import { generateReportId, saveReport } from "@/lib/store";
import type { VehicleReport } from "@/lib/types";
import { parseLavAssetLookupInput } from "./parse-asset-lookup";
import type {
  LavAssetContext,
  LavAssetInput,
  LavBookingPayload,
  LavVerificationSummary,
} from "./types";

function isDigitalInspection(inspectionType: string): boolean {
  return inspectionType.toLowerCase().includes("digital");
}

function buildManualVerification(
  asset: LavAssetInput,
  booking: LavBookingPayload,
): LavVerificationSummary {
  return {
    vehicleMake: asset.make.trim(),
    vehicleModel: asset.model.trim(),
    badge: null,
    colour: asset.description.trim() || null,
    buildOrCompliance: asset.year.trim() || null,
    vin: asset.identifier.trim().toUpperCase() || null,
    rego: asset.rego.trim() || null,
    state: (booking.state as LavVerificationSummary["state"]) || null,
    identifiersMatched: Boolean(asset.identifier.trim() || asset.rego.trim()),
    autograbSource: "manual",
  };
}

function verificationFromLookup(
  lookup: VehicleLookupResult,
  asset: LavAssetInput,
): LavVerificationSummary {
  const { vehicle } = lookup;
  const badge = [vehicle.variant, vehicle.series].filter(Boolean).join(" ").trim();
  return {
    vehicleMake: vehicle.make || asset.make,
    vehicleModel: vehicle.model || asset.model,
    badge: badge || null,
    colour: vehicle.colour || asset.description.trim() || null,
    buildOrCompliance: vehicle.year ? String(vehicle.year) : asset.year || null,
    vin: vehicle.vin || asset.identifier.trim().toUpperCase() || null,
    rego: vehicle.rego || asset.rego.trim() || null,
    state: vehicle.state ?? null,
    identifiersMatched: Boolean(
      (vehicle.vin && asset.identifier) ||
        (vehicle.rego && asset.rego) ||
        (asset.make && asset.model),
    ),
    autograbSource: process.env.AUTOGRAB_API_KEY ? "live" : "demo",
  };
}

export async function createLavAssetReport(input: {
  booking: LavBookingPayload;
  asset: LavAssetInput;
  assetIndex: number;
  paid: boolean;
}): Promise<{ report: VehicleReport; verification: LavVerificationSummary }> {
  const { booking, asset, assetIndex, paid } = input;
  const reportId = generateReportId();

  const lavContext: LavAssetContext = {
    bookingRef: booking.bookingRef,
    assetIndex,
    assetType: asset.type,
    inspectionType: isDigitalInspection(booking.inspectionType)
      ? "digital"
      : "physical",
    productKind: "lender_asset_verification",
  };

  let report: VehicleReport;
  let verification: LavVerificationSummary;

  const lookupInput = parseLavAssetLookupInput({
    identifier: asset.identifier,
    rego: asset.rego,
    state: booking.state,
  });

  try {
    if (lookupInput) {
      const lookup = await lookupVehicle(lookupInput.query, lookupInput.state);
      verification = verificationFromLookup(lookup, asset);
      report = {
        id: reportId,
        createdAt: new Date().toISOString(),
        status: paid ? "paid" : "pending_payment",
        tier: "insights_plus",
        customerEmail: booking.contactEmail,
        customerPhone: booking.contactPhone,
        ownerPhone: booking.vendorPhone,
        stripeSessionId: null,
        vehicle: {
          ...lookup.vehicle,
          make: lookup.vehicle.make || asset.make,
          model: lookup.vehicle.model || asset.model,
          year: lookup.vehicle.year || Number(asset.year) || lookup.vehicle.year,
        },
        registration: lookup.registration,
        valuation: lookup.valuation,
        futureValue: null,
        market: lookup.market,
        ai: lookup.ai,
        vehicleSpec: null,
        manufacturerWarrantyService: null,
        damage: null,
        lavContext,
        lavVerification: verification,
      };
    } else {
      throw new Error("no lookup key");
    }
  } catch {
    verification = buildManualVerification(asset, booking);
    report = {
      id: reportId,
      createdAt: new Date().toISOString(),
      status: paid ? "paid" : "pending_payment",
      tier: "insights_plus",
      customerEmail: booking.contactEmail,
      customerPhone: booking.contactPhone,
      ownerPhone: booking.vendorPhone,
      stripeSessionId: null,
      vehicle: {
        rego: asset.rego.split(/\s+/)[0] ?? "",
        state: (booking.state || "NSW") as VehicleReport["vehicle"]["state"],
        vin: asset.identifier.trim().toUpperCase(),
        make: asset.make.trim(),
        model: asset.model.trim(),
        variant: "",
        series: "",
        year: Number(asset.year) || new Date().getFullYear(),
        bodyType: asset.type,
        fuelType: "",
        transmission: "",
        engine: "",
        colour: asset.description.trim(),
        odometer: null,
      },
      registration: {
        status: "Registered",
        expiryDate: null,
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
        riskScore: 50,
        riskLabel: "Moderate Risk",
        riskFactors: [],
        buyRecommendation: "Lender asset verification only.",
        summary: "Lender asset verification — vehicle identity from booking.",
      },
      vehicleSpec: null,
      manufacturerWarrantyService: null,
      damage: null,
      lavContext,
      lavVerification: verification,
    };
  }

  await saveReport(report);
  return { report, verification };
}
