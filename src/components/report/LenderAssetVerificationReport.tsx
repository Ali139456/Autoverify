import type { DamageAnalysis, VehicleReport } from "@/lib/types";
import { ReportGeneralDisclaimer } from "@/components/report/ReportGeneralDisclaimer";

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-slate-200 py-2.5 text-sm dark:border-white/10">
      <span className="text-slate-600 dark:text-slate-400">{label}</span>
      <span className="max-w-[55%] text-right font-semibold text-slate-900 dark:text-white">
        {value}
      </span>
    </div>
  );
}

export function LenderAssetVerificationReport({
  report,
  damage,
  inspectUrl,
}: {
  report: VehicleReport;
  damage: DamageAnalysis | null;
  inspectUrl: string | null;
}) {
  const v = report.lavVerification;
  const ctx = report.lavContext;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 print:max-w-none print:px-8">
      <p className="text-xs font-bold uppercase tracking-widest text-accent-500">
        Lender asset verification
      </p>
      <h1 className="mt-2 text-2xl font-extrabold text-slate-900 dark:text-white sm:text-3xl">
        Verification summary
      </h1>
      {ctx ? (
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          Booking {ctx.bookingRef} · Asset {ctx.assetIndex + 1} ·{" "}
          {ctx.inspectionType === "digital"
            ? "Digital Self Inspection"
            : "Physical inspection"}
        </p>
      ) : null}

      <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 dark:border-white/10 dark:bg-ink-800">
        <Row
          label="Vehicle verification"
          value={v?.identifiersMatched ? "Key identifiers matched" : "Pending"}
        />
        <p className="border-b border-slate-200 py-3 text-xs font-bold uppercase tracking-widest text-accent-500 dark:border-white/10">
          Vehicle details
        </p>
        <Row label="Make" value={v?.vehicleMake || report.vehicle.make} />
        <Row label="Model" value={v?.vehicleModel || report.vehicle.model} />
        {v?.badge ? <Row label="Badge / variant" value={v.badge} /> : null}
        {v?.colour ? <Row label="Colour" value={v.colour} /> : null}
        {v?.buildOrCompliance ? (
          <Row label="Build / compliance" value={v.buildOrCompliance} />
        ) : null}
        <Row label="VIN identification captured" value={v?.vin ? "Yes" : "Pending"} />
        <Row
          label="Registration"
          value={
            v?.rego
              ? `${v.rego}${v.state ? ` ${v.state}` : ""}`
              : report.vehicle.rego || "—"
          }
        />
        <Row
          label="Odometer captured"
          value={
            report.vehicle.odometer != null
              ? `${report.vehicle.odometer.toLocaleString("en-AU")} km`
              : "Pending capture"
          }
        />
        <Row label="Photos" value="Date & time stamped images" />
        <Row
          label="Condition"
          value={
            damage?.findings?.length
              ? "Verified using AI damage detection"
              : "Awaiting inspection / AI scan"
          }
        />
        <Row label="Report delivered" value="Real time on completion" />
        {v?.autograbSource ? (
          <Row label="Identity data" value={`AutoGrab (${v.autograbSource})`} />
        ) : null}
      </div>

      {inspectUrl ? (
        <p className="mt-6 text-sm text-slate-600 dark:text-slate-400">
          Vendor capture link:{" "}
          <a
            href={inspectUrl}
            className="font-medium text-accent-500 underline"
          >
            Open inspection
          </a>
        </p>
      ) : null}

      <div className="mt-10">
        <ReportGeneralDisclaimer />
      </div>
    </div>
  );
}
