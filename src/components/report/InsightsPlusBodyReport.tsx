import type { ReactNode } from "react";
import { AlertTriangle, Camera, CheckCircle2 } from "lucide-react";
import {
  getInspectionPhotoUrl,
  formatReportReference,
  resolveDamageFindingImageUrl,
} from "@/lib/report-design";
import { isExteriorInspectionAngle } from "@/lib/inspection-angles";
import type { InspectionPhoto, VehicleReport } from "@/lib/types";
import { InspectionStarter } from "@/components/InspectionStarter";
import { DamageUpload } from "@/components/DamageUpload";
import { ReportShell } from "./ReportShell";
import { InspectionPhotoEvidenceCaption } from "./InspectionPhotoEvidence";

function PhotoTile({
  photo,
  caption,
}: {
  photo: InspectionPhoto;
  caption?: string;
}) {
  const url = getInspectionPhotoUrl(photo);
  const isFrontRego = photo.angle === "front";

  return (
    <figure className="report-photo-tile overflow-hidden rounded-lg border border-slate-200 bg-white">
      <div className="relative aspect-[4/3] bg-[#020617]">
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={url}
            alt={photo.label}
            className="h-full w-full object-contain object-center"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-slate-400">
            <Camera className="h-6 w-6" aria-hidden />
          </div>
        )}
      </div>
      <figcaption className="border-t border-slate-200 px-2 py-1.5">
        <p className="text-[11px] font-bold leading-snug text-slate-700">
          {photo.label}
          {isFrontRego ? (
            <span className="ml-1 font-normal text-slate-500">(rego visible)</span>
          ) : null}
        </p>
        <InspectionPhotoEvidenceCaption photo={photo} />
        {caption ? (
          <p className="mt-0.5 text-[10px] text-red-600">{caption}</p>
        ) : null}
      </figcaption>
    </figure>
  );
}

function PhotoGroup({
  title,
  photos,
  damageByPanel,
  note,
}: {
  title: string;
  photos: InspectionPhoto[];
  damageByPanel: Map<string, string>;
  note?: string;
}) {
  if (photos.length === 0) return null;
  return (
    <div className="report-inspection-photos">
      <h3 className="text-xs font-bold uppercase tracking-[0.16em] text-slate-900">
        {title}
      </h3>
      {note ? (
        <p className="mt-1 text-[11px] leading-relaxed text-slate-500">{note}</p>
      ) : null}
      <div className="report-photo-grid mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {photos.map((photo) => (
          <PhotoTile
            key={`${photo.angle}-${photo.uploadedAt}`}
            photo={photo}
            caption={
              damageByPanel.get(photo.label.toLowerCase()) ??
              damageByPanel.get(photo.angle.toLowerCase())
            }
          />
        ))}
      </div>
    </div>
  );
}

export function InsightsPlusBodyReport({
  report,
  photos,
  inspectUrl,
  showActions = false,
  pageLabel = "2 / 2",
  trailingContent,
}: {
  report: VehicleReport;
  photos: InspectionPhoto[];
  inspectUrl?: string | null;
  showActions?: boolean;
  pageLabel?: string;
  /** Rendered at the end of the page body (e.g. the general disclaimer). */
  trailingContent?: ReactNode;
}) {
  const { vehicle, damage } = report;
  const vehicleTitle = `${vehicle.make} ${vehicle.model} ${vehicle.variant} ${vehicle.year}`.trim();

  const damageByPanel = new Map<string, string>();
  damage?.findings.forEach((f) => {
    damageByPanel.set(f.panel.toLowerCase(), `${f.type} · ${f.severity}`);
  });

  const walkaroundPhotos = photos.filter((photo) =>
    isExteriorInspectionAngle(photo.angle),
  );
  const additionalPhotos = photos.filter(
    (photo) => !isExteriorInspectionAngle(photo.angle),
  );
  const shellProps = {
    reportId: report.id,
    generatedAt: report.createdAt,
    reportReference: formatReportReference(report.vehicle),
  };

  return (
    <ReportShell {...shellProps} pageLabel={pageLabel}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
            Auto Verifi Insights+ Report
          </h1>
          <p className="mt-2 text-lg font-bold text-[#0073E3]">{vehicleTitle}</p>
          <div className="mt-4 border-l-4 border-[#0073E3] pl-4">
            <h2 className="text-sm font-extrabold uppercase tracking-[0.16em] text-slate-900">
              Current Body Condition
            </h2>
            <p className="mt-1 text-base font-bold text-[#0073E3]">
              AI-Powered Image Analysis
            </p>
          </div>
        </div>

        {showActions && (
          <div className="report-no-print rounded-xl border border-slate-200 bg-slate-50 p-4">
            <InspectionStarter
              reportId={report.id}
              initialInspectUrl={inspectUrl}
              customerPhone={report.customerPhone}
              ownerPhone={report.ownerPhone}
              autoShowQr={!damage && !inspectUrl}
            />
            {!damage && (
              <div className="mt-4">
                <DamageUpload reportId={report.id} />
              </div>
            )}
          </div>
        )}

        {damage ? null : photos.length > 0 ? (
          <p className="rounded-xl border border-dashed border-[#0073E3]/40 bg-[#0073E3]/5 px-4 py-4 text-sm text-slate-600">
            {photos.length} photo(s) received. AI damage analysis is being
            processed and will appear here automatically once complete.
          </p>
        ) : (
          <p className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-sm text-slate-500">
            Complete the guided mobile walkaround to populate AI damage analysis
            and inspection photos in this report.
          </p>
        )}

        <PhotoGroup
          title="Walkaround photos"
          photos={walkaroundPhotos}
          damageByPanel={damageByPanel}
          note="Captured on the owner's device. Time and location are recorded beneath each photo when location access is granted; the front photo should show the registration plate."
        />

        <PhotoGroup
          title="Additional photos"
          photos={additionalPhotos}
          damageByPanel={damageByPanel}
        />

        {damage && damage.findings.length === 0 && photos.length > 0 ? (
          <p className="inline-flex items-center gap-2 text-sm font-medium text-emerald-600">
            <CheckCircle2 className="h-4 w-4" aria-hidden />
            No visible damage detected in the AI analysis.
          </p>
        ) : null}

        {damage && damage.findings.length > 0 && (
          <div className="report-detected-damage">
            <h3 className="text-xs font-bold uppercase tracking-[0.16em] text-slate-900">
              Detected damage
            </h3>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {damage.findings.map((finding, i) => {
                const damageImageUrl = resolveDamageFindingImageUrl(finding, photos);
                return (
                  <div
                    key={`${finding.panel}-${i}`}
                    className="report-damage-card flex overflow-hidden rounded-lg border border-red-100 bg-red-50/50"
                  >
                    {damageImageUrl ? (
                      <div className="relative w-[42%] shrink-0 bg-slate-100">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={damageImageUrl}
                          alt={`${finding.panel} — ${finding.type}`}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    ) : null}
                    <div className="flex items-start gap-2 p-3">
                      <AlertTriangle
                        className="mt-0.5 h-4 w-4 shrink-0 text-red-500"
                        aria-hidden
                      />
                      <div>
                        <p className="text-sm font-bold text-slate-900">{finding.panel}</p>
                        <p className="text-xs text-red-700">
                          {finding.type} · {finding.severity}
                        </p>
                        {finding.description ? (
                          <p className="mt-1 text-[11px] leading-snug text-slate-600">
                            {finding.description}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {trailingContent}
      </div>
    </ReportShell>
  );
}
