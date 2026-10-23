"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

const POLL_MS = 15_000;
/** ~75 minutes while the report tab stays open. */
const MAX_POLLS = 300;

export function ReportInsightsPoller({
  reportId,
  enabled,
}: {
  reportId: string;
  /** When true, poll for Ravin damage until it appears or we hit the limit. */
  enabled: boolean;
}) {
  const router = useRouter();
  const polls = useRef(0);
  const [checking, setChecking] = useState(enabled);

  useEffect(() => {
    if (!enabled) {
      setChecking(false);
      return;
    }

    let cancelled = false;
    polls.current = 0;
    setChecking(true);

    async function tick() {
      if (cancelled || polls.current >= MAX_POLLS) {
        setChecking(false);
        return;
      }
      polls.current += 1;
      try {
        const res = await fetch(`/api/report/${encodeURIComponent(reportId)}/insights-sync`, {
          cache: "no-store",
        });
        if (!res.ok) return;
        const json = (await res.json()) as {
          hasDamage?: boolean;
          findings?: number;
          synced?: boolean;
        };
        if (json.hasDamage || (json.findings ?? 0) > 0 || json.synced) {
          router.refresh();
          setChecking(false);
          return;
        }
      } catch {
        /* ignore transient network errors */
      }
      if (!cancelled && polls.current < MAX_POLLS) {
        window.setTimeout(tick, POLL_MS);
      } else {
        setChecking(false);
      }
    }

    void tick();
    return () => {
      cancelled = true;
    };
  }, [enabled, reportId, router]);

  if (!checking) return null;

  return (
    <p
      className="report-no-print mb-4 flex items-center justify-center gap-2 rounded-xl border border-[#0073E3]/30 bg-[#0073E3]/5 px-4 py-3 text-sm text-slate-600"
      role="status"
    >
      <Loader2 className="h-4 w-4 shrink-0 animate-spin text-[#0073E3]" aria-hidden />
      AI damage analysis is processing — this page will update automatically when Ravin
      delivers results (often within a few minutes).
    </p>
  );
}
