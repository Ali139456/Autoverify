const RAVIN_API_KEY = process.env.RAVIN_API_KEY?.trim();
const RAVIN_BASE_URL = (
  process.env.RAVIN_BASE_URL ?? "https://inspect.mtaus.ravin-ai.com"
).replace(/\/$/, "");
const RAVIN_SITE_ID = Number(process.env.RAVIN_SITE_ID ?? "49");
const RAVIN_CLIENT_ID = process.env.RAVIN_CLIENT_ID?.trim() || "autoverifi";
const RAVIN_PROVIDER = process.env.RAVIN_PROVIDER ?? "consumer";
const RAVIN_INSPECTOR_PATH =
  process.env.RAVIN_INSPECTOR_PATH?.trim() || "inspector-lite/page/tmp";
const RAVIN_LINK_EXPIRE_IN = Number(
  process.env.RAVIN_LINK_EXPIRE_IN ??
    process.env.RAVIN_LINK_EXPIRED_IN ??
    "72",
);
const RAVIN_LOGIN_EXPIRE_IN = Number(
  process.env.RAVIN_LOGIN_EXPIRE_IN ??
    process.env.RAVIN_LOGIN_EXPIRED_IN ??
    "48",
);

/** Ravin Lite routing: URL `app_type=lite` (future) + inspector-lite path (current). */
const RAVIN_APP_TYPE = (process.env.RAVIN_APP_TYPE ?? "lite").trim().toLowerCase();

export type RavinLiteLinkConfig = {
  appType: string | null;
  inspectorPath: string;
  usesImageUpload: boolean;
};

const DEFAULT_LITE_INSPECTOR_PATH = "inspector-lite/page/tmp";

/** Ravin email: Lite = inspector-lite + image-upload; inspector2 is full flow. */
function effectiveLiteInspectorPath(): string {
  const path = RAVIN_INSPECTOR_PATH.replace(/^\/+/, "").replace(/\/+$/, "");
  if (path.includes("inspector2")) return DEFAULT_LITE_INSPECTOR_PATH;
  return path.includes("inspector-lite") ? path : DEFAULT_LITE_INSPECTOR_PATH;
}

export function getRavinLiteLinkConfig(): RavinLiteLinkConfig {
  const path = effectiveLiteInspectorPath();
  return {
    appType: RAVIN_APP_TYPE || null,
    inspectorPath: path,
    usesImageUpload: true,
  };
}

function applyLiteQueryParams(url: URL): void {
  if (url.pathname.includes("inspector-lite")) {
    if (!url.searchParams.has("image-upload")) {
      url.searchParams.set("image-upload", "true");
    }
  }
  if (RAVIN_APP_TYPE && !url.searchParams.has("app_type")) {
    url.searchParams.set("app_type", RAVIN_APP_TYPE);
  }
}

export type RavinPartnerInvite = {
  invitationId: string;
  inviteUrl: string;
  expiresAt: string | null;
  raw: unknown;
};

export function isRavinPartnerConfigured(): boolean {
  return Boolean(RAVIN_API_KEY && Number.isFinite(RAVIN_SITE_ID) && RAVIN_SITE_ID > 0);
}

/** Inspector Lite mobile walkaround (Site 49 consumer flow). */
export function buildInspectorLiteUrl(code: string): string {
  const base = RAVIN_BASE_URL.replace(/\/$/, "");
  const path = effectiveLiteInspectorPath();
  const url = new URL(`${base}/${path}/`);
  url.searchParams.set("code", code);
  applyLiteQueryParams(url);
  return url.toString();
}

/** True only for the guided Inspector Lite walkthrough (not inspector2 / “preparing inspection”). */
export function isRavinInspectorLiteUrl(url: string): boolean {
  try {
    const parsed = new URL(url.startsWith("http") ? url : `https://${url}`);
    if (!parsed.hostname.includes("ravin-ai.com")) return false;
    return parsed.pathname.includes("inspector-lite");
  } catch {
    return false;
  }
}

export function isRavinLegacyFullInspectorUrl(url: string): boolean {
  try {
    const parsed = new URL(url.startsWith("http") ? url : `https://${url}`);
    return (
      parsed.hostname.includes("ravin-ai.com") &&
      parsed.pathname.includes("inspector2")
    );
  } catch {
    return false;
  }
}

/** Any Ravin-hosted inspector URL (lite or legacy inspector2). */
export function isRavinInspectorUrl(url: string): boolean {
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

/** Rewrite legacy inspector2/tmp links to Inspector Lite walkthrough when we have a session code. */
export function coerceRavinInspectorLiteUrl(url: string): string {
  const normalized = normalizeInspectorUrl(url);
  if (!isRavinInspectorUrl(normalized)) return url;
  if (isRavinInspectorLiteUrl(normalized)) return normalized;

  const code = parseInspectorLiteCodeFromUrl(normalized);
  if (!code) {
    if (isRavinLegacyFullInspectorUrl(normalized)) {
      console.warn(
        "[ravin-partner] Legacy inspector2 URL without session code; cannot rewrite to Inspector Lite.",
      );
    }
    return normalized;
  }

  return buildInspectorLiteUrl(code);
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
    applyLiteQueryParams(parsed);
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

function ravinCompressedUploadTimestamp(): number {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return Number(
    `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}`,
  );
}

/** S3 POST credentials for direct ingest (Auto Verifi site 49 — Appendix C). */
export async function fetchRavinCompressedUploadCredentials(
  claimId: string,
): Promise<RavinS3PostCredentials | null> {
  const trimmedClaim = claimId.trim();
  if (!trimmedClaim) return null;

  const response = await fetch(`${RAVIN_BASE_URL}/generateCompressedDataUpload`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      clientId: RAVIN_CLIENT_ID,
      siteId: RAVIN_SITE_ID,
      claimId: trimmedClaim,
      timestamp: ravinCompressedUploadTimestamp(),
    }),
  });

  const body = await response.json().catch(() => null);
  if (!response.ok) {
    const message =
      (body &&
        typeof body === "object" &&
        typeof (body as Record<string, unknown>).message === "string" &&
        (body as Record<string, unknown>).message) ||
      (body &&
        typeof body === "object" &&
        typeof (body as Record<string, unknown>).error === "string" &&
        (body as Record<string, unknown>).error) ||
      `Ravin compressed upload auth failed (${response.status}).`;
    throw new Error(String(message));
  }

  return extractRavinS3PostCredentials(body);
}

/** S3 POST credentials — compressed-upload auth first, then getSignInToken fallback. */
export async function fetchRavinS3PostCredentials(
  claimId?: string,
): Promise<RavinS3PostCredentials | null> {
  if (claimId?.trim()) {
    try {
      const fromCompressed = await fetchRavinCompressedUploadCredentials(claimId);
      if (fromCompressed) return fromCompressed;
    } catch (err) {
      console.error("[ravin-partner] generateCompressedDataUpload failed:", err);
    }
  }

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
  claimId?: string;
  /** @deprecated use claimId */
  invitationId?: string;
  lp?: string | null;
  state?: string | null;
  linkExpireIn?: number;
  loginExpireIn?: number;
}): Promise<RavinPartnerInvite> {
  const claimId = (input.claimId ?? input.invitationId)?.trim();
  if (!claimId) {
    throw new Error("Ravin partner invite requires claimId.");
  }

  const partnerToken = await getPartnerToken();
  const lp = input.lp?.trim() || claimId;
  const state = input.state?.trim() || "NSW";

  const response = await fetch(`${RAVIN_BASE_URL}/partnerInvite`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      partnerToken,
      siteId: RAVIN_SITE_ID,
      provider: RAVIN_PROVIDER,
      linkExpireIn: input.linkExpireIn ?? RAVIN_LINK_EXPIRE_IN,
      loginExpireIn: input.loginExpireIn ?? RAVIN_LOGIN_EXPIRE_IN,
      claimId,
      lp,
      state,
      ...(RAVIN_APP_TYPE
        ? { app_type: RAVIN_APP_TYPE, appType: RAVIN_APP_TYPE }
        : {}),
      imageUpload: true,
      inspectorPath: effectiveLiteInspectorPath(),
    }),
  });

  const body = await response.json().catch(() => null);
  if (!response.ok) {
    const record =
      body && typeof body === "object" ? (body as Record<string, unknown>) : null;
    const message =
      (typeof record?.message === "string" && record.message) ||
      (typeof record?.error === "string" && record.error) ||
      `Ravin partner invite failed (${response.status}).`;
    throw new Error(message);
  }

  const rawInviteUrl = extractInviteUrl(body);
  if (!rawInviteUrl) {
    throw new Error("Ravin partner invite succeeded but no inspection link was returned.");
  }
  const sessionCode =
    parseInspectorLiteCodeFromUrl(rawInviteUrl) ?? extractSessionCode(body);
  const inviteUrl = sessionCode
    ? buildInspectorLiteUrl(sessionCode)
    : coerceRavinInspectorLiteUrl(rawInviteUrl);

  return {
    invitationId: claimId,
    inviteUrl,
    expiresAt: extractExpiresAt(body),
    raw: body,
  };
}
