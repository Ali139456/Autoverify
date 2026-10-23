import { NextRequest, NextResponse } from "next/server";
import { runRavinBackgroundSync } from "@/lib/ravin-background-sync";
import { requireCronAuth, secureJson } from "@/lib/security";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/** Vercel Cron: replay stored Ravin webhooks + ops alert when analysis stays missing. */
export async function GET(req: NextRequest) {
  const blocked = requireCronAuth(req);
  if (blocked) return blocked;

  const summary = await runRavinBackgroundSync();
  console.info("[cron/ravin-sync]", JSON.stringify(summary));
  return secureJson(summary);
}
