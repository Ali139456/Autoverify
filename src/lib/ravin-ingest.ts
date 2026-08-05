import { DamageAnalysis } from "./types";
import { analyzeDamage } from "./ravin";
import { parseRavinWebhookPayload } from "./ravin-webhook";

const RAVIN_S3_UPLOAD_URL =
  process.env.RAVIN_S3_UPLOAD_URL ?? "https://ravin-eye-ingest.s3.amazonaws.com/";

export function isRavinS3Configured(): boolean {
  return Boolean(
    process.env.RAVIN_S3_ACCESS_KEY_ID &&
      process.env.RAVIN_S3_POLICY &&
      process.env.RAVIN_S3_SIGNATURE,
  );
}

export async function submitInspectionToRavin(input: {
  reportId: string;
  inspectionId: string;
  vin?: string | null;
  photos: { name: string; data: Buffer; contentType: string; angle: string }[];
}): Promise<{ mode: "s3" | "demo"; ravinInspectionId: string | null }> {
  if (isRavinS3Configured()) {
    const ravinInspectionId = `insp-${input.reportId.toLowerCase()}`;
    await uploadPhotosToRavinS3({
      inspectionId: ravinInspectionId,
      vin: input.vin,
      photos: input.photos,
    });
    return { mode: "s3", ravinInspectionId };
  }

  await analyzeDamage(
    input.photos.map((photo) => ({
      name: photo.name,
      data: photo.data,
      contentType: photo.contentType,
    })),
  );

  return { mode: "demo", ravinInspectionId: input.inspectionId };
}

async function uploadPhotosToRavinS3(input: {
  inspectionId: string;
  vin?: string | null;
  photos: { name: string; data: Buffer; contentType: string; angle: string }[];
}) {
  const accessKeyId = process.env.RAVIN_S3_ACCESS_KEY_ID!;
  const policy = process.env.RAVIN_S3_POLICY!;
  const signature = process.env.RAVIN_S3_SIGNATURE!;
  const datePrefix = new Date().toISOString().slice(0, 10);

  for (const photo of input.photos) {
    const key = `uploads/inspections/${datePrefix}/${input.inspectionId}/${photo.angle}.jpg`;
    const form = new FormData();
    form.append("key", key);
    form.append("AWSAccessKeyId", accessKeyId);
    form.append("acl", "private");
    form.append("policy", policy);
    form.append("signature", signature);
    form.append("x-amz-meta-inspection-id", input.inspectionId);
    if (input.vin) form.append("x-amz-meta-vehicle-id", input.vin);
    form.append(
      "file",
      new Blob([new Uint8Array(photo.data)], { type: photo.contentType }),
      photo.name,
    );

    const response = await fetch(RAVIN_S3_UPLOAD_URL, {
      method: "POST",
      body: form,
    });

    if (!response.ok) {
      throw new Error(`Ravin S3 upload failed for ${photo.angle} (${response.status})`);
    }
  }
}

export function buildDemoDamageFromPhotos(
  photoCount: number,
  payload?: unknown,
): DamageAnalysis {
  if (payload) {
    return parseRavinWebhookPayload(payload, photoCount);
  }

  return {
    analyzedPhotos: photoCount,
    findings: [],
    overallCondition: "Excellent",
    totalRepairEstimate: 0,
  };
}
