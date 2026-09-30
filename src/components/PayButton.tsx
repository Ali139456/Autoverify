"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Lock } from "lucide-react";
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
  agreedTerms = true,
  marketingOptIn = false,
  onTermsBlocked,
  validateCustomerDetails = false,
  customerFirstName,
  customerLastName,
  customerPostcode,
  customerBirthDate,
  customerOdometer,
  advertisedPrice,
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
  agreedTerms?: boolean;
  marketingOptIn?: boolean;
  onTermsBlocked?: () => void;
  validateCustomerDetails?: boolean;
  customerFirstName?: string;
  customerLastName?: string;
  customerPostcode?: string;
  customerBirthDate?: string;
  customerOdometer?: number;
  advertisedPrice?: number;
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

    if (!agreedTerms) {
      setError("Please read and agree to the terms and conditions to continue.");
      onTermsBlocked?.();
      setLoading(false);
      return;
    }

    if (validateCustomerDetails) {
      if (!customerFirstName?.trim() || !customerLastName?.trim()) {
        setError("Please enter your first and last name.");
        setLoading(false);
        return;
      }
      if (!customerBirthDate) {
        setError("Please enter your date of birth.");
        setLoading(false);
        return;
      }
      if (!customerOdometer || customerOdometer <= 0) {
        setError("Please enter the vehicle odometer reading.");
        setLoading(false);
        return;
      }
      if (!advertisedPrice || advertisedPrice <= 0) {
        setError("Please enter the sale price.");
        setLoading(false);
        return;
      }
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
          customerFirstName: customerFirstName?.trim(),
          customerLastName: customerLastName?.trim(),
          customerPostcode: customerPostcode?.trim(),
          customerBirthDate,
          customerOdometer,
          advertisedPrice,
          customerPhone: customerPhone || undefined,
          ownerPhone: requiresPhones ? ownerPhone : undefined,
          agreedTerms: true,
          marketingOptIn,
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
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#0073E3] px-8 py-4 text-lg font-bold text-white shadow-md transition hover:bg-[#005bb5] disabled:opacity-60"
      >
        {loading ? (
          <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
        ) : (
          <Lock className="h-5 w-5" aria-hidden />
        )}
        {loading ? "Preparing secure checkout…" : label}
      </button>
      {error && (
        <p className="mt-2 text-center text-sm font-medium text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
