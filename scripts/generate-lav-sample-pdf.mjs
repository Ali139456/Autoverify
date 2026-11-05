/**
 * Regenerate public/samples/lender-asset-verification-car-sample.pdf from LavReportPdf.
 *
 *   npx --yes tsx scripts/generate-lav-sample-pdf.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outPath = path.join(
  __dirname,
  "../public/samples/lender-asset-verification-car-sample.pdf",
);

const { generateLavCarSamplePdfBuffer } = await import(
  "../src/lib/report-pdf-buffer.ts"
);

const buffer = await generateLavCarSamplePdfBuffer();
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, buffer);
console.log("Wrote", outPath, `(${buffer.length} bytes)`);
