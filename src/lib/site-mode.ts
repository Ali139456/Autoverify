const PUBLIC_PATHS = [
  "/vehicleinspections",
  "/inspect",
  "/terms",
  "/privacy",
  "/check",
  "/checkout",
  "/report",
];

const LIVE_HOSTS = new Set(["autoverifi.com.au", "www.autoverifi.com.au"]);

export function normalizeHost(host: string | null | undefined): string | null {
  if (!host) return null;
  return host.toLowerCase().split(":")[0];
}

export function isLiveProductionHost(host: string | null | undefined): boolean {
  const normalized = normalizeHost(host);
  return normalized !== null && LIVE_HOSTS.has(normalized);
}

/**
 * Live domain stays on Coming Soon until NEXT_PUBLIC_SITE_LAUNCHED=true.
 * Preview access (/preview password) still unlocks the full site for review.
 */
export function isComingSoonMode(host?: string | null): boolean {
  if (process.env.NEXT_PUBLIC_SITE_LAUNCHED === "true") {
    return false;
  }

  if (isLiveProductionHost(host)) {
    return true;
  }

  return process.env.NEXT_PUBLIC_COMING_SOON !== "false";
}

/** Preview password must not unlock the public live marketing domain. */
export function grantsPreviewBypass(
  host: string | null | undefined,
  hasPreviewCookie: boolean,
): boolean {
  if (!hasPreviewCookie || isLiveProductionHost(host)) {
    return false;
  }

  return true;
}

export function shouldShowComingSoonPage(
  host: string | null | undefined,
  hasPreviewCookie: boolean,
): boolean {
  if (!isComingSoonMode(host)) {
    return false;
  }

  return !grantsPreviewBypass(host, hasPreviewCookie);
}

export function isPublicWhileComingSoon(pathname: string): boolean {
  if (
    PUBLIC_PATHS.some(
      (path) => pathname === path || pathname.startsWith(`${path}/`),
    )
  ) {
    return true;
  }

  if (
    pathname.startsWith("/api/webhooks/") ||
    pathname === "/api/checkout"
  ) {
    return true;
  }

  if (pathname === "/preview" || pathname.startsWith("/api/preview/")) {
    return true;
  }

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/logo/") ||
    pathname === "/icon.png" ||
    pathname === "/sitemap.xml" ||
    pathname === "/robots.txt"
  ) {
    return true;
  }

  if (/\.(png|webp|jpe?g|svg|ico|txt|xml|woff2?)$/i.test(pathname)) {
    return true;
  }

  return false;
}
