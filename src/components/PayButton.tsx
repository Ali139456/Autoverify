"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CreditCard, Loader2 } from "lucide-react";
import { isValidAuMobile } from "@/lib/phone";
import type { ReportTier } from "@/lib/types";

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export function PayButton({
  identifier,
  rego,
  state,
  isVin = false,
  tier,
  label,
  customerEmail: customerEmailProp,
  customerPhone: customerPhoneProp,
  ownerPhone: ownerPhoneProp,
  requireEmail = true,
}: {
  identifier?: string;
  /** @deprecated Use `identifier` instead. */
  rego?: string;
  state?: string;
  isVin?: boolean;
  tier: ReportTier;
  label: string;
  customerEmail?: string;
  customerPhone?: string;
  ownerPhone?: string;
  requireEmail?: boolean;
}) {
  const vehicleId = identifier ?? rego ?? "";
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requiresPhones = tier === "insights_plus";

  async function pay() {
    setLoading(true);
    setError(null);

    const customerEmail = customerEmailProp?.trim() ?? "";
    const customerPhone = customerPhoneProp?.trim() ?? "";
    const ownerPhone = ownerPhoneProp?.trim() ?? "";

    if (requireEmail && !isValidEmail(customerEmail)) {
      setError("Please enter a valid email address.");
      setLoading(false);
      return;
    }

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
          rego: isVin ? undefined : vehicleId,
          vin: isVin ? vehicleId : undefined,
          state,
          tier,
          customerEmail: customerEmail || undefined,
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
