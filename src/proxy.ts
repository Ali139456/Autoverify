import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  grantsPreviewBypass,
  isComingSoonMode,
  isLiveProductionHost,
  isPublicWhileComingSoon,
} from "@/lib/site-mode";
import { hasPreviewAccess, PREVIEW_COOKIE_NAME } from "@/lib/site-preview";

function withLiveSiteHeaders(response: NextResponse, host: string | null) {
  if (isLiveProductionHost(host)) {
    response.cookies.delete(PREVIEW_COOKIE_NAME);
    response.headers.set(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, proxy-revalidate",
    );
  }

  return response;
}

export async function proxy(request: NextRequest) {
  const host = request.headers.get("host");

  if (!isComingSoonMode(host)) {
    return withLiveSiteHeaders(NextResponse.next(), host);
  }

  const { pathname } = request.nextUrl;
  const previewToken = request.cookies.get(PREVIEW_COOKIE_NAME)?.value;
  const previewAccess = await hasPreviewAccess(previewToken);

  if (grantsPreviewBypass(host, previewAccess)) {
    return NextResponse.next();
  }

  if (isPublicWhileComingSoon(pathname)) {
    return withLiveSiteHeaders(NextResponse.next(), host);
  }

  if (pathname !== "/") {
    return withLiveSiteHeaders(
      NextResponse.redirect(new URL("/", request.url)),
      host,
    );
  }

  return withLiveSiteHeaders(NextResponse.next(), host);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
