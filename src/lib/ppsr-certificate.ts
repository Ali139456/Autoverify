import { generateSamplePpsrPdfBuffer } from "./sample-ppsr-pdf";

import type { VehicleReport } from "./types";



const FETCH_TIMEOUT_MS = 45_000;



/** Full-page PNG for sample reports (embedded in print layout). */

export const SAMPLE_PPSR_CERTIFICATE_IMAGE = "/sample/ppsr-certificate.png";



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



export async function fetchPpsrCertificateBuffer(

  certificateUrl: string,

): Promise<Buffer | null> {

  const url = certificateUrl.trim();

  if (!url.startsWith("http")) return null;



  try {

    const res = await fetch(url, {

      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),

      headers: { Accept: "application/pdf,*/*" },

    });

    if (!res.ok) return null;



    const buffer = Buffer.from(await res.arrayBuffer());

    if (buffer.length < 5 || buffer.subarray(0, 4).toString("ascii") !== "%PDF") {

      return null;

    }

    return buffer;

  } catch {

    return null;

  }

}



export async function mergePdfBuffers(

  primary: Buffer,

  appendix: Buffer,

): Promise<Buffer> {

  const { PDFDocument } = await import("pdf-lib");

  const merged = await PDFDocument.create();



  const primaryDoc = await PDFDocument.load(primary);

  const appendixDoc = await PDFDocument.load(appendix);



  const primaryPages = await merged.copyPages(

    primaryDoc,

    primaryDoc.getPageIndices(),

  );

  primaryPages.forEach((page) => merged.addPage(page));



  const appendixPages = await merged.copyPages(

    appendixDoc,

    appendixDoc.getPageIndices(),

  );

  appendixPages.forEach((page) => merged.addPage(page));



  return Buffer.from(await merged.save());

}



export async function fetchPpsrCertificateForReport(

  report: VehicleReport,

): Promise<Buffer | null> {

  if (isSampleReportId(report.id)) {

    return generateSamplePpsrPdfBuffer(report);

  }

  const url = report.registration.ppsrCertificateUrl;

  if (!url) return null;

  return fetchPpsrCertificateBuffer(url);

}

