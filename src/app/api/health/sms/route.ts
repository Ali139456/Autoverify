import type { NextRequest } from "next/server";
import { getSmsSenderMode, isSmsConfigured } from "@/lib/sms";
import {
  isProductionRuntime,
  requireOpsAuth,
  secureJson,
} from "@/lib/security";

/** Ops-only in production — reveals whether SMS is configured. */
export async function GET(req: NextRequest) {
  if (isProductionRuntime()) {
    const blocked = requireOpsAuth(req);
    if (blocked) return blocked;
  }
  return secureJson({
    smsConfigured: isSmsConfigured(),
    senderMode: getSmsSenderMode(),
  });
}
