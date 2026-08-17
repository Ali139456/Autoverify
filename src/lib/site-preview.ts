export const PREVIEW_COOKIE_NAME = "av_site_preview";
const PREVIEW_PAYLOAD = "autoverifi-preview-v1";
const PREVIEW_COOKIE_MAX_AGE = 60 * 60 * 24 * 14;

export function isPreviewProtectionConfigured(): boolean {
  return Boolean(process.env.SITE_PREVIEW_PASSWORD?.trim());
}

export function getPreviewSigningSecret(): string | null {
  const password = process.env.SITE_PREVIEW_PASSWORD?.trim();
  if (!password) return null;

  const pepper = process.env.SITE_PREVIEW_SECRET?.trim() ?? "autoverifi-preview-v1";
  return `${pepper}:${password}`;
}

export function getPreviewCookieMaxAge(): number {
  return PREVIEW_COOKIE_MAX_AGE;
}

async function signPreviewToken(secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );

  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(PREVIEW_PAYLOAD),
  );

  return Buffer.from(signature).toString("base64url");
}

export async function createPreviewCookieToken(secret: string): Promise<string> {
  return signPreviewToken(secret);
}

export async function verifyPreviewCookieToken(
  secret: string,
  token: string,
): Promise<boolean> {
  const expected = await signPreviewToken(secret);
  if (expected.length !== token.length) return false;

  let mismatch = 0;
  for (let index = 0; index < expected.length; index += 1) {
    mismatch |= expected.charCodeAt(index) ^ token.charCodeAt(index);
  }

  return mismatch === 0;
}

export async function verifyPreviewPassword(password: string): Promise<boolean> {
  const configured = process.env.SITE_PREVIEW_PASSWORD?.trim();
  if (!configured) return false;

  const normalized = password.trim();
  if (normalized.length !== configured.length) return false;

  let mismatch = 0;
  for (let index = 0; index < configured.length; index += 1) {
    mismatch |= configured.charCodeAt(index) ^ normalized.charCodeAt(index);
  }

  return mismatch === 0;
}

export async function hasPreviewAccess(token: string | undefined): Promise<boolean> {
  const secret = getPreviewSigningSecret();
  if (!secret || !token) return false;
  return verifyPreviewCookieToken(secret, token);
}
