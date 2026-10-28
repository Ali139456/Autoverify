/**
 * Patches the LAV car sample PDF:
 * - Removes guided capture callout + AI disclaimer (page 2)
 * - Replaces section titles with blue Auto Verifi headings
 *
 * Run from a clean master (once per design export):
 *   git checkout b57adee -- public/samples/lender-asset-verification-car-sample.pdf
 *   node scripts/patch-lav-sample-pdf.mjs
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

  // "Vehicle details" below asset-type pills, above Make/Model grid (page 1)
  // pdf.js: ASSET TYPE ~y=666, pill row ~y=650, field grid ~y=607+
  const vehicleDetailsBaselineY = 612;
  page1.drawRectangle({
    x: marginX,
    y: vehicleDetailsBaselineY - 4,
    width: contentW,
    height: 36,
    color: PAGE_FILL,
    borderWidth: 0,
  });
  page1.drawText("Vehicle details", {
    x: marginX,
    y: vehicleDetailsBaselineY,
    size: 11,
    font: fontBold,
    color: BRAND_BLUE,
  });

  // Page 2: remove "PHOTO VERIFICATION" + guided callout; add "Vehicle Photos"
  // (Title stays at ~y=686; section heading sits below it at ~y=628.)
  const vehiclePhotosBaselineY = 628;
  page2.drawRectangle({
    x: marginX,
    y: 568,
    width: contentW,
    height: 108,
    color: PAGE_FILL,
    borderWidth: 0,
  });
  page2.drawText("Vehicle Photos", {
    x: marginX,
    y: vehiclePhotosBaselineY,
    size: 11,
    font: fontBold,
    color: BRAND_BLUE,
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

  // Page 3: "Identification photos" below page title (same vertical rhythm as page 2)
  const identificationBaselineY = 628;
  page3.drawRectangle({
    x: marginX,
    y: 568,
    width: contentW,
    height: 108,
    color: PAGE_FILL,
    borderWidth: 0,
  });
  page3.drawText("Identification photos", {
    x: marginX,
    y: identificationBaselineY,
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
