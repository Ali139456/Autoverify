import { NextRequest, NextResponse } from "next/server";
import {
  createPreviewCookieToken,
  getPreviewCookieMaxAge,
  getPreviewSigningSecret,
  isPreviewProtectionConfigured,
  PREVIEW_COOKIE_NAME,
  verifyPreviewPassword,
} from "@/lib/site-preview";
import {
  clampText,
  guardBrowserPost,
  readBoundedJson,
  safeInternalPath,
  secureJson,
} from "@/lib/security";

export async function POST(req: NextRequest) {
  const blocked = guardBrowserPost(req, "preview-login", 8, 15 * 60 * 1000);
  if (blocked) return blocked;

  if (!isPreviewProtectionConfigured()) {
    return NextResponse.json(
      { error: "Site preview is not configured." },
      { status: 503 },
    );
  }

  let password = "";
  try {
    const body = (await readBoundedJson(req, 4_096)) as { password?: unknown };
    password = clampText(body.password, 256);
  } catch {
    return secureJson({ error: "Invalid request." }, { status: 400 });
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
  const redirectTo = safeInternalPath(req.nextUrl.searchParams.get("next"));

  const response = secureJson({ ok: true, redirectTo });
  response.cookies.set(PREVIEW_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: getPreviewCookieMaxAge(),
  });

  return response;
}
