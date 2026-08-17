import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isComingSoonMode, isPublicWhileComingSoon } from "@/lib/site-mode";
import { hasPreviewAccess, PREVIEW_COOKIE_NAME } from "@/lib/site-preview";

export async function proxy(request: NextRequest) {
  if (!isComingSoonMode()) {
    return NextResponse.next();
  }

  const { pathname } = request.nextUrl;
  const previewToken = request.cookies.get(PREVIEW_COOKIE_NAME)?.value;

  if (await hasPreviewAccess(previewToken)) {
    return NextResponse.next();
  }

  if (isPublicWhileComingSoon(pathname)) {
    return NextResponse.next();
  }

  if (pathname !== "/") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
