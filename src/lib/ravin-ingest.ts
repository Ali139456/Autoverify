import { DamageAnalysis } from "./types";
import { analyzeDamage, isRavinLiveAccount } from "./ravin";
import {
  fetchRavinCompressedUploadCredentials,
  fetchRavinSignIn,
  getRavinClientConfig,
  isRavinPartnerConfigured,
  resolveRavinClaimId,
  type RavinCompressedUploadAuth,
  type RavinS3PostCredentials,
} from "./ravin-partner";
import { parseRavinWebhookPayload } from "./ravin-webhook";
import { buildRavinInspectionZip } from "./ravin-compressed-zip";
import {
  createRavinIngestTrace,
  type RavinIngestTrace,
} from "./ravin-ingest-log";
import { getInspectionAngleLabel } from "./inspection-angles";

const RAVIN_S3_UPLOAD_URL =
  process.env.RAVIN_S3_UPLOAD_URL ?? "https://ravin-eye-ingest.s3.amazonaws.com/";

function staticRavinS3Credentials(): RavinS3PostCredentials | null {
  const accessKeyId = process.env.RAVIN_S3_ACCESS_KEY_ID?.trim();
  const policy = process.env.RAVIN_S3_POLICY?.trim();
  const signature = process.env.RAVIN_S3_SIGNATURE?.trim();
  if (!accessKeyId || !policy || !signature) return null;
  const uploadUrl =
    process.env.RAVIN_S3_UPLOAD_URL?.trim() || RAVIN_S3_UPLOAD_URL;
  return {
    format: "legacy",
    uploadUrl,
    formFields: {
      AWSAccessKeyId: accessKeyId,
      policy,
      signature,
      acl: "private",
    },
    accessKeyId,
    policy,
    signature,
  };
}

type ResolvedRavinUpload = {
  credentials: RavinS3PostCredentials;
  source: "compressed" | "signIn" | "static";
  compressedAuth?: RavinCompressedUploadAuth;
};

/** Static env S3 bundle and/or dynamic credentials from Ravin APIs. */
export function isRavinS3Configured(): boolean {
  return Boolean(staticRavinS3Credentials() || isRavinPartnerConfigured());
}

async function resolveRavinUpload(
  claimId: string,
  trace: ReturnType<typeof createRavinIngestTrace>,
): Promise<ResolvedRavinUpload | null> {
  if (isRavinPartnerConfigured()) {
    try {
      const compressed = await fetchRavinCompressedUploadCredentials(claimId);
      if (compressed?.credentials) {
        trace.push({
          stage: "parseUploadCredentials",
          ok: true,
          credentialSource: "compressed",
          credentialFormat: compressed.credentials.format,
          objectKey: compressed.credentials.objectKey,
          uploadUrl: compressed.credentials.uploadUrl,
          timestamp: compressed.timestamp,
        });
        return {
          credentials: compressed.credentials,
          source: "compressed",
          compressedAuth: compressed,
        };
      }
      trace.push({
        stage: "parseUploadCredentials",
        ok: false,
        credentialSource: "compressed",
        error: "generateCompressedDataUpload returned no S3 fields",
      });
    } catch (err) {
      trace.push({
        stage: "generateCompressedDataUpload",
        ok: false,
        error: err instanceof Error ? err.message : "Compressed upload auth failed",
      });
    }

    try {
      const signIn = await fetchRavinSignIn();
      if (signIn.s3) {
        trace.push({
          stage: "credentialResolve",
          ok: true,
          credentialSource: "signIn",
          credentialFormat: signIn.s3.format,
          objectKey: signIn.s3.objectKey,
          uploadUrl: signIn.s3.uploadUrl,
        });
        return { credentials: signIn.s3, source: "signIn" };
      }
    } catch (err) {
      trace.push({
        stage: "credentialResolve",
        ok: false,
        credentialSource: "signIn",
        error: err instanceof Error ? err.message : "getSignInToken S3 fallback failed",
      });
    }
  }

  const staticCreds = staticRavinS3Credentials();
  if (staticCreds) {
    trace.push({
      stage: "credentialResolve",
      ok: true,
      credentialSource: "static",
      credentialFormat: staticCreds.format,
      uploadUrl: staticCreds.uploadUrl,
    });
    return { credentials: staticCreds, source: "static" };
  }

  trace.push({
    stage: "credentialResolve",
    ok: false,
    error: "No Ravin S3 credentials available",
  });
  return null;
}

function s3PostSucceeded(status: number): boolean {
  return status === 204 || status === 200 || status === 201;
}

async function postBlobToRavinS3(input: {
  credentials: RavinS3PostCredentials;
  body: Buffer;
  fileName: string;
  contentType: string;
}): Promise<{ status: number; uploadUrl: string }> {
  const uploadUrl =
    input.credentials.uploadUrl?.trim() || RAVIN_S3_UPLOAD_URL;
  const form = new FormData();
  for (const [key, value] of Object.entries(input.credentials.formFields)) {
    if (value) form.append(key, value);
  }
  form.append(
    "file",
    new Blob([new Uint8Array(input.body)], { type: input.contentType }),
    input.fileName,
  );

  const response = await fetch(uploadUrl, { method: "POST", body: form });
  return { status: response.status, uploadUrl };
}

async function uploadCompressedZipToRavinS3(input: {
  claimId: string;
  inspectionId: string;
  vin?: string | null;
  photos: { name: string; data: Buffer; contentType: string; angle: string }[];
  upload: ResolvedRavinUpload;
  trace: ReturnType<typeof createRavinIngestTrace>;
}): Promise<void> {
  const auth = input.upload.compressedAuth;
  const client = getRavinClientConfig();
  const timestamp = auth?.timestamp ?? Date.now();

  const zipStarted = Date.now();
  const zip = await buildRavinInspectionZip({
    clientId: client.clientId,
    siteId: client.siteId,
    claimId: input.claimId,
    timestamp,
    inspectionId: input.inspectionId,
    vin: input.vin,
    photos: input.photos.map((photo) => ({
      angle: photo.angle,
      label: getInspectionAngleLabel(photo.angle),
      name: photo.name,
      data: photo.data,
      contentType: photo.contentType,
    })),
  });

  input.trace.push({
    stage: "buildZip",
    ok: true,
    photoCount: zip.photoCount,
    zipBytes: zip.buffer.length,
    durationMs: Date.now() - zipStarted,
  });

  const zipName =
    input.upload.credentials.objectKey?.split("/").pop() ||
    `${client.clientId}_${client.siteId}_${input.claimId}_${timestamp}.zip`;

  const postStarted = Date.now();
  const { status, uploadUrl } = await postBlobToRavinS3({
    credentials: input.upload.credentials,
    body: zip.buffer,
    fileName: zipName,
    contentType: "application/zip",
  });

  input.trace.push({
    stage: "s3Post",
    ok: s3PostSucceeded(status),
    s3Status: status,
    uploadUrl,
    objectKey: input.upload.credentials.objectKey,
    photoCount: zip.photoCount,
    zipBytes: zip.buffer.length,
    durationMs: Date.now() - postStarted,
  });

  if (!s3PostSucceeded(status)) {
    throw new Error(
      `Ravin S3 ZIP upload failed (HTTP ${status}); expected 204.`,
    );
  }
}

async function uploadLegacyJpegsToRavinS3(input: {
  inspectionId: string;
  vin?: string | null;
  photos: { name: string; data: Buffer; contentType: string; angle: string }[];
  credentials: RavinS3PostCredentials;
  trace: ReturnType<typeof createRavinIngestTrace>;
}): Promise<void> {
  const datePrefix = new Date().toISOString().slice(0, 10);

  for (const photo of input.photos) {
    const objectKey = `uploads/inspections/${datePrefix}/${input.inspectionId}/${photo.angle}.jpg`;
    const formFields = { ...input.credentials.formFields, key: objectKey };
    const postStarted = Date.now();
    const { status, uploadUrl } = await postBlobToRavinS3({
      credentials: { ...input.credentials, formFields },
      body: photo.data,
      fileName: photo.name,
      contentType: photo.contentType,
    });

    input.trace.push({
      stage: "legacyJpegPost",
      ok: s3PostSucceeded(status),
      s3Status: status,
      uploadUrl,
      objectKey,
      angle: photo.angle,
      durationMs: Date.now() - postStarted,
    });

    if (!s3PostSucceeded(status)) {
      throw new Error(
        `Ravin S3 upload failed for ${photo.angle} (HTTP ${status}).`,
      );
    }
  }
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
  ingestTrace: RavinIngestTrace;
}> {
  const claimId = resolveRavinClaimId(input.reportId, input.ravinInspectionId);
  const traceHelper = createRavinIngestTrace(claimId);

  const upload = await resolveRavinUpload(claimId, traceHelper);
  if (upload) {
    const useZip =
      upload.source === "compressed" ||
      upload.credentials.format === "aws4" ||
      Boolean(upload.credentials.objectKey?.endsWith(".zip"));

    try {
      if (useZip) {
        await uploadCompressedZipToRavinS3({
          claimId,
          inspectionId: input.inspectionId,
          vin: input.vin,
          photos: input.photos,
          upload,
          trace: traceHelper,
        });
        const ingestTrace = traceHelper.finish(true, "zip");
        return { mode: "s3", ravinInspectionId: claimId, damage: null, ingestTrace };
      }

      await uploadLegacyJpegsToRavinS3({
        inspectionId: claimId,
        vin: input.vin,
        photos: input.photos,
        credentials: upload.credentials,
        trace: traceHelper,
      });
      const ingestTrace = traceHelper.finish(true, "legacy-jpeg");
      return { mode: "s3", ravinInspectionId: claimId, damage: null, ingestTrace };
    } catch (err) {
      traceHelper.push({
        stage: "s3Post",
        ok: false,
        error: err instanceof Error ? err.message : "S3 upload failed",
      });
      traceHelper.finish(false, useZip ? "zip" : "legacy-jpeg");
      throw err;
    }
  }

  const failedTrace = traceHelper.finish(false, "none");

  if (isRavinLiveAccount()) {
    return {
      mode: "pending",
      ravinInspectionId: claimId,
      damage: null,
      ingestTrace: failedTrace,
    };
  }

  const damage = await analyzeDamage(
    input.photos.map((photo) => ({
      name: photo.name,
      data: photo.data,
      contentType: photo.contentType,
    })),
  );

  return {
    mode: "demo",
    ravinInspectionId: input.inspectionId,
    damage,
    ingestTrace: failedTrace,
  };
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
