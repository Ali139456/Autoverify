"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Link2, Loader2, QrCode, Smartphone } from "lucide-react";
import { InspectionQrModal } from "@/components/InspectionQrModal";

type InspectionStarterProps = {
  reportId: string;
  initialInspectUrl?: string | null;
  customerPhone?: string | null;
  ownerPhone?: string | null;
  autoShowQr?: boolean;
};

export function InspectionStarter({
  reportId,
  initialInspectUrl = null,
  customerPhone = null,
  ownerPhone = null,
  autoShowQr = false,
}: InspectionStarterProps) {
  const [inspectUrl, setInspectUrl] = useState<string | null>(initialInspectUrl);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [smsSent, setSmsSent] = useState(false);
  const [smsError, setSmsError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(
    () => Boolean(autoShowQr && initialInspectUrl),
  );
  const autoStarted = useRef(false);

  const startInspection = useCallback(async (openModal: boolean) => {
    setLoading(true);
    setError(null);
    setSmsSent(false);
    setSmsError(null);

    try {
      const res = await fetch("/api/inspections/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reportId,
          customerPhone,
          ownerPhone,
        }),
      });
      const raw = await res.text();
      let data: {
        error?: string;
        inspectUrl?: string;
        internalInspectUrl?: string;
        provider?: "ravin" | "internal";
        smsSent?: boolean;
        smsError?: string | null;
        ravinWarning?: string | null;
      } = {};
      try {
        data = raw ? (JSON.parse(raw) as typeof data) : {};
      } catch {
        throw new Error(
          raw.trim().slice(0, 120) || `Could not create inspection link (${res.status}).`,
        );
      }
      if (!res.ok) {
        throw new Error(data.error ?? "Could not create inspection link.");
      }
      if (!data.inspectUrl) {
        throw new Error("Inspection link was not returned. Please try again.");
      }
      setInspectUrl(data.inspectUrl);
      if (data.internalInspectUrl && data.provider === "internal") {
        setInspectUrl(data.internalInspectUrl);
      }
      setSmsSent(Boolean(data.smsSent));
      setSmsError(data.smsError ?? data.ravinWarning ?? null);
      if (openModal) setModalOpen(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create inspection link.");
    } finally {
      setLoading(false);
    }
  }, [reportId, customerPhone, ownerPhone]);

  useEffect(() => {
    if (!autoShowQr || autoStarted.current) return;
    autoStarted.current = true;
    if (initialInspectUrl) return;

    const frame = requestAnimationFrame(() => {
      void startInspection(true);
    });
    return () => cancelAnimationFrame(frame);
  }, [autoShowQr, initialInspectUrl, startInspection]);

  function openQrModal() {
    if (inspectUrl) {
      setModalOpen(true);
      return;
    }
    void startInspection(true);
  }

  return (
    <>
      <div className="rounded-2xl border border-accent-500/20 bg-ink-950/70 p-5">
        <div className="flex items-start gap-3">
          <span className="rounded-xl border border-accent-500/30 bg-accent-500/10 p-2">
            <Smartphone className="h-5 w-5 text-accent-400" aria-hidden />
          </span>
          <div>
            <h3 className="font-bold text-white">AI condition check</h3>
            <p className="mt-1 text-sm text-slate-400">
              The vehicle owner completes the guided photo walkaround on their
              mobile. An SMS link is sent to the owner&apos;s number provided at
              checkout.
            </p>
            {ownerPhone && (
              <p className="mt-2 text-xs text-slate-500">
                Owner SMS: <span className="font-medium text-slate-300">{ownerPhone}</span>
              </p>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={openQrModal}
          disabled={loading}
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-accent-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-accent-500 disabled:opacity-60"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          ) : inspectUrl ? (
            <QrCode className="h-4 w-4" aria-hidden />
          ) : (
            <Link2 className="h-4 w-4" aria-hidden />
          )}
          {loading
            ? "Preparing mobile link…"
            : inspectUrl
              ? "Show QR code"
              : "Start condition check"}
        </button>

        {smsSent && (
          <p className="mt-3 text-sm font-medium text-emerald-400">
            Inspection link sent by SMS to the vehicle owner.
          </p>
        )}
        {smsError && (
          <p className="mt-3 text-sm font-medium text-amber-400" role="alert">
            {smsError}
          </p>
        )}

        {inspectUrl && !modalOpen && (
          <p className="mt-3 text-xs text-slate-500">
            Mobile inspection link is ready. Open the QR code to continue on another device.
          </p>
        )}

        {error && (
          <p className="mt-3 text-sm font-medium text-red-400" role="alert">
            {error}
          </p>
        )}
      </div>

      {inspectUrl && (
        <InspectionQrModal
          open={modalOpen}
          inspectUrl={inspectUrl}
          reportId={reportId}
          defaultRecipientPhone={ownerPhone ?? ""}
          onClose={() => setModalOpen(false)}
        />
      )}
    </>
  );
}
