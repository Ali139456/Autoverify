import { NextRequest, NextResponse } from "next/server";
import { lookupVehicle } from "@/lib/autograb";
import { getInspectionByToken, isInspectionExpired } from "@/lib/inspections";
import type { LavConditionGrade } from "@/lib/lav/lav-report-view";
import { getReport, updateReport } from "@/lib/store";
import { guardRateLimit, isBoundedAccessToken } from "@/lib/security";

function normalizeCaptureVin(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const vin = raw.trim().toUpperCase().replace(/\s+/g, "");
  if (vin.length < 8 || vin.length > 17) return null;
  return vin;
}

function normalizeConditionGrade(raw: unknown): LavConditionGrade | null {
  if (typeof raw !== "string") return null;
  const g = raw.trim().toLowerCase();
  if (g === "good" || g === "fair" || g === "poor") return g;
  return null;
}

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

  let body: {
    odometerKm?: unknown;
    refreshVehicle?: unknown;
    captureVin?: unknown;
    conditionGrade?: unknown;
  } = {};
  try {
    body = (await req.json()) as typeof body;
  } catch {
    body = {};
  }

  const patch: Parameters<typeof updateReport>[1] = {};

  const captureVin = normalizeCaptureVin(body.captureVin);
  if (captureVin) {
    const prior = report.lavVerification;
    patch.vehicle = {
      ...report.vehicle,
      vin: captureVin,
    };
    patch.lavVerification = {
      ...(prior ?? {
        vehicleMake: report.vehicle.make,
        vehicleModel: report.vehicle.model,
        badge: null,
        colour: report.vehicle.colour || null,
        buildOrCompliance: report.vehicle.year
          ? String(report.vehicle.year)
          : null,
        rego: report.vehicle.rego || null,
        state: report.vehicle.state ?? null,
        identifiersMatched: true,
        autograbSource: "manual",
      }),
      vin: captureVin,
      identifiersMatched: true,
    };
  }

  const conditionGrade = normalizeConditionGrade(body.conditionGrade);
  if (conditionGrade) {
    patch.lavConditionGrade = conditionGrade;
  }

  const odometerRaw = body.odometerKm;
  if (odometerRaw != null && odometerRaw !== "") {
    const km = Number(odometerRaw);
    if (Number.isFinite(km) && km > 0) {
      patch.vehicle = {
        ...(patch.vehicle ?? report.vehicle),
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
        vin:
          captureVin ??
          (patch.vehicle as typeof report.vehicle | undefined)?.vin ??
          lookup.vehicle.vin,
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
        vin: captureVin ?? lookup.vehicle.vin ?? prior?.vin ?? null,
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
