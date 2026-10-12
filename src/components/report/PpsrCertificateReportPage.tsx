import Link from "next/link";
import type { VehicleReport } from "@/lib/types";

import {

  hasPpsrCertificate,

  isSampleReportId,

  ppsrCertificateProxyPath,

} from "@/lib/ppsr-certificate";

import {
  formatExpiryDate,
  formatReportReference,
} from "@/lib/report-design";
import { registrationDisplayStatus } from "@/lib/registration-info";
import { PpsrCertificateViewer } from "./PpsrCertificateViewer";
import { ReportShell } from "./ReportShell";

export function PpsrCertificateReportPage({

  report,

  pageLabel,

}: {

  report: VehicleReport;

  pageLabel: string;

}) {

  if (!hasPpsrCertificate(report)) return null;



  const proxyUrl = ppsrCertificateProxyPath(report);

  const directUrl = report.registration.ppsrCertificateUrl?.trim() ?? "";

  const isSample = isSampleReportId(report.id);
  const { registration } = report;
  const expiryIso = registration.expiryDate?.trim();
  const registrationStatus = registrationDisplayStatus(registration);

  return (

    <ReportShell

      reportId={report.id}

      generatedAt={report.createdAt}

      reportReference={formatReportReference(report.vehicle)}

      pageLabel={pageLabel}

      className="report-shell-ppsr !overflow-visible"

    >

      <section className="report-ppsr-certificate min-w-0 max-w-full space-y-3">

        <div className="report-ppsr-intro space-y-2">

          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#0073E3]">

            Official register search — PPSR certificate

          </p>

          <p className="report-ppsr-intro-detail text-sm leading-snug text-slate-600">

            Issued by AFSA via the Personal Property Securities Register.{" "}

            <a

              href="https://www.ppsr.gov.au/"

              target="_blank"

              rel="noopener noreferrer"

              className="font-semibold text-[#0073E3] hover:underline"

            >

              ppsr.gov.au

            </a>

          </p>

          {isSample ? (

            <p className="report-ppsr-sample-note rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs leading-relaxed text-amber-950">

              Sample demonstration certificate (redacted example).

            </p>

          ) : null}

          {!isSample ? (
            expiryIso ? (
              <div className="rounded-lg border border-sky-200 bg-sky-50 px-3 py-2.5 text-xs leading-relaxed text-slate-800">
                <p className="font-bold text-slate-900">
                  Registration expiry (registration authority data)
                </p>
                <p className="mt-1">
                  Status {registrationStatus} · Expiry{" "}
                  {formatExpiryDate(expiryIso)}
                </p>
                <p className="mt-1.5 text-slate-600">
                  The official PPSR certificate below may show &ldquo;No data
                  recorded&rdquo; next to registration expiry when NEVDIS does not
                  supply that field on the certificate. Use the expiry above and
                  the Registration insight on page 1, or verify on your state
                  road agency website.
                </p>
              </div>
            ) : (
              <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs leading-relaxed text-amber-950">
                Registration expiry was not returned on the PPSR certificate or
                our registration lookup for this report. If the certificate shows
                &ldquo;No data recorded&rdquo;, check Service NSW (or your state
                equivalent) for the current expiry date.
              </p>
            )
          ) : null}

        </div>



        <div className="report-ppsr-viewer min-w-0 max-w-full overflow-x-auto rounded-lg border border-slate-300 bg-white [-webkit-overflow-scrolling:touch]">
          <PpsrCertificateViewer proxyUrl={proxyUrl} />
        </div>

        <p className="report-no-print text-xs leading-relaxed text-slate-500 sm:hidden">
          Swipe down for all certificate pages. For pinch-zoom and full PDF controls, tap{" "}
          <span className="font-semibold text-[#0073E3]">Open PPSR certificate PDF</span>{" "}
          below.
        </p>



        <div className="report-ppsr-links report-no-print flex flex-wrap gap-4 text-sm">

          <Link

            href={proxyUrl}

            target="_blank"

            rel="noopener noreferrer"

            className="font-bold text-[#0073E3] hover:underline"

          >

            Open PPSR certificate PDF →

          </Link>

          {directUrl && directUrl !== proxyUrl ? (

            <a

              href={directUrl}

              target="_blank"

              rel="noopener noreferrer"

              className="text-slate-500 hover:text-slate-700"

            >

              Direct certificate link

            </a>

          ) : null}

        </div>

      </section>

    </ReportShell>

  );

}

