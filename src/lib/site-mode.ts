const PUBLIC_PATHS = ["/vehicleinspections", "/inspect", "/terms", "/privacy"];

/** Full site is live by default. Set NEXT_PUBLIC_COMING_SOON=true to show the landing page only. */
export function isComingSoonMode(): boolean {
  return process.env.NEXT_PUBLIC_COMING_SOON === "true";
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
