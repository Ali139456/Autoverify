import { AlertTriangle, Camera, CheckCircle2 } from "lucide-react";
import { getInspectionPhotoUrl } from "@/lib/report-design";
import type { DamageAnalysis, InspectionPhoto, VehicleReport } from "@/lib/types";
import { InspectionStarter } from "@/components/InspectionStarter";
import { DamageUpload } from "@/components/DamageUpload";
import { ReportShell } from "./ReportShell";

const money = (n: number) => `$${n.toLocaleString("en-AU")}`;

function PhotoTile({
  photo,
  caption,
}: {
  photo: InspectionPhoto;
  caption?: string;
}) {
  const url = getInspectionPhotoUrl(photo);

  return (
    <figure className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
      <div className="relative aspect-[4/3] bg-slate-100">
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={url}
            alt={photo.label}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-slate-400">
            <Camera className="h-8 w-8" aria-hidden />
          </div>
        )}
      </div>
      <figcaption className="border-t border-slate-200 px-3 py-2">
        <p className="text-xs font-bold text-slate-700">{photo.label}</p>
        {caption ? (
          <p className="mt-0.5 text-[11px] text-red-600">{caption}</p>
        ) : null}
      </figcaption>
    </figure>
  );
}

export function InsightsPlusBodyReport({
  report,
  photos,
  inspectUrl,
  showActions = false,
  pageLabel = "2 / 2",
}: {
  report: VehicleReport;
  photos: InspectionPhoto[];
  inspectUrl?: string | null;
  showActions?: boolean;
  pageLabel?: string;
}) {
  const { vehicle, damage } = report;
  const vehicleTitle = `${vehicle.make} ${vehicle.model} ${vehicle.variant} ${vehicle.year}`.trim();

  const damageByPanel = new Map<string, string>();
  damage?.findings.forEach((f) => {
    damageByPanel.set(f.panel.toLowerCase(), `${f.type} · ${f.severity}`);
  });

  const walkaroundPhotos = photos.length > 0 ? photos : [];

  return (
    <ReportShell
      reportId={report.id}
      generatedAt={report.createdAt}
      pageLabel={pageLabel}
    >
      <div className="space-y-8">
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

        {damage ? (
          <DamageSummary damage={damage} />
        ) : (
          <p className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-sm text-slate-500">
            Complete the guided mobile walkaround to populate AI damage analysis
            and inspection photos in this report.
          </p>
        )}

        <div>
          <h3 className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
            Walkaround photos
          </h3>
          {walkaroundPhotos.length > 0 ? (
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {walkaroundPhotos.map((photo) => (
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
          ) : (
            <p className="mt-3 text-sm text-slate-500">No walkaround photos yet.</p>
          )}
        </div>

        {damage && damage.findings.length > 0 && (
          <div>
            <h3 className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
              Detected damage
            </h3>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {damage.findings.map((finding, i) => (
                <div
                  key={`${finding.panel}-${i}`}
                  className="rounded-xl border border-red-100 bg-red-50/50 p-4"
                >
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" aria-hidden />
                    <div>
                      <p className="font-bold text-slate-900">{finding.panel}</p>
                      <p className="text-sm text-red-700">
                        {finding.type} · {finding.severity}
                      </p>
                      {finding.description ? (
                        <p className="mt-1 text-xs text-slate-600">{finding.description}</p>
                      ) : null}
                      <p className="mt-2 text-sm font-semibold text-slate-700">
                        Est. repair {money(finding.repairEstimate)} ·{" "}
                        {Math.round(finding.confidence * 100)}% confidence
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </ReportShell>
  );
}

function DamageSummary({ damage }: { damage: DamageAnalysis }) {
  return (
    <div className="flex flex-wrap items-center gap-4 rounded-xl border border-slate-200 bg-slate-50 p-5">
      <span className="inline-flex items-center gap-2 rounded-full bg-[#0073E3]/10 px-4 py-1.5 text-sm font-bold text-[#0073E3]">
        Overall condition: {damage.overallCondition}
      </span>
      <span className="text-sm text-slate-600">
        {damage.analyzedPhotos} photo(s) analyzed
      </span>
      {damage.findings.length === 0 ? (
        <span className="inline-flex items-center gap-2 text-sm font-medium text-emerald-600">
          <CheckCircle2 className="h-4 w-4" aria-hidden />
          No visible damage detected
        </span>
      ) : (
        <span className="text-sm font-semibold text-slate-700">
          Total estimated repair: {money(damage.totalRepairEstimate)}
        </span>
      )}
    </div>
  );
}
