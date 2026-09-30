"use client";

import Link from "next/link";
import { MARKETING_CONSENT_TEXT, TERMS_PAGE_TITLE } from "@/content/terms-of-use";

const checkboxClass =
  "mt-1 h-4 w-4 shrink-0 rounded border-slate-300 text-[#0073E3] focus:ring-[#0073E3]";

export function CheckoutPaymentConsent({
  agreedTerms,
  onAgreedTermsChange,
  marketingOptIn,
  onMarketingOptInChange,
}: {
  agreedTerms: boolean;
  onAgreedTermsChange: (value: boolean) => void;
  marketingOptIn: boolean;
  onMarketingOptInChange: (value: boolean) => void;
}) {
  return (
    <div className="space-y-4 rounded-xl border border-slate-200 bg-slate-50/80 p-4 dark:border-white/10 dark:bg-ink-950/40">
      <label className="flex cursor-pointer items-start gap-3 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
        <input
          type="checkbox"
          className={checkboxClass}
          checked={agreedTerms}
          onChange={(event) => onAgreedTermsChange(event.target.checked)}
          required
        />
        <span>
          I have read and agree to the{" "}
          <Link
            href="/terms"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-[#0073E3] underline-offset-2 hover:underline dark:text-[#4da3ff]"
          >
            terms and conditions
          </Link>
          {" "}
          ({TERMS_PAGE_TITLE}).
        </span>
      </label>

      <label className="flex cursor-pointer items-start gap-3 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
        <input
          type="checkbox"
          className={checkboxClass}
          checked={marketingOptIn}
          onChange={(event) => onMarketingOptInChange(event.target.checked)}
        />
        <span>{MARKETING_CONSENT_TEXT}</span>
      </label>

      <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">
        By clicking confirm below, you will be redirected to our secure Stripe
        payment page to complete your purchase. Stripe processes card payments
        in accordance with its own terms and privacy policy.
      </p>
    </div>
  );
}
