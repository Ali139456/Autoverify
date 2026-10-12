import { isRavinS3Configured } from "./ravin-ingest";
import { isRavinPartnerConfigured, probeRavinPartnerConnection } from "./ravin-partner";

export type RavinIntegrationStatus = {
  partnerApiConfigured: boolean;
  s3IngestConfigured: boolean;
  webhookSecretConfigured: boolean;
  baseUrl: string | null;
  siteId: string | null;
  webhookUrl: string | null;
  demoReadiness: "ready_ravin_app" | "needs_s3_or_webhook" | "needs_partner_api";
  notes: string[];
};

export function getRavinIntegrationStatus(baseUrl: string): RavinIntegrationStatus {
  const partnerApiConfigured = isRavinPartnerConfigured();
  const s3IngestConfigured = isRavinS3Configured();
  const webhookSecretConfigured = Boolean(process.env.RAVIN_WEBHOOK_SECRET?.trim());
  const base = baseUrl.replace(/\/$/, "");

  const notes: string[] = [];
  let demoReadiness: RavinIntegrationStatus["demoReadiness"] = "needs_partner_api";

  if (partnerApiConfigured) {
    demoReadiness = "ready_ravin_app";
    notes.push(
      "Owner completes capture on the Ravin inspector-lite link (SMS/QR). Results arrive via webhook.",
    );
    if (!webhookSecretConfigured) {
      notes.push(
        "Set RAVIN_WEBHOOK_SECRET on Vercel and register the same secret with Ravin for POST /api/webhooks/ravin.",
      );
    }
    if (!s3IngestConfigured) {
      notes.push(
        "Auto Verifi /inspect/ capture does not push to Ravin Eye until RAVIN_S3_* credentials are set.",
      );
    }
  } else {
    notes.push("Set RAVIN_API_KEY and RAVIN_SITE_ID on production to create inspector-lite links.");
  }

  if (s3IngestConfigured && webhookSecretConfigured && partnerApiConfigured) {
    demoReadiness = "ready_ravin_app";
  } else if (partnerApiConfigured && !webhookSecretConfigured) {
    demoReadiness = "needs_s3_or_webhook";
  }

  return {
    partnerApiConfigured,
    s3IngestConfigured,
    webhookSecretConfigured,
    baseUrl: process.env.RAVIN_BASE_URL?.trim() || null,
    siteId: process.env.RAVIN_SITE_ID?.trim() || null,
    webhookUrl: `${base}/api/webhooks/ravin`,
    demoReadiness,
    notes,
  };
}

export async function getRavinHealthPayload(baseUrl: string, probePartner: boolean) {
  const status = getRavinIntegrationStatus(baseUrl);
  let partnerSignIn: { ok: boolean; error?: string } | undefined;

  if (probePartner && status.partnerApiConfigured) {
    partnerSignIn = await probeRavinPartnerConnection();
  }

  return { ...status, partnerSignIn };
}
