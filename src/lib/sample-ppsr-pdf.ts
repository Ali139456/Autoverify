import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import type { VehicleReport } from "./types";

const NAVY = rgb(0.05, 0.12, 0.28);
const BODY = rgb(0.2, 0.25, 0.33);
const MUTED = rgb(0.45, 0.5, 0.58);

function wrapText(text: string, maxChars: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (next.length > maxChars && line) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  return lines;
}

/** Illustrative PPSR-style certificate PDF for public sample reports. */
export async function generateSamplePpsrPdfBuffer(
  report: VehicleReport,
): Promise<Buffer> {
  const { vehicle, registration } = report;
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);

  const page = doc.addPage([595.28, 841.89]);
  const { width, height } = page.getSize();
  let y = height - 56;

  const draw = (
    text: string,
    opts: { size?: number; bold?: boolean; color?: typeof BODY; gap?: number } = {},
  ) => {
    const size = opts.size ?? 10;
    const usedFont = opts.bold ? fontBold : font;
    const color = opts.color ?? BODY;
    page.drawText(text, { x: 48, y, size, font: usedFont, color });
    y -= (opts.gap ?? size + 6);
  };

  const drawLines = (text: string, size = 9, gap = 13) => {
    for (const line of wrapText(text, 92)) {
      page.drawText(line, { x: 48, y, size, font, color: BODY });
      y -= gap;
    }
  };

  page.drawRectangle({
    x: 0,
    y: height - 28,
    width,
    height: 28,
    color: rgb(0.9, 0.93, 0.98),
  });
  page.drawText("SAMPLE — NOT AN OFFICIAL PPSR CERTIFICATE", {
    x: 48,
    y: height - 20,
    size: 9,
    font: fontBold,
    color: rgb(0.75, 0.15, 0.15),
  });

  draw("Personal Property Securities Register", {
    size: 11,
    bold: true,
    color: NAVY,
    gap: 18,
  });
  draw("Search Certificate (illustrative sample)", {
    size: 16,
    bold: true,
    color: NAVY,
    gap: 22,
  });

  draw("Australian Financial Security Authority (AFSA)", { size: 9, color: MUTED, gap: 20 });

  const searchDate = new Date(report.createdAt).toLocaleString("en-AU", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  const rows: [string, string][] = [
    ["Search date / time", searchDate],
    ["Registration plate", vehicle.rego ? `${vehicle.rego} (${vehicle.state})` : "—"],
    ["VIN / Chassis", vehicle.vin || "—"],
    ["Make / Model", `${vehicle.make} ${vehicle.model} ${vehicle.variant}`.trim()],
    ["Year of manufacture", vehicle.year ? String(vehicle.year) : "—"],
    ["Colour", vehicle.colour || "—"],
    [
      "Registration status",
      registration.status === "Registered" ? "Registered" : registration.status,
    ],
    [
      "PPSR — security interests",
      registration.financeOwing ? "Registration(s) found" : "No registrations found",
    ],
    [
      "Written-off vehicle",
      registration.writtenOff ? "Record found" : "No record found",
    ],
    ["Stolen vehicle", registration.stolen ? "Record found" : "No record found"],
    [
      "Safety recalls (NEVDIS)",
      registration.hasSafetyRecalls ? "Recall recorded" : "No recall recorded",
    ],
  ];

  for (const [label, value] of rows) {
    if (y < 120) break;
    page.drawText(label, { x: 48, y, size: 8, font: fontBold, color: MUTED });
    page.drawText(value, { x: 220, y, size: 9, font, color: BODY });
    y -= 16;
  }

  y -= 8;
  draw("Certificate notes", { bold: true, size: 10, gap: 14 });
  drawLines(
    "This PDF is a layout sample only. Paid Auto Verifi reports append the official PPSR search certificate PDF returned by AutoGrab when a live search is performed for your vehicle.",
  );
  drawLines(
    "For official guidance on reading PPSR certificates and terminology, visit https://www.ppsr.gov.au/",
  );

  y -= 4;
  draw("Auto Verifi Pty Ltd — sample demonstration", {
    size: 8,
    color: MUTED,
    gap: 12,
  });

  const bytes = await doc.save();
  return Buffer.from(bytes);
}
