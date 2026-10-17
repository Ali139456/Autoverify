/** Structured Ravin S3 ingest logs (Vercel / server console). */
export type RavinIngestLogEvent = {
  at: string;
  claimId: string;
  stage:
    | "generateCompressedDataUpload"
    | "parseUploadCredentials"
    | "buildZip"
    | "s3Post"
    | "legacyJpegPost"
    | "credentialResolve"
    | "complete";
  ok: boolean;
  httpStatus?: number;
  s3Status?: number;
  clientId?: string;
  siteId?: number;
  ravinBaseUrl?: string;
  timestamp?: number;
  credentialSource?: "compressed" | "signIn" | "static";
  credentialFormat?: "aws4" | "legacy";
  objectKey?: string;
  uploadUrl?: string;
  photoCount?: number;
  zipBytes?: number;
  angle?: string;
  error?: string;
  durationMs?: number;
};

export function logRavinIngest(event: Omit<RavinIngestLogEvent, "at">): RavinIngestLogEvent {
  const row: RavinIngestLogEvent = { at: new Date().toISOString(), ...event };
  console.info("[ravin-ingest]", JSON.stringify(row));
  return row;
}

export type RavinIngestTrace = {
  claimId: string;
  events: RavinIngestLogEvent[];
  success: boolean;
  mode: "zip" | "legacy-jpeg" | "none";
};

export function createRavinIngestTrace(claimId: string): {
  trace: RavinIngestTrace;
  push: (event: Omit<RavinIngestLogEvent, "at" | "claimId">) => RavinIngestLogEvent;
  finish: (success: boolean, mode: RavinIngestTrace["mode"]) => RavinIngestTrace;
} {
  const events: RavinIngestLogEvent[] = [];
  return {
    trace: { claimId, events, success: false, mode: "none" },
    push: (event) => {
      const row = logRavinIngest({ claimId, ...event });
      events.push(row);
      return row;
    },
    finish: (success, mode) => {
      const trace: RavinIngestTrace = { claimId, events, success, mode };
      logRavinIngest({
        claimId,
        stage: "complete",
        ok: success,
        photoCount: events.find((e) => e.photoCount)?.photoCount,
        credentialFormat: events.find((e) => e.credentialFormat)?.credentialFormat,
        s3Status: [...events].reverse().find((e) => e.s3Status)?.s3Status,
      });
      return trace;
    },
  };
}
