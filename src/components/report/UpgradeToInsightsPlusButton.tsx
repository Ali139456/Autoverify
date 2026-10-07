"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Loader2, Lock, Sparkles, X } from "lucide-react";
import { isValidAuMobile } from "@/lib/phone";

const INPUT_CLASS =
  "mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#0073E3] focus:ring-2 focus:ring-[#0073E3]/20";

export function UpgradeToInsightsPlusButton({
  reportId,
  vehicleTitle,
  upgradePriceLabel,
  defaultCustomerPhone,
  defaultOwnerPhone,
}: {
  reportId: string;
  vehicleTitle: string;
  upgradePriceLabel: string;
  defaultCustomerPhone?: string | null;
  defaultOwnerPhone?: string | null;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [customerPhone, setCustomerPhone] = useState(defaultCustomerPhone ?? "");
  const [ownerPhone, setOwnerPhone] = useState(defaultOwnerPhone ?? "");
  const [promoCode, setPromoCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  async function pay() {
    setError(null);
    if (!isValidAuMobile(customerPhone)) {
      setError("Please enter a valid mobile number for yourself.");
      return;
    }
    if (!isValidAuMobile(ownerPhone)) {
      setError("Please enter a valid mobile number for the vehicle owner.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/checkout/upgrade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reportId,
          customerPhone: customerPhone.trim(),
          ownerPhone: ownerPhone.trim(),
          promoCode: promoCode.trim() || undefined,
          agreedTerms: true,
        }),
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) {
        throw new Error(data.error ?? "Checkout failed.");
      }
      if (data.url.startsWith("/")) {
        router.push(data.url);
      } else {
        window.location.href = data.url;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Checkout failed.");
      setLoading(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="report-no-print-link inline-flex shrink-0 items-center gap-2 rounded-full bg-[#0073E3] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#0062c2]"
      >
        Upgrade to Insights+
        <ChevronRight className="h-4 w-4" aria-hidden />
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 px-4 py-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="upgrade-insights-plus-title"
          onClick={() => !loading && setOpen(false)}
        >
          <div
            className="relative w-full max-w-md rounded-3xl bg-white p-6 text-left shadow-2xl sm:p-8"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setOpen(false)}
              disabled={loading}
              className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              aria-label="Close"
            >
              <X className="h-5 w-5" aria-hidden />
            </button>

            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0073E3]/10 text-[#0073E3]">
              <Sparkles className="h-6 w-6" aria-hidden />
            </span>
            <h2
              id="upgrade-insights-plus-title"
              className="mt-4 text-xl font-bold text-slate-900 sm:text-2xl"
            >
              Upgrade report to Auto Verifi Insights+
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              {vehicleTitle}. Your details from this report are kept — we only need
              the mobile numbers for the AI condition scan.
            </p>

            <div className="mt-5 space-y-4">
              <label className="block text-sm">
                <span className="font-semibold text-slate-700">Your mobile number *</span>
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(event) => setCustomerPhone(event.target.value)}
                  className={INPUT_CLASS}
                  placeholder="04xx xxx xxx"
                  autoComplete="tel"
                />
              </label>
              <label className="block text-sm">
                <span className="font-semibold text-slate-700">
                  Vehicle owner&apos;s mobile number *
                </span>
                <input
                  type="tel"
                  value={ownerPhone}
                  onChange={(event) => setOwnerPhone(event.target.value)}
                  className={INPUT_CLASS}
                  placeholder="04xx xxx xxx"
                />
                <span className="mt-1 block text-xs text-slate-500">
                  The owner receives the guided photo inspection link by SMS. Use your
                  own number if you have the vehicle with you.
                </span>
              </label>
              <label className="block text-sm">
                <span className="font-semibold text-slate-700">Discount code</span>
                <input
                  type="text"
                  value={promoCode}
                  onChange={(event) => setPromoCode(event.target.value)}
                  className={INPUT_CLASS}
                  placeholder="Optional"
                  autoComplete="off"
                />
              </label>
            </div>

            <div className="mt-5 flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm">
              <span className="font-semibold text-slate-700">Upgrade to Insights+</span>
              <span className="text-base font-extrabold text-[#0073E3]">
                {upgradePriceLabel}
              </span>
            </div>

            {error ? (
              <p className="mt-3 text-sm font-medium text-red-600" role="alert">
                {error}
              </p>
            ) : null}

            <button
              type="button"
              onClick={() => void pay()}
              disabled={loading}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#0073E3] px-6 py-3.5 text-base font-bold text-white shadow-md transition hover:bg-[#005bb5] disabled:opacity-60"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
              ) : (
                <Lock className="h-5 w-5" aria-hidden />
              )}
              {loading ? "Preparing secure checkout…" : "Pay and upgrade"}
            </button>
            <p className="mt-3 text-center text-xs text-slate-500">
              By continuing you agree to the{" "}
              <Link href="/terms" className="underline underline-offset-2">
                Terms and Conditions
              </Link>
              .
            </p>
          </div>
        </div>
      ) : null}
    </>
  );
}
