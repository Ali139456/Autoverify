const MAX_SIDE_PX = 1920;
const JPEG_QUALITY = 0.82;

/** Resize/compress phone photos so uploads succeed on mobile networks and server limits. */
export async function prepareInspectionPhoto(
  file: File,
  angleId: string,
): Promise<File> {
  if (!file.size) {
    throw new Error("Photo file is empty. Please try taking the picture again.");
  }

  if (file.size <= 900_000 && file.type === "image/jpeg") {
    return new File([file], `${angleId}.jpg`, { type: "image/jpeg" });
  }

  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_SIDE_PX / Math.max(bitmap.width, bitmap.height));
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      bitmap.close();
      return fallbackFile(file, angleId);
    }

    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (result) =>
          result
            ? resolve(result)
            : reject(new Error("Could not prepare photo for upload.")),
        "image/jpeg",
        JPEG_QUALITY,
      );
    });

    return new File([blob], `${angleId}.jpg`, { type: "image/jpeg" });
  } catch {
    return fallbackFile(file, angleId);
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
