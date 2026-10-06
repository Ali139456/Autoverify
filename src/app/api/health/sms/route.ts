import { NextResponse } from "next/server";
import { isSmsConfigured } from "@/lib/sms";

/** Public readiness check — no secrets exposed. */
export async function GET() {
  return NextResponse.json({
    smsConfigured: isSmsConfigured(),
  });
}
