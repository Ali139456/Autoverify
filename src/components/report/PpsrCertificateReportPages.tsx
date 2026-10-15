"use client";

import type { ReactNode } from "react";
import type { VehicleReport } from "@/lib/types";
import {
  hasPpsrCertificate,
  ppsrCertificateProxyPath,
} from "@/lib/ppsr-certificate-public";
import { formatReportReference } from "@/lib/report-design";
import {
  PpsrCertificateIntro,
  PpsrCertificateLinks,
} from "./PpsrCertificateIntro";
import { ReportShell } from "./ReportShell";
import { usePpsrCertificateImages } from "./usePpsrCertificateImages";

function PpsrCertificateReportPagesBody({
  report,
  pageLabels,
}: {
  report: VehicleReport;
  pageLabels: string[];
}) {
  const proxyUrl = ppsrCertificateProxyPath(report);
  const directUrl = report.registration.ppsrCertificateUrl?.trim() ?? "";
  const { pageImages, error, loading } = usePpsrCertificateImages(proxyUrl);
  const reportReference = formatReportReference(report.vehicle);

  function shell(
    key: string,
    pageLabel: string,
    body: ReactNode,
    isFirst: boolean,
  ) {
    return (
      <div
        key={key}
        className="report-page-break report-ppsr-page-sheet"
      >
        <ReportShell
          reportId={report.id}
          generatedAt={report.createdAt}
          reportReference={reportReference}
          pageLabel={pageLabel}
          className="report-shell-ppsr !overflow-visible"
        >
          <section className="report-ppsr-certificate min-w-0 max-w-full space-y-3">
            {isFirst ? <PpsrCertificateIntro report={report} /> : null}
            {body}
            {isFirst ? (
              <PpsrCertificateLinks proxyUrl={proxyUrl} directUrl={directUrl} />
            ) : null}
          </section>
        </ReportShell>
      </div>
    );
  }

  if (loading) {
    return shell(
      "ppsr-loading",
      pageLabels[0] ?? "—",
      (
        <p className="px-4 py-10 text-center text-sm text-slate-500">
          Loading PPSR certificate…
        </p>
      ),
      true,
    );
  }

  if (error || pageImages.length === 0) {
    return shell(
      "ppsr-fallback",
      pageLabels[0] ?? "—",
      (
        <>
          <div className="report-ppsr-viewer min-w-0 max-w-full overflow-x-auto rounded-lg border border-slate-300 bg-white [-webkit-overflow-scrolling:touch]">
            <iframe
              src={proxyUrl}
              title="PPSR search certificate"
              className="report-ppsr-iframe report-ppsr-iframe-fallback block h-[1200px] w-full bg-slate-100"
            />
          </div>
          {error ? (
            <p className="report-no-print mt-2 text-xs text-amber-700">
              {error}
            </p>
          ) : null}
        </>
      ),
      true,
    );
  }

  return (
    <>
      {pageImages.map((src, index) =>
        shell(
          `ppsr-sheet-${index}`,
          pageLabels[index] ?? pageLabels[pageLabels.length - 1] ?? "—",
          (
            <div className="report-ppsr-viewer min-w-0 max-w-full overflow-x-auto rounded-lg border border-slate-300 bg-white [-webkit-overflow-scrolling:touch]">
              <div className="report-ppsr-rendered report-ppsr-rendered-single min-w-0 max-w-full">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={src}
                  alt={`PPSR certificate page ${index + 1}`}
                  className="report-ppsr-full-image mx-auto block h-auto w-full max-w-full object-contain object-top [max-width:100%]"
                  style={{ width: "100%", height: "auto" }}
                />
              </div>
            </div>
          ),
          index === 0,
        ),
      )}
    </>
  );
}

export function PpsrCertificateReportPages({
  report,
  pageLabels,
}: {
  report: VehicleReport;
  pageLabels: string[];
}) {
  if (!hasPpsrCertificate(report)) return null;
  return (
    <PpsrCertificateReportPagesBody report={report} pageLabels={pageLabels} />
  );
}
