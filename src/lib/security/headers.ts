import { NextResponse } from "next/server";

type SecurityHeaderOptions = {
  /** Allow this document to load in an iframe on the same site (e.g. Solutions embed). */
  allowSameOriginFrame?: boolean;
};

/** Baseline HTTP security headers for HTML, API, and static assets. */
export function applySecurityHeaders(
  response: NextResponse,
  options?: SecurityHeaderOptions,
): NextResponse {
  response.headers.set(
    "X-Frame-Options",
    options?.allowSameOriginFrame ? "SAMEORIGIN" : "DENY",
  );
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("X-DNS-Prefetch-Control", "off");
  response.headers.set(
    "Permissions-Policy",
    "camera=(self), geolocation=(self), microphone=(), payment=(self)",
  );
  response.headers.set("Cross-Origin-Opener-Policy", "same-origin");
  response.headers.set("Cross-Origin-Resource-Policy", "same-site");

  if (process.env.NODE_ENV === "production") {
    response.headers.set(
      "Strict-Transport-Security",
      "max-age=63072000; includeSubDomains; preload",
    );
    if (process.env.DISABLE_CSP !== "true") {
      response.headers.set(
        "Content-Security-Policy",
        [
          "default-src 'self'",
          "base-uri 'self'",
          "form-action 'self'",
          "frame-ancestors 'self'",
          "object-src 'none'",
          "script-src 'self' 'unsafe-inline'",
          "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
          "font-src 'self' https://fonts.gstatic.com data:",
          "img-src 'self' data: blob: https:",
          "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.stripe.com",
          "frame-src 'self'",
        ].join("; "),
      );
    }
  }

  return response;
}

export function secureJson(
  body: unknown,
  init?: ResponseInit,
): NextResponse {
  const response = NextResponse.json(body, init);
  response.headers.set("Cache-Control", "no-store");
  return applySecurityHeaders(response);
}
