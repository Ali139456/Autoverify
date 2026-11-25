import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import {
  ADMIN_COOKIE_NAME,
  getAdminSigningSecret,
  hasAdminAccess,
  isAdminProtectionConfigured,
} from "@/lib/admin-auth";
import { listAdminJobs } from "@/lib/admin/jobs";
import { guardRateLimit, secureJson } from "@/lib/security";

export async function GET(req: NextRequest) {
  const rateLimited = guardRateLimit(req, "admin-jobs", 60, 60 * 1000);
  if (rateLimited) return rateLimited;

  if (!isAdminProtectionConfigured()) {
    return secureJson({ error: "Admin dashboard is not configured." }, { status: 503 });
  }

  const secret = getAdminSigningSecret();
  const token = (await cookies()).get(ADMIN_COOKIE_NAME)?.value;
  if (!secret || !(await hasAdminAccess(token))) {
    return secureJson({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const { jobs, configured } = await listAdminJobs();
    return NextResponse.json({ jobs, configured });
  } catch (err) {
    console.error("[admin/jobs]", err);
    return NextResponse.json(
      { error: "Could not load bookings." },
      { status: 500 },
    );
  }
}