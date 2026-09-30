import Image from "next/image";
import Link from "next/link";
import type { VehicleReport } from "@/lib/types";
import {
  hasPpsrCertificate,
  isSampleReportId,
  ppsrCertificateProxyPath,
  SAMPLE_PPSR_CERTIFICATE_IMAGE,
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
      className="report-shell-ppsr !overflow-visible"
    >
      <section className="report-ppsr-certificate space-y-3">
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
        </div>

        <div className="report-ppsr-viewer overflow-visible rounded-lg border border-slate-300 bg-white">
          {isSample ? (
            <Image
              src={SAMPLE_PPSR_CERTIFICATE_IMAGE}
              alt="PPSR serial number search certificate (sample)"
              width={1240}
              height={1754}
              className="report-ppsr-full-image h-auto w-full max-w-full object-contain object-left-top"
              priority
            />
          ) : (
            <iframe
              src={proxyUrl}
              title="PPSR search certificate"
              className="report-ppsr-iframe block h-[1200px] w-full bg-slate-100"
            />
          )}
        </div>

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
