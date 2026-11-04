import { getAutograbHealthPayload } from "@/lib/autograb";
import { secureJson } from "@/lib/security";

/** Public readiness check — no secrets exposed. */
export async function GET() {
  return secureJson(await getAutograbHealthPayload());
}
