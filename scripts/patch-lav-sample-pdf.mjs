/**
 * Removes static callout copy from the LAV car sample PDF (page 2):
 * - "Guided photo capture" info box
 * - AI walkaround disclaimer under damage scan cards
 *
 * Run: node scripts/patch-lav-sample-pdf.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { PDFDocument, rgb } from "pdf-lib";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pdfPath = path.join(
  __dirname,
  "../public/samples/lender-asset-verification-car-sample.pdf",
);

/** Page background — white body with light sections */
const PAGE_FILL = rgb(1, 1, 1);

async function main() {
  const bytes = fs.readFileSync(pdfPath);
  const pdfDoc = await PDFDocument.load(bytes);
  const page = pdfDoc.getPages()[1];
  const { width } = page.getSize();

  const marginX = 38;
  const contentW = width - marginX * 2;

  // Guided photo capture callout (above photo grid)
  page.drawRectangle({
    x: marginX,
    y: 582,
    width: contentW,
    height: 78,
    color: PAGE_FILL,
    borderWidth: 0,
  });

  // AI walkaround disclaimer (below Front/Rear damage cards)
  page.drawRectangle({
    x: marginX,
    y: 68,
    width: contentW,
    height: 52,
    color: PAGE_FILL,
    borderWidth: 0,
  });

  fs.writeFileSync(pdfPath, await pdfDoc.save());
  console.log("Patched", pdfPath);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
