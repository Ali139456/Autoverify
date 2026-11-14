/** Best-effort device location at photo capture (mobile browser). */

export type CaptureGeolocation = {
  latitude: number;
  longitude: number;
  locationAccuracyM: number;
};

const CACHE_TTL_MS = 2 * 60 * 1000;
let cached: (CaptureGeolocation & { cachedAt: number }) | null = null;
let warmPromise: Promise<CaptureGeolocation | null> | null = null;

function readPosition(
  options: PositionOptions,
): Promise<CaptureGeolocation | null> {
  if (typeof navigator === "undefined" || !navigator.geolocation) {
    return Promise.resolve(null);
  }

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          locationAccuracyM: position.coords.accuracy,
        });
      },
      () => resolve(null),
      options,
    );
  });
}

function storeCache(geo: CaptureGeolocation | null) {
  if (!geo) return;
  cached = { ...geo, cachedAt: Date.now() };
}

/** Call when the capture screen loads so the first upload is not blocked on GPS. */
export function warmCaptureGeolocation(): void {
  if (cached && Date.now() - cached.cachedAt < CACHE_TTL_MS) return;
  if (warmPromise) return;
  warmPromise = readCaptureGeolocation({ maxWaitMs: 3500 }).finally(() => {
    warmPromise = null;
  });
}

export function peekCaptureGeolocation(): CaptureGeolocation | null {
  if (!cached) return null;
  if (Date.now() - cached.cachedAt > CACHE_TTL_MS) return null;
  return {
    latitude: cached.latitude,
    longitude: cached.longitude,
    locationAccuracyM: cached.locationAccuracyM,
  };
}

export async function readCaptureGeolocation(options?: {
  maxWaitMs?: number;
}): Promise<CaptureGeolocation | null> {
  const fresh = peekCaptureGeolocation();
  if (fresh) return fresh;

  const maxWaitMs = options?.maxWaitMs ?? 2500;
  const geo = await readPosition({
    enableHighAccuracy: false,
    timeout: maxWaitMs,
    maximumAge: CACHE_TTL_MS,
  });
  storeCache(geo);
  return geo;
}