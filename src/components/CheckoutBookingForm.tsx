"use client";

import { useState } from "react";
import { PayButton } from "@/components/PayButton";
import type { ReportTier } from "@/lib/types";

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-accent-500 dark:border-white/10 dark:bg-ink-950 dark:text-white dark:placeholder:text-slate-500";

export function CheckoutBookingForm({
  identifier,
  state,
  isVin,
  tier,
}: {
  identifier: string;
  state?: string;
  isVin?: boolean;
  tier: ReportTier;
}) {
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [ownerPhone, setOwnerPhone] = useState("");
  const requiresPhones = tier === "insights_plus";

  return (
    <div
      id="booking-payment"
      className="scroll-mt-28 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-ink-800 sm:p-8"
    >
      <h2 className="text-lg font-bold text-slate-900 dark:text-white sm:text-xl">
        Booking &amp; payment
      </h2>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
        Enter your details below. After payment, your full vehicle report opens
        immediately and we email your receipt and report link.
      </p>

      <div className="mt-6 space-y-4">
        <label className="block text-sm">
          <span className="mb-1.5 block font-medium text-slate-700 dark:text-slate-300">
            Email address
          </span>
          <input
            type="email"
            inputMode="email"
            autoComplete="email"
            value={customerEmail}
            onChange={(event) => setCustomerEmail(event.target.value)}
            placeholder="you@example.com"
            className={inputClass}
            required
          />
        </label>

        {requiresPhones && (
          <>
            <label className="block text-sm">
              <span className="mb-1.5 block font-medium text-slate-700 dark:text-slate-300">
                Your mobile number
              </span>
              <input
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                value={customerPhone}
                onChange={(event) => setCustomerPhone(event.target.value)}
                placeholder="04xx xxx xxx"
                className={inputClass}
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1.5 block font-medium text-slate-700 dark:text-slate-300">
                Vehicle owner&apos;s mobile number
              </span>
              <input
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                value={ownerPhone}
                onChange={(event) => setOwnerPhone(event.target.value)}
                placeholder="04xx xxx xxx"
                className={inputClass}
              />
            </label>
            <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">
              The vehicle owner will receive an SMS link to complete the Ravin AI
              photo walkaround and damage detection.
            </p>
          </>
        )}
      </div>

      <div className="mt-6">
        <PayButton
          identifier={identifier}
          state={state}
          isVin={isVin}
          tier={tier}
          label={
            requiresPhones ? "Pay securely — Insights+" : "Pay securely — Insights"
          }
          customerEmail={customerEmail}
          customerPhone={requiresPhones ? customerPhone : undefined}
          ownerPhone={requiresPhones ? ownerPhone : undefined}
        />
      </div>
    </div>
  );
}
