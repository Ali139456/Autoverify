import type { ReactNode } from "react";
import { Camera } from "lucide-react";
import {
  getInspectionPhotoUrl,
  formatReportReference,
} from "@/lib/report-design";
import {
  INSPECTION_RECORD_ONLY_FOOTNOTE_WITH_STAR,
  isRecordOnlyInspectionPhoto,
  formatInspectionPhotoTileLabel,
  getInspectionAngleLabel,
} from "@/lib/inspection-angles";
import type { InspectionPhoto, VehicleReport } from "@/lib/types";
import { InspectionStarter } from "@/components/InspectionStarter";
import { ReportShell } from "./ReportShell";
import { InspectionPhotoEvidenceCaption } from "./InspectionPhotoEvidence";
import { ReportGuidedPhotoDisclaimer } from "./ReportGuidedPhotoDisclaimer";

function PhotoTile({
  photo,
  showAngleLabel = true,
}: {
  photo: InspectionPhoto;
  showAngleLabel?: boolean;
}) {
  const url = getInspectionPhotoUrl(photo);
  const isFrontRego = photo.angle === "front";
  const tileLabel = formatInspectionPhotoTileLabel(
    getInspectionAngleLabel(photo.angle),
    photo.angle,
  );
  const imageAlt = showAngleLabel ? tileLabel : "Condition verification photo";
  return (
    <figure className="report-photo-tile overflow-hidden rounded-lg border border-slate-200 bg-white">
      <div className="relative flex min-h-[180px] items-center justify-center bg-slate-100 sm:min-h-[220px]">
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={url}
            alt={imageAlt}
            className="max-h-[200px] w-full max-w-full object-contain object-center sm:max-h-[240px]"
          />
        ) : (
          <div className="flex h-full min-h-[180px] w-full items-center justify-center text-slate-400 sm:min-h-[220px]">
            <Camera className="h-6 w-6" aria-hidden />
          </div>
        )}
      </div>
      <figcaption className="border-t border-slate-200 px-2 py-1.5">
        {showAngleLabel ? (
          <p className="text-[10px] font-bold leading-snug text-slate-900 sm:text-[11px]">
            {tileLabel}
            {isFrontRego ? (
              <span className="font-normal text-slate-600"> (rego visible)</span>
            ) : null}
          </p>
        ) : null}
        <InspectionPhotoEvidenceCaption photo={photo} />
      </figcaption>
    </figure>
  );
}

function PhotoGroup({
  title,
  photos,
  note,
  gridClassName,
  showAngleLabels = true,
  trailing,
}: {
  title?: string;
  photos: InspectionPhoto[];
  note?: string;
  gridClassName?: string;
  showAngleLabels?: boolean;
  trailing?: ReactNode;
}) {
  if (photos.length === 0) return null;
  const hasRecordOnlyPhoto = photos.some((photo) =>
    isRecordOnlyInspectionPhoto(photo.angle),
  );
  return (
    <div className="report-inspection-photos">
      {title ? (
        <h3 className="text-xs font-bold uppercase tracking-[0.16em] text-slate-900">
          {title}
        </h3>
      ) : null}
      {note ? (
        <p className="mt-1 text-[11px] leading-relaxed text-slate-500">{note}</p>
      ) : null}
      <div
        className={
          gridClassName ??
          "report-photo-grid mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4"
        }
      >
        {photos.map((photo) => (
          <PhotoTile
            key={`${photo.angle}-${photo.uploadedAt}`}
            photo={photo}
            showAngleLabel={showAngleLabels}
          />
        ))}
      </div>
      {hasRecordOnlyPhoto ? (
        <p className="report-record-only-footnote mt-3 mb-2 max-w-full text-left text-[10px] leading-snug text-slate-500">
          {INSPECTION_RECORD_ONLY_FOOTNOTE_WITH_STAR}
        </p>
      ) : null}
      {trailing}
    </div>
  );
}

function InsightsPlusTitleBlock({ vehicleTitle }: { vehicleTitle: string }) {
  return (
    <div className="report-insights-plus-title">
      <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
        Auto Verifi Insights+ Report
      </h1>
      <p className="mt-2 text-lg font-bold text-[#0073E3]">{vehicleTitle}</p>
      <div className="mt-4 border-l-4 border-[#0073E3] pl-4">
        <h2 className="text-sm font-extrabold uppercase tracking-[0.16em] text-slate-900">
          Condition verification
        </h2>
      </div>
    </div>
  );
}

export function InsightsPlusBodyReport({
  report,
  photos,
  inspectUrl,
  showActions = false,
  photosPageLabel,
  additionalPhotosPageLabel,
  trailingContent,
}: {
  report: VehicleReport;
  photos: InspectionPhoto[];
  inspectUrl?: string | null;
  showActions?: boolean;
  photosPageLabel: string;
  additionalPhotosPageLabel?: string;
  /** Rendered at the end of the last Insights+ sheet (e.g. general disclaimer). */
  trailingContent?: ReactNode;
}) {
  const { vehicle } = report;
  const vehicleTitle = `${vehicle.make} ${vehicle.model} ${vehicle.variant} ${vehicle.year}`.trim();

  const walkaroundPhotos = photos.filter(
    (photo) => !isRecordOnlyInspectionPhoto(photo.angle),
  );
  const additionalPhotos = photos.filter((photo) =>
    isRecordOnlyInspectionPhoto(photo.angle),
  );
  const shellProps = {
    reportId: report.id,
    generatedAt: report.createdAt,
    reportReference: formatReportReference(report.vehicle),
  };
  const disclaimerOnLastSheet = additionalPhotos.length === 0;

  return (
    <>
      <div className="report-page-break report-page-flow report-sheet-pin-footer report-insights-plus-walkaround-sheet">
        <ReportShell
          {...shellProps}
          pageLabel={photosPageLabel}
          className="report-shell-insights-plus report-shell-insights-plus-photos !overflow-visible"
        >
          <div className="report-insights-plus-photos-body space-y-6">
            <InsightsPlusTitleBlock vehicleTitle={vehicleTitle} />

            {showActions ? (
              <div className="report-no-print rounded-xl border border-slate-200 bg-slate-50 p-4">
                <InspectionStarter
                  reportId={report.id}
                  initialInspectUrl={inspectUrl}
                  customerPhone={report.customerPhone}
                  ownerPhone={report.ownerPhone}
                  autoShowQr={!inspectUrl}
                />
              </div>
            ) : null}

            {photos.length === 0 ? (
              <p className="text-sm text-slate-500">
                Complete the guided photo capture to show current condition images
                in this report.
              </p>
            ) : null}

            <PhotoGroup photos={walkaroundPhotos} showAngleLabels />

            {disclaimerOnLastSheet ? (
              <>
                <ReportGuidedPhotoDisclaimer className="mt-6" />
                {trailingContent}
              </>
            ) : null}
          </div>
        </ReportShell>
      </div>

      {additionalPhotos.length > 0 && additionalPhotosPageLabel ? (
        <div className="report-page-break report-sheet-pin-footer report-insights-plus-additional-sheet">
          <ReportShell
            {...shellProps}
            pageLabel={additionalPhotosPageLabel}
            className="report-shell-insights-plus report-shell-insights-plus-photos report-shell-insights-plus-photos-continued !overflow-visible"
          >
            <div className="report-insights-plus-photos-body space-y-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                Auto Verifi Insights+ · {vehicleTitle}
              </p>
              <PhotoGroup
                title="Additional photos"
                photos={additionalPhotos}
                note="Keys and Registration paper records from the guided inspection."
                gridClassName="report-photo-grid report-photo-grid-additional mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-3"
                trailing={
                  <>
                    <ReportGuidedPhotoDisclaimer className="mt-6" />
                    {trailingContent}
                  </>
                }
              />
            </div>
          </ReportShell>
        </div>
      ) : null}
    </>
  );
}