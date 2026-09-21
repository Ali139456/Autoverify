"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CreditCard, Loader2 } from "lucide-react";
import { isValidAuMobile } from "@/lib/phone";
import type { ReportTier } from "@/lib/types";

const phoneInputClass =
  "w-full rounded-xl border border-white/10 bg-ink-950/80 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-accent-500";

export function PayButton({
  rego,
  state,
  tier,
  label,
}: {
  rego: string;
  state: string;
  tier: ReportTier;
  label: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [customerPhone, setCustomerPhone] = useState("");
  const [ownerPhone, setOwnerPhone] = useState("");
  const requiresPhones = tier === "insights_plus";

  async function pay() {
    setLoading(true);
    setError(null);

    if (requiresPhones) {
      if (!isValidAuMobile(customerPhone)) {
        setError("Please enter a valid customer mobile number.");
        setLoading(false);
        return;
      }
      if (!isValidAuMobile(ownerPhone)) {
        setError("Please enter a valid vehicle owner mobile number.");
        setLoading(false);
        return;
      }
    }

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rego,
          state,
          tier,
          customerPhone: requiresPhones ? customerPhone : undefined,
          ownerPhone: requiresPhones ? ownerPhone : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Checkout failed.");
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
    <div className="w-full">
      {requiresPhones && (
        <div className="mb-4 space-y-3 text-left">
          <label className="block text-sm">
            <span className="mb-1.5 block font-medium text-slate-300">
              Your mobile number
            </span>
            <input
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              value={customerPhone}
              onChange={(event) => setCustomerPhone(event.target.value)}
              placeholder="04xx xxx xxx"
              className={phoneInputClass}
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1.5 block font-medium text-slate-300">
              Vehicle owner&apos;s mobile number
            </span>
            <input
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              value={ownerPhone}
              onChange={(event) => setOwnerPhone(event.target.value)}
              placeholder="04xx xxx xxx"
              className={phoneInputClass}
            />
          </label>
          <p className="text-xs leading-relaxed text-slate-500">
            The vehicle owner will receive an SMS link to complete the Ravin AI
            photo walkaround and damage detection.
          </p>
        </div>
      )}

      <button
        onClick={pay}
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-accent-600 px-8 py-4 text-lg font-bold text-white transition hover:bg-accent-500 disabled:opacity-60"
      >
        {loading ? (
          <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
        ) : (
          <CreditCard className="h-5 w-5" aria-hidden />
        )}
        {loading ? "Preparing secure checkout…" : label}
      </button>
      {error && (
        <p className="mt-2 text-center text-sm font-medium text-red-400" role="alert">
          {error}
        </p>
      )}
      <p className="mt-3 text-center text-xs text-slate-500">
        Secure payment powered by Stripe. No account required.
      </p>
    </div>
  );
}
