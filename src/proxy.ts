import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  isComingSoonMode,
  isLiveProductionHost,
  isPublicWhileComingSoon,
} from "@/lib/site-mode";
import { hasPreviewAccess, PREVIEW_COOKIE_NAME } from "@/lib/site-preview";

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
    return NextResponse.redirect(new URL(inspectionRedirect, request.url), 308);
  }

  if (!isComingSoonMode(host)) {
    return NextResponse.next();
  }

  const previewToken = request.cookies.get(PREVIEW_COOKIE_NAME)?.value;

  if (await hasPreviewAccess(previewToken)) {
    return NextResponse.next();
  }

  if (isPublicWhileComingSoon(pathname)) {
    return withNoCacheForLiveComingSoon(NextResponse.next(), host);
  }

  if (pathname !== "/") {
    return withNoCacheForLiveComingSoon(
      NextResponse.redirect(new URL("/", request.url)),
      host,
    );
  }

  return withNoCacheForLiveComingSoon(NextResponse.next(), host);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
