import { getSmsSenderMode, isSmsConfigured } from "@/lib/sms";
import { secureJson } from "@/lib/security";

/** Public readiness check — no secrets exposed. */
export async function GET() {
  return secureJson({
    smsConfigured: isSmsConfigured(),
    senderMode: getSmsSenderMode(),
  });
}
