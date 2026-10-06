const MAX_SIDE_PX = 1600;
const JPEG_QUALITY = 0.78;
const SKIP_REENCODE_MAX_BYTES = 700_000;

function canvasToJpegFile(
  source: CanvasImageSource,
  width: number,
  height: number,
  angleId: string,
): Promise<File> {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Could not prepare photo for upload.");
  }
  ctx.drawImage(source, 0, 0, width, height);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (result) =>
        result
          ? resolve(new File([result], `${angleId}.jpg`, { type: "image/jpeg" }))
          : reject(new Error("Could not prepare photo for upload.")),
      "image/jpeg",
      JPEG_QUALITY,
    );
  });
}

async function loadImageElement(file: File): Promise<HTMLImageElement> {
  const url = URL.createObjectURL(file);
  try {
    return await new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () =>
        reject(new Error("Could not read this photo. Try again or pick from library."));
      img.src = url;
    });
  } finally {
    URL.revokeObjectURL(url);
  }
}

async function compressToJpeg(file: File, angleId: string): Promise<File> {
  if (typeof createImageBitmap === "function") {
    try {
      const bitmap = await createImageBitmap(file);
      const scale = Math.min(
        1,
        MAX_SIDE_PX / Math.max(bitmap.width, bitmap.height),
      );
      const width = Math.max(1, Math.round(bitmap.width * scale));
      const height = Math.max(1, Math.round(bitmap.height * scale));
      const jpeg = await canvasToJpegFile(bitmap, width, height, angleId);
      bitmap.close();
      return jpeg;
    } catch {
      // Fall through to HTMLImageElement (better HEIC support on iOS Safari).
    }
  }

  const img = await loadImageElement(file);
  const scale = Math.min(1, MAX_SIDE_PX / Math.max(img.naturalWidth, img.naturalHeight));
  const width = Math.max(1, Math.round(img.naturalWidth * scale));
  const height = Math.max(1, Math.round(img.naturalHeight * scale));
  return canvasToJpegFile(img, width, height, angleId);
}

/** Resize/compress phone photos so uploads succeed on mobile networks and server limits. */
export async function prepareInspectionPhoto(
  file: File,
  angleId: string,
): Promise<File> {
  if (!file.size) {
    throw new Error("Photo file is empty. Please try taking the picture again.");
  }

  const isJpeg =
    file.type === "image/jpeg" || /\.jpe?g$/i.test(file.name);
  if (isJpeg && file.size <= SKIP_REENCODE_MAX_BYTES) {
    return new File([file], `${angleId}.jpg`, { type: "image/jpeg" });
  }

  try {
    return await compressToJpeg(file, angleId);
  } catch {
    const fallback = fallbackFile(file, angleId);
    if (fallback.size > 4 * 1024 * 1024) {
      throw new Error(
        "This photo is too large to upload. Move closer, use better light, or choose a smaller image from your library.",
      );
    }
    return fallback;
  }
}

function fallbackFile(file: File, angleId: string): File {
  const ext =
    file.name.match(/\.(jpe?g|png|webp|heic|heif)$/i)?.[1]?.toLowerCase() ??
    "jpg";
  const type =
    file.type?.startsWith("image/") ? file.type : `image/${ext === "jpg" ? "jpeg" : ext}`;
  return new File([file], `${angleId}.${ext}`, { type });
}
