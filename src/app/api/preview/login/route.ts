import { NextRequest, NextResponse } from "next/server";
import {
  createPreviewCookieToken,
  getPreviewCookieMaxAge,
  getPreviewSigningSecret,
  isPreviewProtectionConfigured,
  PREVIEW_COOKIE_NAME,
  verifyPreviewPassword,
} from "@/lib/site-preview";

export async function POST(req: NextRequest) {
  if (!isPreviewProtectionConfigured()) {
    return NextResponse.json(
      { error: "Site preview is not configured." },
      { status: 503 },
    );
  }

  let password = "";
  try {
    const body = await req.json();
    password = String(body.password ?? "");
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  if (!(await verifyPreviewPassword(password))) {
    return NextResponse.json({ error: "Incorrect password." }, { status: 401 });
  }

  const secret = getPreviewSigningSecret();
  if (!secret) {
    return NextResponse.json(
      { error: "Site preview is not configured." },
      { status: 503 },
    );
  }

  const token = await createPreviewCookieToken(secret);
  const redirectTo = req.nextUrl.searchParams.get("next") || "/";

  const response = NextResponse.json({ ok: true, redirectTo });
  response.cookies.set(PREVIEW_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: getPreviewCookieMaxAge(),
  });

  return response;
}
