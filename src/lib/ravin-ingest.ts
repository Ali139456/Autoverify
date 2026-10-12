import { DamageAnalysis } from "./types";
import { analyzeDamage, isRavinLiveAccount } from "./ravin";
import {
  fetchRavinS3PostCredentials,
  isRavinPartnerConfigured,
  type RavinS3PostCredentials,
} from "./ravin-partner";
import { parseRavinWebhookPayload } from "./ravin-webhook";

const RAVIN_S3_UPLOAD_URL =
  process.env.RAVIN_S3_UPLOAD_URL ?? "https://ravin-eye-ingest.s3.amazonaws.com/";

function staticRavinS3Credentials(): RavinS3PostCredentials | null {
  const accessKeyId = process.env.RAVIN_S3_ACCESS_KEY_ID?.trim();
  const policy = process.env.RAVIN_S3_POLICY?.trim();
  const signature = process.env.RAVIN_S3_SIGNATURE?.trim();
  if (!accessKeyId || !policy || !signature) return null;
  const uploadUrl = process.env.RAVIN_S3_UPLOAD_URL?.trim();
  return {
    accessKeyId,
    policy,
    signature,
    uploadUrl: uploadUrl || undefined,
  };
}

/** Static env S3 bundle and/or dynamic credentials from getSignInToken. */
export function isRavinS3Configured(): boolean {
  return Boolean(staticRavinS3Credentials() || isRavinPartnerConfigured());
}

async function resolveRavinS3Credentials(
  claimId: string,
): Promise<RavinS3PostCredentials | null> {
  if (isRavinPartnerConfigured()) {
    try {
      const dynamic = await fetchRavinS3PostCredentials(claimId);
      if (dynamic) return dynamic;
    } catch (err) {
      console.error("[ravin-ingest] Ravin S3 credential fetch failed:", err);
    }
  }
  return staticRavinS3Credentials();
}

/**
 * - `s3`: photos pushed to Ravin's S3 ingest; results arrive via webhook.
 * - `pending`: live Ravin account but no S3 ingest credentials yet — photos are
 *   kept on the report and analysis is added when Ravin delivers a webhook.
 * - `demo`: no Ravin account configured; deterministic demo findings returned.
 */
export type RavinSubmissionMode = "s3" | "pending" | "demo";

export async function submitInspectionToRavin(input: {
  reportId: string;
  inspectionId: string;
  /** Ravin partner invitation id when the report was linked via Inspector Lite. */
  ravinInspectionId?: string | null;
  vin?: string | null;
  photos: { name: string; data: Buffer; contentType: string; angle: string }[];
}): Promise<{
  mode: RavinSubmissionMode;
  ravinInspectionId: string | null;
  damage: DamageAnalysis | null;
}> {
  const linkedRavinId = input.ravinInspectionId?.trim() || null;
  const ingestId =
    linkedRavinId ?? `insp-${input.reportId.toLowerCase()}`;

  const s3Credentials = await resolveRavinS3Credentials(ingestId);
  if (s3Credentials) {
    await uploadPhotosToRavinS3({
      inspectionId: ingestId,
      vin: input.vin,
      photos: input.photos,
      credentials: s3Credentials,
    });
    return { mode: "s3", ravinInspectionId: ingestId, damage: null };
  }

  if (isRavinLiveAccount()) {
    return {
      mode: "pending",
      ravinInspectionId: linkedRavinId ?? input.reportId,
      damage: null,
    };
  }

  const damage = await analyzeDamage(
    input.photos.map((photo) => ({
      name: photo.name,
      data: photo.data,
      contentType: photo.contentType,
    })),
  );

  return { mode: "demo", ravinInspectionId: input.inspectionId, damage };
}

async function uploadPhotosToRavinS3(input: {
  inspectionId: string;
  vin?: string | null;
  photos: { name: string; data: Buffer; contentType: string; angle: string }[];
  credentials: RavinS3PostCredentials;
}) {
  const { accessKeyId, policy, signature } = input.credentials;
  const uploadUrl =
    input.credentials.uploadUrl?.trim() || RAVIN_S3_UPLOAD_URL;
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

    const response = await fetch(uploadUrl, {
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
