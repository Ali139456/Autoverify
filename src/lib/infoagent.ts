import type { AustralianState, ManufacturerWarrantyServiceInfo } from "./types";

export type { ManufacturerWarrantyServiceInfo };

const INFOAGENT_API_BASE_URL = process.env.INFOAGENT_API_BASE_URL?.replace(
  /\/$/,
  "",
);
const INFOAGENT_API_KEY = process.env.INFOAGENT_API_KEY?.trim();
const INFOAGENT_CLIENT_ID = process.env.INFOAGENT_CLIENT_ID?.trim();
const INFOAGENT_CLIENT_SECRET = process.env.INFOAGENT_CLIENT_SECRET?.trim();

const DEFAULT_WARRANTY_PATH =
  "/ivds/v1/au/vehicle-report/warranty-service";
const TOKEN_PATH = "/auth/v1/token/oauth";

let cachedAccessToken: { token: string; expiresAtMs: number } | null = null;

export function isInfoAgentConfigured(): boolean {
  if (!INFOAGENT_API_BASE_URL) return false;
  if (INFOAGENT_CLIENT_ID && INFOAGENT_CLIENT_SECRET) return true;
  return Boolean(INFOAGENT_API_KEY);
}

function readNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value < 0 ? null : value;
  }
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value.replace(/,/g, ""));
    if (!Number.isFinite(parsed) || parsed < 0) return null;
    return parsed;
  }
  return null;
}

function isUnlimitedKm(value: unknown): boolean {
  if (value === -1 || value === "-1") return true;
  return false;
}

/** Maps InfoAgent `result.vehicle` warranty payload onto report fields. */
export function extractWarrantyServiceInfo(
  payload: unknown,
): ManufacturerWarrantyServiceInfo | null {
  if (!payload || typeof payload !== "object") return null;
  const root = payload as Record<string, unknown>;
  const result = root.result as Record<string, unknown> | undefined;
  const vehicle = (result?.vehicle ?? root.vehicle) as
    | Record<string, unknown>
    | undefined;
  const info = (vehicle?.warrantyServiceInfo ?? root.warrantyServiceInfo) as
    | Record<string, unknown>
    | undefined;
  if (!info) return null;

  const details = vehicle?.details as Record<string, unknown> | undefined;
  const compliancePlate =
    typeof details?.compliancePlate === "string"
      ? details.compliancePlate.trim() || null
      : null;

  const warrantyKmRaw = info.warrantyKm;
  const hvKmRaw = info.hvBatteryWarrantyKm;

  const parsed: ManufacturerWarrantyServiceInfo = {
    warrantyYears: readNumber(info.warrantyYears),
    warrantyKm: isUnlimitedKm(warrantyKmRaw)
      ? null
      : readNumber(warrantyKmRaw),
    warrantyKmUnlimited: isUnlimitedKm(warrantyKmRaw) ? true : undefined,
    warrantyAntiCorrosionYears: readNumber(info.warrantyAntiCorrosion),
    regularServiceKm: readNumber(info.regularServiceKm),
    regularServiceMonths: readNumber(info.regularServiceMonths),
    firstServiceKm: readNumber(info.firstServiceKm),
    firstServiceMonths: readNumber(info.firstServiceMonths),
    warrantyCustomerAssist:
      typeof info.warrantyCustomerAssist === "string"
        ? info.warrantyCustomerAssist.trim() || null
        : null,
    warrantyExtraInfo:
      typeof info.warrantyExtraInfo === "string"
        ? info.warrantyExtraInfo.trim() || null
        : null,
    hvBatteryWarrantyKm: isUnlimitedKm(hvKmRaw)
      ? null
      : readNumber(hvKmRaw),
    hvBatteryWarrantyKmUnlimited: isUnlimitedKm(hvKmRaw) ? true : undefined,
    hvBatteryWarrantyYears: readNumber(info.hvBatteryWarrantyYears),
    hvWarrantyExtraInfo:
      typeof info.hvWarrantyExtraInfo === "string"
        ? info.hvWarrantyExtraInfo.trim() || null
        : null,
    compliancePlate,
  };

  const hasData =
    compliancePlate != null ||
    Object.entries(parsed).some(([key, v]) => {
      if (key === "compliancePlate") return false;
      return v != null && v !== undefined;
    });
  return hasData ? parsed : null;
}

async function fetchInfoAgentAccessToken(): Promise<string | null> {
  if (INFOAGENT_CLIENT_ID && INFOAGENT_CLIENT_SECRET && INFOAGENT_API_BASE_URL) {
    const now = Date.now();
    if (cachedAccessToken && cachedAccessToken.expiresAtMs > now + 60_000) {
      return cachedAccessToken.token;
    }

    const url = `${INFOAGENT_API_BASE_URL}${TOKEN_PATH}`;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        grant_type: "client_credentials",
        client_id: INFOAGENT_CLIENT_ID,
        client_secret: INFOAGENT_CLIENT_SECRET,
      }),
      cache: "no-store",
    });

    if (!res.ok) {
      console.warn(`[infoagent] token request failed (${res.status}).`);
      return null;
    }

    const data = (await res.json().catch(() => null)) as {
      access_token?: string;
      expires_in?: number;
    } | null;
    const token = data?.access_token?.trim();
    if (!token) return null;

    const expiresInSec =
      typeof data?.expires_in === "number" && data.expires_in > 0
        ? data.expires_in
        : 3600;
    cachedAccessToken = {
      token,
      expiresAtMs: now + expiresInSec * 1000,
    };
    return token;
  }

  return INFOAGENT_API_KEY ?? null;
}

async function infoAgentAuthHeaders(): Promise<Record<string, string> | null> {
  const token = await fetchInfoAgentAccessToken();
  if (!token) return null;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  const authHeader =
    process.env.INFOAGENT_AUTH_HEADER?.trim() || "Authorization";
  const authPrefix = process.env.INFOAGENT_AUTH_PREFIX?.trim() ?? "Bearer ";
  if (authHeader.toLowerCase() === "authorization") {
    headers.Authorization = `${authPrefix}${token}`;
  } else {
    headers[authHeader] = token;
  }
  return headers;
}

function buildWarrantyRequestBody(input: {
  rego?: string;
  state?: string;
  vin?: string;
}): string | null {
  const vin = input.vin?.trim().toUpperCase();
  const plate = input.rego?.trim().toUpperCase();
  const state = input.state?.trim().toUpperCase();

  if (vin && vin.length === 17) {
    return JSON.stringify({ vin });
  }
  if (plate && state) {
    return JSON.stringify({ plate, state });
  }
  return null;
}

/** InfoAgent Warranty & Service (rego + state or 17-char VIN). */
export async function fetchManufacturerWarrantyService(input: {
  rego?: string | null;
  state?: AustralianState | null;
  vin?: string | null;
}): Promise<ManufacturerWarrantyServiceInfo | null> {
  if (!isInfoAgentConfigured() || !INFOAGENT_API_BASE_URL) return null;

  const body = buildWarrantyRequestBody({
    rego: input.rego ?? undefined,
    state: input.state ?? undefined,
    vin: input.vin ?? undefined,
  });
  if (!body) return null;

  const path =
    process.env.INFOAGENT_WARRANTY_PATH?.trim() ||
    process.env.INFOAGENT_VEHICLE_PATH?.trim() ||
    DEFAULT_WARRANTY_PATH;
  const url = `${INFOAGENT_API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;

  try {
    const headers = await infoAgentAuthHeaders();
    if (!headers) return null;

    const res = await fetch(url, {
      method: "POST",
      headers,
      body,
      cache: "no-store",
    });
    if (!res.ok) {
      console.warn(`[infoagent] warranty lookup failed (${res.status}).`);
      return null;
    }
    const payload = await res.json().catch(() => null);
    if (payload && typeof payload === "object") {
      const record = payload as Record<string, unknown>;
      const nested = record.result as Record<string, unknown> | undefined;
      const code = String(nested?.responseCode ?? record.responseCode ?? "")
        .trim()
        .toUpperCase();
      if (code && code !== "SUCCESS") return null;
    }
    return extractWarrantyServiceInfo(payload);
  } catch (err) {
    console.error("[infoagent] warranty lookup error:", err);
    return null;
  }
}

export const DEMO_MANUFACTURER_WARRANTY_SERVICE: ManufacturerWarrantyServiceInfo =
  {
    warrantyYears: 3,
    warrantyKm: 100_000,
    warrantyAntiCorrosionYears: 5,
    regularServiceKm: 10_000,
    regularServiceMonths: 6,
  };
