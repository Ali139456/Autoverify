import type { AustralianState, ManufacturerWarrantyServiceInfo } from "./types";

export type { ManufacturerWarrantyServiceInfo };

const INFOAGENT_API_BASE_URL = process.env.INFOAGENT_API_BASE_URL?.replace(
  /\/$/,
  "",
);
const INFOAGENT_API_KEY = process.env.INFOAGENT_API_KEY?.trim();

export function isInfoAgentConfigured(): boolean {
  return Boolean(INFOAGENT_API_BASE_URL && INFOAGENT_API_KEY);
}

function infoAgentHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };
  const authHeader = process.env.INFOAGENT_AUTH_HEADER?.trim() || "Authorization";
  const authPrefix = process.env.INFOAGENT_AUTH_PREFIX?.trim() ?? "Bearer ";
  if (authHeader.toLowerCase() === "authorization") {
    headers.Authorization = `${authPrefix}${INFOAGENT_API_KEY}`;
  } else {
    headers[authHeader] = INFOAGENT_API_KEY as string;
  }
  return headers;
}

function readNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value.replace(/,/g, ""));
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function extractWarrantyServiceInfo(payload: unknown): ManufacturerWarrantyServiceInfo | null {
  if (!payload || typeof payload !== "object") return null;
  const root = payload as Record<string, unknown>;
  const result = root.result as Record<string, unknown> | undefined;
  const vehicle = (result?.vehicle ?? root.vehicle) as Record<string, unknown> | undefined;
  const info = (vehicle?.warrantyServiceInfo ?? root.warrantyServiceInfo) as
    | Record<string, unknown>
    | undefined;
  if (!info) return null;

  const parsed: ManufacturerWarrantyServiceInfo = {
    warrantyYears: readNumber(info.warrantyYears),
    warrantyKm: readNumber(info.warrantyKm),
    warrantyAntiCorrosionYears: readNumber(info.warrantyAntiCorrosion),
    regularServiceKm: readNumber(info.regularServiceKm),
    regularServiceMonths: readNumber(info.regularServiceMonths),
  };

  const hasData = Object.values(parsed).some((v) => v != null);
  return hasData ? parsed : null;
}

/** InfoAgent Warranty & Service (rego + state or 17-char VIN). */
export async function fetchManufacturerWarrantyService(input: {
  rego?: string | null;
  state?: AustralianState | null;
  vin?: string | null;
}): Promise<ManufacturerWarrantyServiceInfo | null> {
  if (!isInfoAgentConfigured()) return null;

  const vin = input.vin?.trim().toUpperCase();
  const rego = input.rego?.trim().toUpperCase();
  const state = input.state?.trim().toUpperCase();

  const path = process.env.INFOAGENT_VEHICLE_PATH?.trim() || "/vehicle";
  const method = (process.env.INFOAGENT_HTTP_METHOD ?? "POST").toUpperCase();

  let url = `${INFOAGENT_API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
  let init: RequestInit = {
    method,
    headers: infoAgentHeaders(),
    cache: "no-store",
  };

  if (vin && vin.length === 17) {
    if (method === "GET") {
      url += `?vin=${encodeURIComponent(vin)}`;
    } else {
      init = {
        ...init,
        body: JSON.stringify({ vin, identification: { vin } }),
      };
    }
  } else if (rego && state) {
    if (method === "GET") {
      url += `?plate=${encodeURIComponent(rego)}&state=${encodeURIComponent(state)}`;
    } else {
      init = {
        ...init,
        body: JSON.stringify({
          plate: rego,
          state,
          identification: { plate: rego, state },
        }),
      };
    }
  } else {
    return null;
  }

  try {
    const res = await fetch(url, init);
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
