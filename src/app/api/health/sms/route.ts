import { NextResponse } from "next/server";
import { getSmsSenderMode, isSmsConfigured } from "@/lib/sms";

/** Public readiness check — no secrets exposed. */
export async function GET() {
  return NextResponse.json({
    smsConfigured: isSmsConfigured(),
    senderMode: getSmsSenderMode(),
  });
}
