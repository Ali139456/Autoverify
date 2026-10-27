/**
 * Patches the LAV car sample PDF:
 * - Removes guided capture callout + AI disclaimer (page 2)
 * - Replaces section titles with blue Auto Verifi headings
 *
 * Run: node scripts/patch-lav-sample-pdf.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pdfPath = path.join(
  __dirname,
  "../public/samples/lender-asset-verification-car-sample.pdf",
);

const PAGE_FILL = rgb(1, 1, 1);
const BRAND_BLUE = rgb(0, 115 / 255, 227 / 255);

async function main() {
  const bytes = fs.readFileSync(pdfPath);
  const pdfDoc = await PDFDocument.load(bytes);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const page1 = pdfDoc.getPages()[0];
  const page2 = pdfDoc.getPages()[1];
  const page3 = pdfDoc.getPages()[2];
  const { width } = page2.getSize();
  const marginX = 38;
  const contentW = width - marginX * 2;

  // "Vehicle details" between asset-type pills and Make/Model grid (page 1)
  page1.drawText("Vehicle details", {
    x: marginX,
    y: 636,
    size: 11,
    font: fontBold,
    color: BRAND_BLUE,
  });

  // Guided photo capture callout (above photo grid)
  page2.drawRectangle({
    x: marginX,
    y: 582,
    width: contentW,
    height: 78,
    color: PAGE_FILL,
    borderWidth: 0,
  });

  // AI walkaround disclaimer (below Front/Rear damage cards)
  page2.drawRectangle({
    x: marginX,
    y: 68,
    width: contentW,
    height: 52,
    color: PAGE_FILL,
    borderWidth: 0,
  });

  // "PHOTO VERIFICATION" → "Vehicle Photos" (blue)
  page2.drawRectangle({
    x: marginX,
    y: 648,
    width: contentW,
    height: 20,
    color: PAGE_FILL,
    borderWidth: 0,
  });
  page2.drawText("Vehicle Photos", {
    x: marginX,
    y: 652,
    size: 11,
    font: fontBold,
    color: BRAND_BLUE,
  });

  // "IDENTIFICATION PHOTOS" → "Identification photos" (blue)
  page3.drawRectangle({
    x: marginX,
    y: 682,
    width: contentW,
    height: 20,
    color: PAGE_FILL,
    borderWidth: 0,
  });
  page3.drawText("Identification photos", {
    x: marginX,
    y: 686,
    size: 11,
    font: fontBold,
    color: BRAND_BLUE,
  });

  fs.writeFileSync(pdfPath, await pdfDoc.save());
  console.log("Patched", pdfPath);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
