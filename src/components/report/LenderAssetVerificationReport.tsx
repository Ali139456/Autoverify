import type { InspectionPhoto, VehicleReport } from "@/lib/types";
import { getInspectionPhotoUrl } from "@/lib/report-design";
import { buildLavReportViewModel } from "@/lib/lav/lav-report-view";
import {
  formatLavValuationRange,
  lavValuationHasData,
  lavValuationRows,
} from "@/lib/lav/lav-valuation";
import {
  LAV_REPORT_DISCLAIMER_FOOTER,
  LAV_REPORT_DISCLAIMER_SECTIONS,
  LAV_REPORT_DISCLAIMER_TITLE,
} from "@/lib/lav/lav-disclaimer";
import { InspectionPhotoEvidenceCaption } from "./InspectionPhotoEvidence";
import { ReportGeneralDisclaimer } from "./ReportGeneralDisclaimer";
import { ReportShell } from "./ReportShell";
import "./lav-report.css";

function ConditionOption({
  label,
  active,
}: {
  label: string;
  active: boolean;
}) {
  return (
    <span
      className={`lav-report-condition-option ${active ? "is-on" : ""}`}
    >
      <span className="lav-report-condition-box" aria-hidden>
        {active ? "✓" : ""}
      </span>
      {label}
    </span>
  );
}

function LavPhotoTile({
  slot,
  odometerDisplay,
  large,
}: {
  slot: { title: string; photo: InspectionPhoto | null };
  odometerDisplay?: string | null;
  large?: boolean;
}) {
  const url = slot.photo ? getInspectionPhotoUrl(slot.photo) : null;
  return (
    <figure className="overflow-hidden rounded-lg border border-slate-200 bg-white">
      <div
        className={`lav-report-photo-tile-image flex items-center justify-center bg-slate-100 ${
          large
            ? "lav-report-photo-tile-image--large min-h-[200px]"
            : "min-h-[140px] sm:min-h-[160px]"
        }`}
      >
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={url}
            alt={slot.title}
            className="lav-report-photo-tile-img h-full w-full object-cover object-center"
          />
        ) : (
          <span className="px-3 text-center text-[11px] text-slate-400">
            Awaiting capture
          </span>
        )}
      </div>
      <figcaption className="border-t border-slate-200 px-2 py-1.5">
        <p className="text-[10px] font-bold leading-snug text-slate-900">
          {slot.title}
        </p>
        {slot.photo ? (
          <InspectionPhotoEvidenceCaption
            photo={slot.photo}
            lavOdometerDisplay={odometerDisplay}
          />
        ) : null}
      </figcaption>
    </figure>
  );
}

export function LenderAssetVerificationReport({
  report,
  photos,
  inspectUrl,
  pageCount = { body: 2, total: 2 },
}: {
  report: VehicleReport;
  damage?: null;
  photos: InspectionPhoto[];
  inspectUrl: string | null;
  pageCount?: { body: number; total: number };
}) {
  const vm = buildLavReportViewModel(report, photos, null);
  const pageLabel = (n: number) => `${n} / ${pageCount.total}`;
  const valuationRows = lavValuationHasData(report.valuation)
    ? lavValuationRows(report.valuation)
    : [];
  const shellProps = {
    reportId: report.id,
    generatedAt: report.createdAt,
    reportReference: vm.reportRef,
    reportTitle: vm.title,
    showReportRefInFooter: false,
  };

  return (
    <div className="lav-report-stack mx-auto max-w-5xl px-3 pb-12 pt-4 sm:px-6">
      <div className="report-page-break">
        <ReportShell
          {...shellProps}
          pageLabel={pageLabel(1)}
          className="report-shell-lav !overflow-visible"
        >
          <h2 className="lav-report-section-heading !mt-0">Vehicle details</h2>

          <div className="lav-report-page1-grid lav-report-page1-grid--details-only">
            <div className="lav-report-field">
              <label>Make</label>
              <p>{vm.make}</p>
            </div>
            <div className="lav-report-field">
              <label>Model</label>
              <p>{vm.model}</p>
            </div>
            <div className="lav-report-field">
              <label>Badge</label>
              <p>{vm.badge}</p>
            </div>
            <div className="lav-report-field">
              <label>Year</label>
              <p>{vm.year}</p>
            </div>
            <div className="lav-report-field">
              <label>VIN</label>
              <p className="break-all">{vm.vin}</p>
            </div>
            <div className="lav-report-field">
              <label>Registration plate</label>
              <p>{vm.regoDisplay}</p>
            </div>
            <div className="lav-report-field">
              <label>State</label>
              <p>{vm.registrationState}</p>
            </div>
            <div className="lav-report-field">
              <label>Registration expiry</label>
              <p>{vm.registrationExpiry}</p>
            </div>
            <div className="lav-report-field">
              <label>Odometer</label>
              <p>{vm.odometer}</p>
            </div>
            <div className="lav-report-field">
              <label>Body</label>
              <p>{vm.body}</p>
            </div>
            <div className="lav-report-field">
              <label>Colour</label>
              <p>{vm.colour}</p>
            </div>
          </div>

          <div className="lav-report-summary">
            <h4>Inspection summary</h4>
            <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">
              Overall condition of vehicle
            </p>
            <div className="lav-report-condition-row">
              <ConditionOption label="Good" active={vm.conditionGrade === "good"} />
              <ConditionOption label="Fair" active={vm.conditionGrade === "fair"} />
              <ConditionOption label="Poor" active={vm.conditionGrade === "poor"} />
            </div>
          </div>

          <h2 className="lav-report-section-heading">Verification photos</h2>
          <p className="mb-3 text-xs text-slate-500">
            Date, time stamped and geo tagged images from digital self inspection.
          </p>

          <div className="lav-report-photo-grid lav-report-photo-grid--walkaround">
            {vm.walkaround.map((slot) => (
              <LavPhotoTile
                key={slot.angleId}
                slot={slot}
                large
                odometerDisplay={vm.odometer}
              />
            ))}
          </div>
          <div className="lav-report-photo-grid lav-report-photo-grid--id mt-4">
            {vm.identification.map((slot) => (
              <LavPhotoTile
                key={slot.angleId}
                slot={slot}
                odometerDisplay={vm.odometer}
              />
            ))}
          </div>

          {inspectUrl ? (
            <p className="report-no-print mt-4 text-sm text-slate-600">
              Vendor capture link:{" "}
              <a href={inspectUrl} className="font-semibold text-[#0073E3] underline">
                Open inspection
              </a>
              {" "}
              ({vm.captureProgress} photos)
            </p>
          ) : null}
        </ReportShell>
      </div>

      <div className="report-page-break">
        <ReportShell {...shellProps} pageLabel={pageLabel(2)} className="report-shell-lav">
          {valuationRows.length > 0 ? (
            <div className="report-supplementary report-present-value rounded-xl border border-slate-200 bg-slate-50 p-5">
              <h3 className="text-xs font-bold uppercase tracking-wide text-slate-900">
                Valuation
              </h3>
              <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                Present value — market valuation
              </p>
              <div className="report-valuation-grid mt-3 grid gap-3 sm:grid-cols-3">
                {valuationRows.map((row) => (
                  <div
                    key={row.label}
                    className="rounded-lg bg-white p-4 ring-1 ring-slate-200"
                  >
                    <p className="text-xs text-slate-500">{row.label}</p>
                    <p className="report-currency mt-1 text-sm font-bold text-[#0073E3]">
                      {formatLavValuationRange(row.low, row.high)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          <div className="lav-report-disclaimer mt-8">
            <h3>{LAV_REPORT_DISCLAIMER_TITLE}</h3>
            {LAV_REPORT_DISCLAIMER_SECTIONS.map((section) => (
              <section key={section.heading}>
                <h4>{section.heading}</h4>
                <p>{section.body}</p>
              </section>
            ))}
            <footer>{LAV_REPORT_DISCLAIMER_FOOTER}</footer>
          </div>

          <ReportGeneralDisclaimer />
        </ReportShell>
      </div>
    </div>
  );
}