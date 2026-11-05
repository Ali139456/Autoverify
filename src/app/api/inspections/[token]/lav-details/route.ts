import { NextRequest, NextResponse } from "next/server";
import { lookupVehicle } from "@/lib/autograb";
import { getInspectionByToken, isInspectionExpired } from "@/lib/inspections";
import { getReport, updateReport } from "@/lib/store";
import { guardRateLimit, isBoundedAccessToken } from "@/lib/security";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token: rawToken } = await params;
  const token = rawToken.trim();

  const rateLimited = guardRateLimit(
    req,
    `inspection-lav-details:${token.slice(0, 32)}`,
    30,
    60 * 60 * 1000,
  );
  if (rateLimited) return rateLimited;

  if (!isBoundedAccessToken(token)) {
    return NextResponse.json({ error: "Inspection not found." }, { status: 404 });
  }

  const inspection = await getInspectionByToken(token);
  if (!inspection) {
    return NextResponse.json({ error: "Inspection not found." }, { status: 404 });
  }
  if (isInspectionExpired(inspection)) {
    return NextResponse.json({ error: "Inspection link expired." }, { status: 410 });
  }

  const report = await getReport(inspection.reportId);
  if (!report?.lavContext) {
    return NextResponse.json({ error: "Not a lender asset verification capture." }, {
      status: 400,
    });
  }

  let body: { odometerKm?: unknown; refreshVehicle?: unknown } = {};
  try {
    body = (await req.json()) as typeof body;
  } catch {
    body = {};
  }

  const patch: Parameters<typeof updateReport>[1] = {};

  const odometerRaw = body.odometerKm;
  if (odometerRaw != null && odometerRaw !== "") {
    const km = Number(odometerRaw);
    if (Number.isFinite(km) && km > 0) {
      patch.vehicle = {
        ...report.vehicle,
        odometer: Math.round(km),
        odometerSource: "Odometer reading supplied during image capture.",
      };
    }
  }

  const refreshVehicle = body.refreshVehicle === true;
  const rego = report.vehicle.rego?.trim();
  const state = report.vehicle.state;
  if (refreshVehicle && rego) {
    try {
      const lookup = await lookupVehicle(rego, state);
      patch.vehicle = {
        ...(patch.vehicle ?? report.vehicle),
        ...lookup.vehicle,
        odometer:
          (patch.vehicle as typeof report.vehicle | undefined)?.odometer ??
          report.vehicle.odometer,
        odometerSource:
          (patch.vehicle as typeof report.vehicle | undefined)?.odometerSource ??
          report.vehicle.odometerSource,
      };
      patch.registration = lookup.registration;
      const prior = report.lavVerification;
      patch.lavVerification = {
        vehicleMake: lookup.vehicle.make,
        vehicleModel: lookup.vehicle.model,
        badge:
          [lookup.vehicle.variant, lookup.vehicle.series]
            .filter(Boolean)
            .join(" ")
            .trim() ||
          prior?.badge ||
          null,
        buildOrCompliance: lookup.vehicle.year
          ? String(lookup.vehicle.year)
          : (prior?.buildOrCompliance ?? null),
        vin: lookup.vehicle.vin ?? prior?.vin ?? null,
        rego: lookup.vehicle.rego ?? prior?.rego ?? null,
        state: lookup.vehicle.state ?? prior?.state ?? null,
        colour: lookup.vehicle.colour ?? prior?.colour ?? null,
        identifiersMatched: true,
        autograbSource: process.env.AUTOGRAB_API_KEY ? "live" : "demo",
      };
    } catch (err) {
      console.error("[inspections/lav-details] AutoGrab refresh failed:", err);
    }
  }

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ ok: true, updated: false });
  }

  await updateReport(inspection.reportId, patch);

  return NextResponse.json({ ok: true, updated: true });
}
