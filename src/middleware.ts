import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isComingSoonMode, isPublicWhileComingSoon } from "@/lib/site-mode";

export function middleware(request: NextRequest) {
  if (!isComingSoonMode()) {
    return NextResponse.next();
  }

  const { pathname } = request.nextUrl;

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
