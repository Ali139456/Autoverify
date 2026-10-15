import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  isComingSoonMode,
  isLiveProductionHost,
  isPublicWhileComingSoon,
} from "@/lib/site-mode";
import { hasPreviewAccess, PREVIEW_COOKIE_NAME } from "@/lib/site-preview";
import { applySecurityHeaders } from "@/lib/security/headers";

function secure(response: NextResponse) {
  return applySecurityHeaders(response);
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
  const inspectionRedirect = INSPECTION_PATH_ALIASES[pathname.toLowerCase()];

  if (inspectionRedirect) {
    return secure(
      NextResponse.redirect(new URL(inspectionRedirect, request.url), 308),
    );
  }

  if (!isComingSoonMode(host)) {
    return secure(NextResponse.next());
  }

  const previewToken = request.cookies.get(PREVIEW_COOKIE_NAME)?.value;

  if (await hasPreviewAccess(previewToken)) {
    return secure(NextResponse.next());
  }

  if (isPublicWhileComingSoon(pathname)) {
    return secure(withNoCacheForLiveComingSoon(NextResponse.next(), host));
  }

  if (pathname !== "/") {
    return secure(
      withNoCacheForLiveComingSoon(
        NextResponse.redirect(new URL("/", request.url)),
        host,
      ),
    );
  }

  return secure(withNoCacheForLiveComingSoon(NextResponse.next(), host));
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
