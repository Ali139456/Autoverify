"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Link2, Loader2, QrCode } from "lucide-react";
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
  const [smsError, setSmsError] = useState<string | null>(null);
  const [ravinWarning, setRavinWarning] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(() => {
    try {
      const key = `autoverifi-inspection-submitted:${reportId}`;
      if (sessionStorage.getItem(key)) {
        sessionStorage.removeItem(key);
      }
    } catch {
      // ignore
    }
    return false;
  });
  const autoStarted = useRef(false);

  const dismissQrModalIfInspectionFinished = useCallback(() => {
    try {
      const key = `autoverifi-inspection-submitted:${reportId}`;
      if (sessionStorage.getItem(key)) {
        sessionStorage.removeItem(key);
        setModalOpen(false);
      }
    } catch {
      // ignore
    }
  }, [reportId]);

  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState !== "visible") return;
      dismissQrModalIfInspectionFinished();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [dismissQrModalIfInspectionFinished]);

  const startInspection = useCallback(async (
    openModal: boolean,
    refreshRavinInvite = false,
    sendSms = false,
  ) => {
    setLoading(true);
    setError(null);
    setSmsError(null);
    setRavinWarning(null);

    try {
      const res = await fetch("/api/inspections/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reportId,
          customerPhone,
          ownerPhone,
          refreshRavinInvite,
          sendSms,
        }),
      });
      const raw = await res.text();
      let data: {
        error?: string;
        inspectUrl?: string;
        internalInspectUrl?: string;
        provider?: "ravin" | "internal";
        smsSent?: boolean;
        smsSentToOwner?: boolean;
        smsSentToPurchaser?: boolean;
        smsError?: string | null;
        smsNotice?: string | null;
        ravinWarning?: string | null;
        ravinInviteUrl?: string | null;
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
      setInspectUrl(data.internalInspectUrl ?? data.inspectUrl ?? null);
      setRavinWarning(data.ravinWarning ?? null);
      setSmsError(data.smsError ?? null);
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
      void startInspection(false, false, true);
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
        <p className="text-sm font-medium text-emerald-400">
          Auto Verifi guided photo walkthrough — scan the QR code or open the link on the
          owner&apos;s phone to complete the AI condition scan.
        </p>

        <button
          type="button"
          onClick={openQrModal}
          disabled={loading}
          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-accent-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-accent-500 disabled:opacity-60"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          ) : inspectUrl ? (
            <QrCode className="h-4 w-4" aria-hidden />
          ) : (
            <Link2 className="h-4 w-4" aria-hidden />
          )}
          {loading ? "Preparing mobile link…" : "Click QR code for image capture link"}
        </button>

        {smsError && (
          <p className="mt-3 text-sm font-medium text-amber-400" role="alert">
            {smsError}
          </p>
        )}
        {ravinWarning && (
          <p className="mt-3 text-sm text-amber-300" role="alert">
            {ravinWarning}
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
