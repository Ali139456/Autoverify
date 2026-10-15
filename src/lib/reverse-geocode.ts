/**
 * Reverse geocoding for inspection photo evidence (suburb + state only on reports).
 * Uses OpenStreetMap Nominatim; failures return null so uploads never block.
 */

const NOMINATIM_URL = "https://nominatim.openstreetmap.org/reverse";
const TIMEOUT_MS = 4000;

type NominatimAddress = Partial<{
  house_number: string;
  road: string;
  suburb: string;
  neighbourhood: string;
  village: string;
  town: string;
  city: string;
  municipality: string;
  state: string;
  postcode: string;
  country: string;
  "ISO3166-2-lvl4": string;
}>;

function stateCode(address: NominatimAddress): string | null {
  const iso = address["ISO3166-2-lvl4"];
  if (iso && iso.includes("-")) return iso.split("-")[1] ?? null;
  return address.state ?? null;
}

const AU_STATE_CODES = /^(NSW|VIC|QLD|SA|WA|TAS|NT|ACT)$/i;

function localityFromAddress(address: NominatimAddress): string | null {
  return (
    address.suburb ??
    address.neighbourhood ??
    address.village ??
    address.town ??
    address.city ??
    address.municipality ??
    null
  );
}

/** e.g. "Mosman, NSW" — no street (driveway GPS varies). */
export function formatReverseGeocodedAddress(address: NominatimAddress): string | null {
  const locality = localityFromAddress(address);
  const state = stateCode(address);
  if (locality && state) {
    const code = state.length <= 3 ? state.toUpperCase() : state;
    return `${locality}, ${code}`;
  }
  if (locality) return locality;
  if (state) return state;
  return null;
}

/** Collapse legacy full-address labels stored on older photos. */
export function compactStoredLocationLabel(label: string): string {
  const trimmed = label.trim();
  if (!trimmed) return trimmed;

  if (/^[^,]+,\s*(NSW|VIC|QLD|SA|WA|TAS|NT|ACT)$/i.test(trimmed)) {
    const [suburb, state] = trimmed.split(",").map((s) => s.trim());
    return `${suburb}, ${state!.toUpperCase()}`;
  }

  const noCountry = trimmed.replace(/,?\s*Australia\s*$/i, "").trim();
  const segments = noCountry.split(",").map((s) => s.trim()).filter(Boolean);

  for (let i = segments.length - 1; i >= 0; i--) {
    const segment = segments[i];
    const match = segment.match(
      /^(.+?)\s+(NSW|VIC|QLD|SA|WA|TAS|NT|ACT)(?:\s+\d{4})?$/i,
    );
    if (match) {
      return `${match[1].trim()}, ${match[2].toUpperCase()}`;
    }
    if (AU_STATE_CODES.test(segment) && i > 0) {
      return `${segments[i - 1]}, ${segment.toUpperCase()}`;
    }
  }

  return trimmed;
}

export async function reverseGeocode(
  latitude: number,
  longitude: number,
): Promise<string | null> {
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;

  const url = new URL(NOMINATIM_URL);
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("lat", latitude.toFixed(6));
  url.searchParams.set("lon", longitude.toFixed(6));
  url.searchParams.set("zoom", "14");
  url.searchParams.set("addressdetails", "1");
  url.searchParams.set("accept-language", "en-AU,en");

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": `AutoVerifi/1.0 (${process.env.NOMINATIM_CONTACT_EMAIL ?? "support@autoverifi.com.au"})`,
        Accept: "application/json",
      },
      signal: controller.signal,
      cache: "no-store",
    });
    if (!response.ok) return null;
    const body = (await response.json()) as { address?: NominatimAddress } | null;
    if (!body?.address) return null;
    return formatReverseGeocodedAddress(body.address);
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}
