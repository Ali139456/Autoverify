import type { VehicleReport } from "./types";

/** Full-page PNG for sample reports (embedded in print layout). */
export const SAMPLE_PPSR_CERTIFICATE_IMAGE = "/sample/ppsr-certificate.png";

/** Typical AFSA PPSR search certificate length (one report sheet per PDF page). */
export const PPSR_CERTIFICATE_SHEET_COUNT = 3;

export function isSampleReportId(reportId: string): boolean {
  return reportId.startsWith("SAMPLE-");
}

export function hasPpsrCertificate(report: VehicleReport): boolean {
  if (isSampleReportId(report.id)) return true;
  const url = report.registration.ppsrCertificateUrl?.trim();
  return Boolean(url?.startsWith("http"));
}

export function ppsrCertificateProxyPath(report: VehicleReport): string {
  if (isSampleReportId(report.id)) return "/api/sample-report/ppsr";
  return `/api/report/${report.id}/ppsr`;
}
