import type { DamageAnalysis, InspectionPhoto, VehicleReport } from "@/lib/types";
import {
  AI_DAMAGE_PROCESSING_WALKAROUND_BANNER,
} from "@/lib/damage-processing-copy";
import { getInspectionPhotoUrl } from "@/lib/report-design";
import {
  buildLavReportViewModel,
  lavDamageLabelForAngle,
} from "@/lib/lav/lav-report-view";
import {
  LAV_REPORT_DISCLAIMER_FOOTER,
  LAV_REPORT_DISCLAIMER_SECTIONS,
  LAV_REPORT_DISCLAIMER_TITLE,
} from "@/lib/lav/lav-disclaimer";
import { InspectionPhotoEvidenceCaption } from "./InspectionPhotoEvidence";
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

function LavPhotoTile({ slot }: { slot: { title: string; photo: InspectionPhoto | null } }) {
  const url = slot.photo ? getInspectionPhotoUrl(slot.photo) : null;
  return (
    <figure className="overflow-hidden rounded-lg border border-slate-200 bg-white">
      <div className="flex min-h-[120px] items-center justify-center bg-slate-100 sm:min-h-[140px]">
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={url}
            alt={slot.title}
            className="max-h-[160px] w-full object-contain"
          />
        ) : (
          <span className="px-3 text-center text-[11px] text-slate-400">
            Awaiting capture
          </span>
        )}
      </div>
      <figcaption className="border-t border-slate-200 px-2 py-1.5">
        <p className="text-[10px] font-bold text-slate-900">{slot.title}</p>
        {slot.photo ? (
          <InspectionPhotoEvidenceCaption photo={slot.photo} />
        ) : null}
      </figcaption>
    </figure>
  );
}

export function LenderAssetVerificationReport({
  report,
  damage,
  photos,
  inspectUrl,
}: {
  report: VehicleReport;
  damage: DamageAnalysis | null;
  photos: InspectionPhoto[];
  inspectUrl: string | null;
}) {
  const vm = buildLavReportViewModel(report, photos, damage);
  const shellProps = {
    reportId: report.id,
    generatedAt: report.createdAt,
    reportReference: vm.reportRef,
  };

  const heroUrl = vm.heroPhoto ? getInspectionPhotoUrl(vm.heroPhoto) : null;

  return (
    <div className="lav-report-stack mx-auto max-w-5xl px-3 pb-12 pt-4 sm:px-6">
      <div className="report-page-break">
        <ReportShell
          {...shellProps}
          pageLabel={`1 / 4`}
          className="report-shell-lav !overflow-visible"
        >
          <h1 className="lav-report-title">{vm.title}</h1>

          <div className="lav-report-asset-types mt-4">
            {vm.assetTypes.map((type) => (
              <span
                key={type}
                className={`lav-report-asset-chip ${
                  type === vm.assetType ? "is-selected" : ""
                }`}
              >
                {type === vm.assetType ? "✓ " : null}
                {type}
              </span>
            ))}
          </div>

          <h2 className="lav-report-section-heading">Vehicle details</h2>

          <div className="lav-report-page1-grid">
            <div className="lav-report-field">
              <label>Make</label>
              <p>{vm.make}</p>
            </div>
            <div className="lav-report-field">
              <label>Model</label>
              <p>{vm.model}</p>
            </div>
            <div className="lav-report-hero-photo">
              {heroUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={heroUrl} alt="" />
              ) : (
                <span className="px-3 text-center text-xs text-slate-400">
                  Vehicle photo
                </span>
              )}
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
            <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">
              Additional inspector comments
            </p>
            <p className="text-sm text-slate-600">{vm.inspectorComments}</p>
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
        <ReportShell {...shellProps} pageLabel="2 / 4" className="report-shell-lav">
          <h2 className="lav-report-section-heading !mt-0">Vehicle photos</h2>

          {!damage && vm.hasPhotos ? (
            <p className="report-no-print mb-3 rounded-lg border border-dashed border-[#0073E3]/40 bg-[#0073E3]/5 px-3 py-2 text-sm text-slate-600">
              {AI_DAMAGE_PROCESSING_WALKAROUND_BANNER}
            </p>
          ) : null}

          <div className="lav-report-photo-grid">
            {vm.walkaround.map((slot) => (
              <LavPhotoTile key={slot.angleId} slot={slot} />
            ))}
          </div>

          <h3 className="mt-6 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-900">
            AI damage scan
          </h3>
          <p className="mt-1 text-sm font-semibold text-slate-700">
            {vm.aiScanSummary}
          </p>
          <div className="lav-report-damage-grid">
            {vm.walkaround.map((slot) => (
              <div key={slot.angleId} className="lav-report-damage-card">
                <h5>{slot.title}</h5>
                <p>{lavDamageLabelForAngle(slot.angleId, damage)}</p>
              </div>
            ))}
          </div>
        </ReportShell>
      </div>

      <div className="report-page-break">
        <ReportShell {...shellProps} pageLabel="3 / 4" className="report-shell-lav">
          <h2 className="lav-report-section-heading !mt-0">Identification photos</h2>
          <div className="lav-report-photo-grid lav-report-photo-grid--id">
            {vm.identification.map((slot) => (
              <LavPhotoTile key={slot.angleId} slot={slot} />
            ))}
          </div>
        </ReportShell>
      </div>

      <div className="report-page-break">
        <ReportShell {...shellProps} pageLabel="4 / 4" className="report-shell-lav">
          <div className="lav-report-disclaimer">
            <h3>{LAV_REPORT_DISCLAIMER_TITLE}</h3>
            {LAV_REPORT_DISCLAIMER_SECTIONS.map((section) => (
              <section key={section.heading}>
                <h4>{section.heading}</h4>
                <p>{section.body}</p>
              </section>
            ))}
            <footer>{LAV_REPORT_DISCLAIMER_FOOTER}</footer>
          </div>
        </ReportShell>
      </div>
    </div>
  );
}
