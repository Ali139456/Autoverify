export const ADMIN_COOKIE_NAME = "av_admin";
const ADMIN_PAYLOAD = "autoverifi-admin-v1";
const ADMIN_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;

export function isAdminProtectionConfigured(): boolean {
  return Boolean(process.env.ADMIN_PASSWORD?.trim());
}

export function getAdminSigningSecret(): string | null {
  const password = process.env.ADMIN_PASSWORD?.trim();
  if (!password) return null;

  const pepper = process.env.ADMIN_SECRET?.trim() ?? "autoverifi-admin-v1";
  return `${pepper}:${password}`;
}

export function getAdminCookieMaxAge(): number {
  return ADMIN_COOKIE_MAX_AGE;
}

async function signAdminToken(secret: string): Promise<string> {
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
    new TextEncoder().encode(ADMIN_PAYLOAD),
  );

  return Buffer.from(signature).toString("base64url");
}

export async function createAdminCookieToken(secret: string): Promise<string> {
  return signAdminToken(secret);
}

export async function verifyAdminCookieToken(
  secret: string,
  token: string,
): Promise<boolean> {
  const expected = await signAdminToken(secret);
  if (expected.length !== token.length) return false;

  let mismatch = 0;
  for (let index = 0; index < expected.length; index += 1) {
    mismatch |= expected.charCodeAt(index) ^ token.charCodeAt(index);
  }

  return mismatch === 0;
}

export async function verifyAdminPassword(password: string): Promise<boolean> {
  const configured = process.env.ADMIN_PASSWORD?.trim();
  if (!configured) return false;

  const normalized = password.trim();
  if (normalized.length !== configured.length) return false;

  let mismatch = 0;
  for (let index = 0; index < configured.length; index += 1) {
    mismatch |= configured.charCodeAt(index) ^ normalized.charCodeAt(index);
  }

  return mismatch === 0;
}

export async function hasAdminAccess(token: string | undefined): Promise<boolean> {
  const secret = getAdminSigningSecret();
  if (!secret || !token) return false;
  return verifyAdminCookieToken(secret, token);
}