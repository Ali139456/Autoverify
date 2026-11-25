import { NextRequest, NextResponse } from "next/server";
import {
  ADMIN_COOKIE_NAME,
  createAdminCookieToken,
  getAdminCookieMaxAge,
  getAdminSigningSecret,
  isAdminProtectionConfigured,
  verifyAdminPassword,
} from "@/lib/admin-auth";
import {
  guardBrowserPost,
  readBoundedJson,
  secureJson,
} from "@/lib/security";

export async function POST(req: NextRequest) {
  const blocked = guardBrowserPost(req, "admin-login", 8, 15 * 60 * 1000);
  if (blocked) return blocked;

  if (!isAdminProtectionConfigured()) {
    return NextResponse.json(
      { error: "Admin dashboard is not configured." },
      { status: 503 },
    );
  }

  let password = "";
  try {
    const body = (await readBoundedJson(req, 4_096)) as { password?: unknown };
    password = typeof body.password === "string" ? body.password : "";
  } catch {
    return secureJson({ error: "Invalid request." }, { status: 400 });
  }

  if (!(await verifyAdminPassword(password))) {
    return NextResponse.json({ error: "Incorrect password." }, { status: 401 });
  }

  const secret = getAdminSigningSecret();
  if (!secret) {
    return NextResponse.json(
      { error: "Admin dashboard is not configured." },
      { status: 503 },
    );
  }

  const token = await createAdminCookieToken(secret);
  const response = secureJson({ ok: true });
  response.cookies.set(ADMIN_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: getAdminCookieMaxAge(),
  });

  return response;
}