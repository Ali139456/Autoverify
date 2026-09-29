import Link from "next/link";
import type { VehicleReport } from "@/lib/types";
import {
  hasPpsrCertificate,
  isSampleReportId,
  ppsrCertificateProxyPath,
} from "@/lib/ppsr-certificate";
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

  return (
    <ReportShell
      reportId={report.id}
      generatedAt={report.createdAt}
      pageLabel={pageLabel}
    >
      <section className="report-ppsr-certificate space-y-5">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">
            Official register search
          </p>
          <h2 className="mt-1 text-2xl font-extrabold text-emerald-900">
            PPSR certificate
          </h2>
        </div>

        <p className="text-sm leading-relaxed text-slate-600">
          The following certificate has been issued by the{" "}
          <strong>Australian Financial Security Authority (AFSA)</strong> via the
          Personal Property Securities Register (PPSR). To help you understand the
          certificate, terminology and search results, see the official guidance at{" "}
          <a
            href="https://www.ppsr.gov.au/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-[#0073E3] hover:underline"
          >
            ppsr.gov.au
          </a>
          .
        </p>

        <p className="text-xs leading-relaxed text-slate-500">
          This certificate should be read together with your Auto Verifi report. It
          reflects PPSR data at the time the search was generated and may not include
          events recorded afterwards.
        </p>

        {isSample ? (
          <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs leading-relaxed text-amber-950">
            Sample report: the PDF below is a demonstration certificate (for example
            from a car history pack). Your purchased report uses a live PPSR search for
            your vehicle.
          </p>
        ) : null}

        <div className="overflow-hidden rounded-xl border-2 border-slate-300 bg-white shadow-inner">
          <iframe
            src={proxyUrl}
            title="PPSR search certificate"
            className="report-ppsr-iframe block h-[min(1200px,85vh)] w-full bg-slate-100"
          />
        </div>

        <div className="flex flex-wrap gap-4 text-sm">
          <Link
            href={proxyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold text-[#0073E3] hover:underline"
          >
            Open PPSR certificate in new tab →
          </Link>
          {directUrl !== proxyUrl ? (
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
