const PUBLIC_PATHS = ["/vehicleinspections", "/inspect", "/terms", "/privacy"];

/** Main marketing site is hidden by default; tender page stays public. Set NEXT_PUBLIC_COMING_SOON=false to launch fully. */
export function isComingSoonMode(): boolean {
  return process.env.NEXT_PUBLIC_COMING_SOON !== "false";
}

export function isPublicWhileComingSoon(pathname: string): boolean {
  if (
    PUBLIC_PATHS.some(
      (path) => pathname === path || pathname.startsWith(`${path}/`),
    )
  ) {
    return true;
  }

  if (pathname.startsWith("/api/webhooks/")) {
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
