import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  isComingSoonMode,
  isLiveProductionHost,
  isPublicWhileComingSoon,
} from "@/lib/site-mode";
import { hasPreviewAccess, PREVIEW_COOKIE_NAME } from "@/lib/site-preview";
import { guardRateLimit } from "@/lib/security";
import { applySecurityHeaders } from "@/lib/security/headers";

const SAME_ORIGIN_FRAME_PATHS = new Set([
  "/solutions/integrations-graphic.html",
]);

function secure(response: NextResponse, request: NextRequest) {
  const allowSameOriginFrame = SAME_ORIGIN_FRAME_PATHS.has(
    request.nextUrl.pathname,
  );
  return applySecurityHeaders(response, { allowSameOriginFrame });
}

const INSPECTION_PATH_ALIASES: Record<string, string> = {
  "/vehicleinspection": "/vehicleinspections",
  "/vehicle-inspection": "/vehicleinspections",
  "/vehicle-inspections": "/vehicleinspections",
};

function withNoCacheForLiveComingSoon(
  response: NextResponse,
  host: string | null,
) {
  if (isLiveProductionHost(host)) {
    response.headers.set(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, proxy-revalidate",
    );
  }

  return response;
}

export async function proxy(request: NextRequest) {
  const host = request.headers.get("host");
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/api/") &&
    !pathname.startsWith("/api/webhooks/")
  ) {
    const limited = guardRateLimit(request, "api-global", 600, 60 * 60 * 1000);
    if (limited) return limited;
  }
  const inspectionRedirect = INSPECTION_PATH_ALIASES[pathname.toLowerCase()];

  if (inspectionRedirect) {
    return secure(
      NextResponse.redirect(new URL(inspectionRedirect, request.url), 308),
      request,
    );
  }

  if (!isComingSoonMode(host)) {
    return secure(NextResponse.next(), request);
  }

  const previewToken = request.cookies.get(PREVIEW_COOKIE_NAME)?.value;

  if (await hasPreviewAccess(previewToken)) {
    return secure(NextResponse.next(), request);
  }

  if (isPublicWhileComingSoon(pathname)) {
    return secure(
      withNoCacheForLiveComingSoon(NextResponse.next(), host),
      request,
    );
  }

  if (pathname !== "/") {
    return secure(
      withNoCacheForLiveComingSoon(
        NextResponse.redirect(new URL("/", request.url)),
        host,
      ),
      request,
    );
  }

  return secure(
    withNoCacheForLiveComingSoon(NextResponse.next(), host),
    request,
  );
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
