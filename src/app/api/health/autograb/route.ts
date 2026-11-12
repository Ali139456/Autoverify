import type { NextRequest } from "next/server";
import { getAutograbHealthPayload } from "@/lib/autograb";
import {
  isProductionRuntime,
  requireOpsAuth,
  secureJson,
} from "@/lib/security";

/** Ops-only in production — exposes integration mode and probe metadata. */
export async function GET(req: NextRequest) {
  if (isProductionRuntime()) {
    const blocked = requireOpsAuth(req);
    if (blocked) return blocked;
  }
  return secureJson(await getAutograbHealthPayload());
}
