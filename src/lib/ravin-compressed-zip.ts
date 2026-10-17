import JSZip from "jszip";
import { INSPECTION_ANGLE_IDS } from "./inspection-angles";

export type RavinZipPhoto = {
  angle: string;
  label: string;
  name: string;
  data: Buffer;
  contentType: string;
};

export function sortPhotosForRavinZip(
  photos: RavinZipPhoto[],
): RavinZipPhoto[] {
  const order = new Map<string, number>(
    INSPECTION_ANGLE_IDS.map((id, index) => [id, index]),
  );
  return [...photos].sort((a, b) => {
    const ai = order.get(a.angle) ?? 999;
    const bi = order.get(b.angle) ?? 999;
    if (ai !== bi) return ai - bi;
    return a.angle.localeCompare(b.angle);
  });
}

export function ravinZipEntryName(index: number, angle: string, ext: string): string {
  const seq = String(index + 1).padStart(2, "0");
  const safeAngle = angle.replace(/[^a-z0-9_-]+/gi, "-").replace(/^-+|-+$/g, "");
  return `${seq}-${safeAngle || "photo"}.${ext.replace(/^\./, "")}`;
}

export function buildRavinCompressedMetadata(input: {
  clientId: string;
  siteId: number;
  claimId: string;
  timestamp: number;
  inspectionId: string;
  vin?: string | null;
  images: { fileName: string; angle: string; label: string }[];
}): Record<string, unknown> {
  return {
    clientId: input.clientId,
    siteId: input.siteId,
    claimId: input.claimId,
    timestamp: input.timestamp,
    provider: "consumer",
    partner: input.clientId,
    inspectionId: input.inspectionId,
    vehicleId: input.vin?.trim() || undefined,
    imageUpload: true,
    images: input.images.map((img, index) => ({
      index: index + 1,
      fileName: img.fileName,
      angle: img.angle,
      label: img.label,
    })),
  };
}

export async function buildRavinInspectionZip(input: {
  clientId: string;
  siteId: number;
  claimId: string;
  timestamp: number;
  inspectionId: string;
  vin?: string | null;
  photos: RavinZipPhoto[];
}): Promise<{ buffer: Buffer; fileNames: string[]; photoCount: number }> {
  const sorted = sortPhotosForRavinZip(input.photos);
  const zip = new JSZip();
  const fileNames: string[] = [];

  for (let i = 0; i < sorted.length; i++) {
    const photo = sorted[i];
    const ext = photo.name.includes(".")
      ? photo.name.split(".").pop()!
      : photo.contentType.includes("png")
        ? "png"
        : "jpg";
    const fileName = ravinZipEntryName(i, photo.angle, ext);
    fileNames.push(fileName);
    zip.file(fileName, photo.data);
  }

  zip.file(
    "metadata.json",
    JSON.stringify(
      buildRavinCompressedMetadata({
        clientId: input.clientId,
        siteId: input.siteId,
        claimId: input.claimId,
        timestamp: input.timestamp,
        inspectionId: input.inspectionId,
        vin: input.vin,
        images: sorted.map((photo, index) => ({
          fileName: fileNames[index],
          angle: photo.angle,
          label: photo.label,
        })),
      }),
      null,
      2,
    ),
  );

  const buffer = Buffer.from(
    await zip.generateAsync({
      type: "nodebuffer",
      compression: "DEFLATE",
      compressionOptions: { level: 6 },
    }),
  );

  return { buffer, fileNames, photoCount: sorted.length };
}
