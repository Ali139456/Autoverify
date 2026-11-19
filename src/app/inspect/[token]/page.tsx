import { notFound } from "next/navigation";
import { InspectionCapture } from "@/components/InspectionCapture";
import {
  getInspectionByToken,
  isInspectionExpired,
} from "@/lib/inspections";
import {
  isLavDigitalInspectionReport,
  resolveInspectionAnglesForReport,
} from "@/lib/inspection-angles";
import { getReport } from "@/lib/store";

export default async function InspectPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const inspection = await getInspectionByToken(token);

  if (!inspection) notFound();

  const report = await getReport(inspection.reportId);
  const angles = resolveInspectionAnglesForReport(report);
  const lavDigital = isLavDigitalInspectionReport(report);

  if (isInspectionExpired(inspection)) {
    return (
      <div className="min-h-[calc(100vh-6rem)] bg-white dark:bg-ink-950">
        <div className="mx-auto flex min-h-[70vh] max-w-lg flex-col items-center justify-center px-4 py-10 text-center">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Link expired
          </h1>
          <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
            This inspection link is no longer active. Open your Auto Verifi report
            to generate a new one.
          </p>
        </div>
      </div>
    );
  }

  const vehiclePrefilled =
    Boolean(
      report?.lavVerification?.autograbSource &&
        report.lavVerification.autograbSource !== "manual",
    ) ||
    Boolean(
      report?.lavVerification?.identifiersMatched &&
        report.vehicle.make?.trim() &&
        (report.vehicle.rego?.trim() || report.vehicle.vin?.trim()),
    );

  return (
    <InspectionCapture
      token={token}
      reportId={inspection.reportId}
      angles={angles}
      lavDigital={lavDigital}
      vehiclePrefilled={vehiclePrefilled}
      initialLookupIdentifier={
        report?.vehicle.rego?.trim() ||
        report?.lavVerification?.rego?.trim() ||
        report?.vehicle.vin?.trim() ||
        ""
      }
      initialLookupState={report?.vehicle.state ?? "NSW"}
      initialVin={
        report?.lavVerification?.vin?.trim() ||
        report?.vehicle.vin?.trim() ||
        ""
      }
      initialOdometerKm={
        report?.vehicle.odometer != null ? String(report.vehicle.odometer) : ""
      }
      initialOdometerSaved={Boolean(
        report?.vehicle.odometer != null &&
          (report.vehicle.odometerSource?.toLowerCase().includes("capture") ??
            false),
      )}
      initialPhotos={inspection.photos.map((photo) => ({
        angle: photo.angle,
        label: photo.label,
        uploadedAt: photo.uploadedAt,
      }))}
    />
  );
}
