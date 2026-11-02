import { NextRequest, NextResponse } from "next/server";
import { runDamageFollowUpEmailJob } from "@/lib/damage-follow-up-email";
import { requireCronAuth, secureJson } from "@/lib/security";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/** Vercel Cron: backup completion email if webhook delivery missed (~5 min after analysis). */
export async function GET(req: NextRequest) {
  const blocked = requireCronAuth(req);
  if (blocked) return blocked;

  const summary = await runDamageFollowUpEmailJob();
  console.info("[cron/inspection-damage-followup]", JSON.stringify(summary));
  return secureJson(summary);
}
