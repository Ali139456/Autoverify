/**
 * Reverse geocoding for inspection photo evidence (suburb, state, postcode, country —
 * plus street when available). Uses OpenStreetMap Nominatim; failures return null so
 * uploads never block on geocoding.
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

export function formatReverseGeocodedAddress(address: NominatimAddress): string | null {
  const street = [address.house_number, address.road].filter(Boolean).join(" ").trim();
  const locality =
    address.suburb ??
    address.neighbourhood ??
    address.village ??
    address.town ??
    address.city ??
    address.municipality ??
    null;
  const region = [locality, stateCode(address), address.postcode]
    .filter(Boolean)
    .join(" ")
    .trim();

  const parts = [street || null, region || null, address.country ?? null].filter(
    (part): part is string => Boolean(part),
  );
  return parts.length > 0 ? parts.join(", ") : null;
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
  url.searchParams.set("zoom", "18");
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
