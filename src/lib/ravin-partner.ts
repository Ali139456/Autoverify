const RAVIN_API_KEY = process.env.RAVIN_API_KEY;
const RAVIN_BASE_URL = (
  process.env.RAVIN_BASE_URL ?? "https://beta.mtaus.ravin-ai.com"
).replace(/\/$/, "");
const RAVIN_SITE_ID = Number(process.env.RAVIN_SITE_ID ?? "39");
const RAVIN_PROVIDER = process.env.RAVIN_PROVIDER ?? "consumer";
const RAVIN_LINK_EXPIRED_IN = Number(process.env.RAVIN_LINK_EXPIRED_IN ?? "72");
const RAVIN_LOGIN_EXPIRED_IN = Number(process.env.RAVIN_LOGIN_EXPIRED_IN ?? "48");

export type RavinPartnerInvite = {
  invitationId: string;
  inviteUrl: string;
  expiresAt: string | null;
  raw: unknown;
};

export function isRavinPartnerConfigured(): boolean {
  return Boolean(RAVIN_API_KEY && Number.isFinite(RAVIN_SITE_ID) && RAVIN_SITE_ID > 0);
}

/** Inspector mobile walkaround URL (Ravin MTA US beta). */
export function buildInspectorLiteUrl(code: string): string {
  const url = new URL(`${RAVIN_BASE_URL}/inspector-lite/page/tmp`);
  url.searchParams.set("code", code);
  url.searchParams.set("image-upload", "true");
  return url.toString();
}

export function isRavinInspectorLiteUrl(url: string): boolean {
  try {
    const parsed = new URL(url.startsWith("http") ? url : `https://${url}`);
    return (
      parsed.hostname.includes("ravin-ai.com") &&
      parsed.pathname.includes("inspector")
    );
  } catch {
    return false;
  }
}

export function parseInspectorLiteCodeFromUrl(url: string): string | null {
  try {
    const parsed = new URL(normalizeInspectorUrl(url));
    if (!parsed.pathname.includes("inspector")) return null;
    const code = parsed.searchParams.get("code");
    return code?.trim() || null;
  } catch {
    return null;
  }
}

function normalizeInspectorUrl(url: string): string {
  const withScheme = url.startsWith("http") ? url : `https://${url.replace(/^\/+/, "")}`;

  try {
    const parsed = new URL(withScheme);
    if (
      parsed.pathname.includes("inspector-lite") &&
      !parsed.searchParams.has("image-upload")
    ) {
      parsed.searchParams.set("image-upload", "true");
    }
    return parsed.toString();
  } catch {
    return url;
  }
}

export type RavinS3PostCredentials = {
  accessKeyId: string;
  policy: string;
  signature: string;
  uploadUrl?: string;
};

export type RavinSignInResult = {
  token: string;
  s3: RavinS3PostCredentials | null;
  raw: Record<string, unknown>;
};

function readStringField(
  record: Record<string, unknown>,
  keys: string[],
): string | null {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return null;
}

/** Pull S3 POST bundle fields from getSignInToken (or nested) responses. */
export function extractRavinS3PostCredentials(
  payload: unknown,
): RavinS3PostCredentials | null {
  if (!payload || typeof payload !== "object") return null;
  const record = payload as Record<string, unknown>;

  const accessKeyId = readStringField(record, [
    "AWSAccessKeyId",
    "accessKeyId",
    "AccessKeyId",
    "s3AccessKeyId",
    "S3AccessKeyId",
  ]);
  const policy = readStringField(record, ["policy", "Policy", "s3Policy", "S3Policy"]);
  const signature = readStringField(record, [
    "signature",
    "Signature",
    "s3Signature",
    "S3Signature",
  ]);

  if (accessKeyId && policy && signature) {
    const uploadUrl = readStringField(record, [
      "uploadUrl",
      "s3UploadUrl",
      "S3UploadUrl",
      "bucketUrl",
    ]);
    return {
      accessKeyId,
      policy,
      signature,
      uploadUrl: uploadUrl ?? undefined,
    };
  }

  for (const value of Object.values(record)) {
    if (value && typeof value === "object") {
      const nested = extractRavinS3PostCredentials(value);
      if (nested) return nested;
    }
  }

  return null;
}

/** Ravin partner authentication — token plus optional S3 POST credentials for ingest. */
export async function fetchRavinSignIn(): Promise<RavinSignInResult> {
  if (!RAVIN_API_KEY) {
    throw new Error("RAVIN_API_KEY is not configured.");
  }

  const response = await fetch(`${RAVIN_BASE_URL}/getSignInToken`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ clientKey: RAVIN_API_KEY }),
  });

  const body = (await response.json().catch(() => null)) as Record<string, unknown> | null;
  if (!response.ok) {
    const message =
      (typeof body?.error === "string" && body.error) ||
      (typeof body?.message === "string" && body.message) ||
      `Ravin sign-in failed (${response.status}).`;
    throw new Error(message);
  }

  if (!body) {
    throw new Error("Ravin sign-in returned an empty response.");
  }

  const token = typeof body.token === "string" ? body.token : null;
  if (!token) {
    throw new Error("Ravin sign-in did not return a partner token.");
  }

  return {
    token,
    s3: extractRavinS3PostCredentials(body),
    raw: body,
  };
}

async function getPartnerToken(): Promise<string> {
  const signIn = await fetchRavinSignIn();
  return signIn.token;
}

/** S3 POST credentials from the latest getSignInToken call (Ravin site 49 flow). */
export async function fetchRavinS3PostCredentials(): Promise<RavinS3PostCredentials | null> {
  const signIn = await fetchRavinSignIn();
  return signIn.s3;
}

/** Production health check — verifies RAVIN_API_KEY against getSignInToken. */
export async function probeRavinPartnerConnection(): Promise<
  { ok: true } | { ok: false; error: string }
> {
  if (!isRavinPartnerConfigured()) {
    return { ok: false, error: "RAVIN_API_KEY or RAVIN_SITE_ID is not configured." };
  }
  try {
    await getPartnerToken();
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Ravin sign-in failed.",
    };
  }
}

function extractSessionCode(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") return null;
  const record = payload as Record<string, unknown>;

  const directCandidates = [
    record.code,
    record.sessionCode,
    record.inspectionCode,
    record.inviteCode,
  ];

  for (const candidate of directCandidates) {
    if (typeof candidate === "string" && candidate.trim()) {
      return candidate.trim();
    }
  }

  for (const value of Object.values(record)) {
    if (value && typeof value === "object") {
      const nested = extractSessionCode(value);
      if (nested) return nested;
    }
  }

  return null;
}

function extractInviteUrl(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") return null;
  const record = payload as Record<string, unknown>;

  const directCandidates = [
    record.link,
    record.url,
    record.message,
    record.inviteLink,
    record.inviteUrl,
    record.inspectionLink,
    record.inspectionUrl,
    record.partnerLink,
    record.partnerUrl,
  ];

  for (const candidate of directCandidates) {
    if (typeof candidate !== "string" || !candidate.trim()) continue;
    const trimmed = candidate.trim();
    if (trimmed.startsWith("http") || trimmed.includes("inspector")) {
      return normalizeInspectorUrl(trimmed);
    }
  }

  for (const value of Object.values(record)) {
    if (value && typeof value === "object") {
      const nested = extractInviteUrl(value);
      if (nested) return nested;
    }
  }

  const code = extractSessionCode(payload);
  if (code) return buildInspectorLiteUrl(code);

  return null;
}

function extractExpiresAt(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") return null;
  const record = payload as Record<string, unknown>;
  const raw =
    record.linkExpiredAt ??
    record.expiresAt ??
    record.expiration ??
    record.expireAt ??
    record.expirationTimestamp;

  if (typeof raw === "number" && Number.isFinite(raw)) {
    const parsed = new Date(raw > 1e12 ? raw : raw * 1000);
    return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
  }

  if (typeof raw === "string" && raw.trim()) {
    const parsed = new Date(raw);
    return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
  }

  return null;
}

export async function createRavinPartnerInvite(input: {
  invitationId: string;
  linkExpiredIn?: number;
  loginExpiredIn?: number;
}): Promise<RavinPartnerInvite> {
  const partnerToken = await getPartnerToken();

  const response = await fetch(`${RAVIN_BASE_URL}/partnerInvite`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      partnerToken,
      siteId: RAVIN_SITE_ID,
      provider: RAVIN_PROVIDER,
      linkExpiredIn: input.linkExpiredIn ?? RAVIN_LINK_EXPIRED_IN,
      loginExpiredIn: input.loginExpiredIn ?? RAVIN_LOGIN_EXPIRED_IN,
      invitationId: input.invitationId,
    }),
  });

  const body = await response.json().catch(() => null);
  if (!response.ok) {
    const message =
      (body &&
        typeof body === "object" &&
        typeof (body as Record<string, unknown>).error === "string" &&
        (body as Record<string, unknown>).error) ||
      `Ravin partner invite failed (${response.status}).`;
    throw new Error(String(message));
  }

  const inviteUrl = extractInviteUrl(body);
  if (!inviteUrl) {
    throw new Error("Ravin partner invite succeeded but no inspection link was returned.");
  }

  return {
    invitationId: input.invitationId,
    inviteUrl,
    expiresAt: extractExpiresAt(body),
    raw: body,
  };
}
