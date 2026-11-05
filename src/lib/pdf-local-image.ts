import fs from "fs";
import path from "path";

export type PdfImageSource =
  | string
  | { data: Buffer; format: "png" | "jpg" };

const cache = new Map<string, PdfImageSource>();

/**
 * Resolve an image under `public/` for @react-pdf/renderer.
 * Reads the file into a buffer when available (works on every OS — a bare
 * Windows path is treated as a URL by react-pdf and fails to load); falls back
 * to the absolute path string otherwise.
 */
export function publicPdfImage(publicPath: string): PdfImageSource {
  const cached = cache.get(publicPath);
  if (cached) return cached;

  const absolute = path.join(
    process.cwd(),
    "public",
    publicPath.replace(/^\//, ""),
  );
  let source: PdfImageSource = absolute;
  try {
    const data = fs.readFileSync(absolute);
    const ext = path.extname(absolute).toLowerCase();
    const isPng =
      data.length >= 8 &&
      data[0] === 0x89 &&
      data[1] === 0x50 &&
      data[2] === 0x4e &&
      data[3] === 0x47;
    source = {
      data,
      format: isPng ? "png" : ext === ".png" ? "png" : "jpg",
    };
  } catch {
    // Fall back to the path string; react-pdf resolves it on Linux hosts.
  }
  cache.set(publicPath, source);
  return source;
}
