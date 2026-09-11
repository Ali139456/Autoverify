"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { Copy, Loader2, Send, Smartphone, X } from "lucide-react";

type InspectionQrModalProps = {
  open: boolean;
  inspectUrl: string;
  reportId: string;
  onClose: () => void;
};

function QrCodeImage({ value }: { value: string }) {
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    QRCode.toDataURL(value, {
      width: 240,
      margin: 2,
      color: { dark: "#0f172a", light: "#ffffff" },
    })
      .then((url) => {
        if (active) setSrc(url);
      })
      .catch(() => {
        if (active) setSrc(null);
      });

    return () => {
      active = false;
    };
  }, [value]);

  if (!src) {
    return (
      <div className="flex h-60 w-60 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" aria-hidden />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt="QR code to open the mobile condition check"
      className="h-60 w-60 rounded-2xl border border-slate-200 bg-white p-3"
    />
  );
}

export function InspectionQrModal({
  open,
  inspectUrl,
  reportId,
  onClose,
}: InspectionQrModalProps) {
  const [recipientPhone, setRecipientPhone] = useState("");
  const [showSmsForm, setShowSmsForm] = useState(false);
  const [smsLoading, setSmsLoading] = useState(false);
  const [smsSent, setSmsSent] = useState(false);
  const [smsError, setSmsError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!open) return;
    setShowSmsForm(false);
    setSmsSent(false);
    setSmsError(null);
    setCopied(false);
  }, [open, inspectUrl]);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  async function copyLink() {
    await navigator.clipboard.writeText(inspectUrl);
    setCopied(true);
  }

  async function sendToPhone() {
    setSmsLoading(true);
    setSmsError(null);
    setSmsSent(false);

    try {
      const res = await fetch("/api/inspections/send-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reportId,
          phone: recipientPhone,
          inspectUrl,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not send SMS.");
      setSmsSent(true);
    } catch (err) {
      setSmsError(err instanceof Error ? err.message : "Could not send SMS.");
    } finally {
      setSmsLoading(false);
    }
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-black/70 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="inspection-qr-title"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl sm:p-8"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          aria-label="Close"
        >
          <X className="h-5 w-5" aria-hidden />
        </button>

        <div className="flex flex-col items-center text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-50 text-accent-600">
            <Smartphone className="h-6 w-6" aria-hidden />
          </span>
          <h2
            id="inspection-qr-title"
            className="mt-4 text-xl font-bold text-slate-900 sm:text-2xl"
          >
            Continue on your mobile device
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Scan the QR code to complete the AI condition check for this vehicle.
          </p>

          <div className="mt-6">
            <QrCodeImage value={inspectUrl} />
          </div>

          <a
            href={inspectUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 text-sm font-semibold text-accent-600 hover:text-accent-700"
          >
            Open inspection on this device
          </a>

          <div className="mt-5 flex w-full flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={() => void copyLink()}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              <Copy className="h-4 w-4" aria-hidden />
              {copied ? "Link copied" : "Copy link"}
            </button>
            <button
              type="button"
              onClick={() => setShowSmsForm((value) => !value)}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-accent-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-accent-500"
            >
              <Send className="h-4 w-4" aria-hidden />
              Send to another phone
            </button>
          </div>
        </div>

        {showSmsForm && (
          <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <label className="block text-sm">
              <span className="mb-1.5 block font-medium text-slate-700">
                Send link to another mobile number
              </span>
              <input
                value={recipientPhone}
                onChange={(event) => setRecipientPhone(event.target.value)}
                placeholder="+61 4xx xxx xxx"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-accent-500"
              />
            </label>
            <p className="mt-2 text-xs text-slate-500">
              Useful if the car owner or another person will complete the photo walkaround.
            </p>
            <button
              type="button"
              onClick={() => void sendToPhone()}
              disabled={smsLoading || !recipientPhone.trim()}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-bold text-white transition hover:bg-slate-800 disabled:opacity-60"
            >
              {smsLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              ) : (
                <Send className="h-4 w-4" aria-hidden />
              )}
              {smsLoading ? "Sending…" : "Send SMS link"}
            </button>
            {smsSent && (
              <p className="mt-3 text-sm font-medium text-emerald-600">
                Inspection link sent by SMS.
              </p>
            )}
            {smsError && (
              <p className="mt-3 text-sm font-medium text-red-600" role="alert">
                {smsError}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
