import path from "path";
import { Font } from "@react-pdf/renderer";

/** Match web reports (`--font-geist-sans` / Geist in layout.tsx). */
export const PDF_SANS = "Geist";

let registered = false;

export function registerReportPdfFonts(): void {
  if (registered) return;

  const sansDir = path.join(
    process.cwd(),
    "node_modules/geist/dist/fonts/geist-sans",
  );

  Font.register({
    family: PDF_SANS,
    fonts: [
      {
        src: path.join(sansDir, "Geist-Regular.ttf"),
        fontWeight: 400,
      },
      {
        src: path.join(sansDir, "Geist-Medium.ttf"),
        fontWeight: 500,
      },
      {
        src: path.join(sansDir, "Geist-SemiBold.ttf"),
        fontWeight: 600,
      },
      {
        src: path.join(sansDir, "Geist-Bold.ttf"),
        fontWeight: 700,
      },
    ],
  });

  registered = true;
}
