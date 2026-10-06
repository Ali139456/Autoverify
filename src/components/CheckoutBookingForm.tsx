"use client";



import { useState } from "react";

import { PayButton } from "@/components/PayButton";

import { CheckoutPaymentConsent } from "@/components/CheckoutPaymentConsent";

import { PaymentTermsModal } from "@/components/PaymentTermsModal";

import { formatCents, getReportTierConfig } from "@/lib/pricing";
import { applyPercentDiscount, lookupPromoCode } from "@/lib/promo-codes";
import type { ReportTier } from "@/lib/types";



const inputClass =

  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-accent-500 dark:border-white/10 dark:bg-ink-950 dark:text-white dark:placeholder:text-slate-500";



const labelClass = "mb-1.5 block font-medium text-slate-700 dark:text-slate-300";

const BIRTH_MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

const dobSelectClass = `${inputClass} min-w-0 px-2.5 text-sm sm:px-4 sm:text-sm`;



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

  const [firstName, setFirstName] = useState("");

  const [lastName, setLastName] = useState("");

  const [customerEmail, setCustomerEmail] = useState("");

  const [postcode, setPostcode] = useState("");

  const [customerPhone, setCustomerPhone] = useState("");

  const [birthDay, setBirthDay] = useState("");

  const [birthMonth, setBirthMonth] = useState("");

  const [birthYear, setBirthYear] = useState("");

  const [odometer, setOdometer] = useState("");

  const [salePrice, setSalePrice] = useState("");

  const [ownerPhone, setOwnerPhone] = useState("");

  const [agreedTerms, setAgreedTerms] = useState(false);

  const [marketingOptIn, setMarketingOptIn] = useState(false);

  const [showTermsModal, setShowTermsModal] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [promoApplied, setPromoApplied] = useState<string | null>(null);

  const requiresPhones = tier === "insights_plus";
  const tierConfig = getReportTierConfig(tier);
  const activePromo = promoApplied ? lookupPromoCode(promoApplied) : null;
  const totalCents = activePromo
    ? applyPercentDiscount(tierConfig.priceCents, activePromo.percentOff)
    : tierConfig.priceCents;

  function applyPromoCode() {
    const match = lookupPromoCode(promoCode);
    if (!match) {
      setPromoApplied(null);
      return;
    }
    setPromoApplied(match.code);
    setPromoCode(match.code);
  }

  function onPostcodeChange(raw: string) {
    setPostcode(raw.replace(/\D/g, "").slice(0, 4));
  }

  const payLabel =
    totalCents <= 0
      ? "Confirm — Free report"
      : activePromo
        ? `Pay securely — ${formatCents(totalCents)}`
        : "Pay securely — Buy Report";



  return (

    <div className="scroll-mt-28 space-y-6">

      <div

        id="checkout-details"

        className="w-full min-w-0 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-ink-800 sm:p-8"

      >

        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white sm:text-xl">
            Enter details to begin purchase
          </h2>
          <p className="text-xs italic text-slate-500">* indicates required field</p>
        </div>



        <div className="mt-6 grid w-full min-w-0 gap-4 sm:grid-cols-2">

          <label className="block text-sm">

            <span className={labelClass}>First name *</span>

            <input

              id="av-given-name"

              name="given-name"

              value={firstName}

              onChange={(e) => setFirstName(e.target.value)}

              className={inputClass}

              required

              autoComplete="billing given-name"

            />

          </label>

          <label className="block text-sm">

            <span className={labelClass}>Last name *</span>

            <input

              id="av-family-name"

              name="family-name"

              value={lastName}

              onChange={(e) => setLastName(e.target.value)}

              className={inputClass}

              required

              autoComplete="billing family-name"

            />

          </label>

          <label className="block text-sm sm:col-span-2">

            <span className={labelClass}>Email address *</span>

            <input

              id="av-email"

              name="email"

              type="email"

              value={customerEmail}

              onChange={(e) => setCustomerEmail(e.target.value)}

              className={inputClass}

              required

              autoComplete="billing email"

            />

          </label>

          <label className="block text-sm">

            <span className={labelClass}>Postcode</span>

            <input

              id="av-postcode"

              name="postal-code"

              value={postcode}

              onChange={(e) => onPostcodeChange(e.target.value)}

              className={inputClass}

              inputMode="numeric"

              placeholder="2xxx"

              maxLength={4}

              pattern="[0-9]{4}"

              title="Australian postcode (4 digits)"

              autoComplete="billing postal-code"

            />

          </label>

          <label className="block text-sm">

            <span className={labelClass}>Phone number</span>

            <input

              id="av-phone"

              name="tel"

              type="tel"

              value={customerPhone}

              onChange={(e) => setCustomerPhone(e.target.value)}

              className={inputClass}

              placeholder="04xx xxx xxx"

              autoComplete="billing tel"

            />

          </label>

          <fieldset className="min-w-0 sm:col-span-2">

            <legend className={`${labelClass} text-sm`}>Date of birth *</legend>

            <div className="mt-1 grid w-full min-w-0 grid-cols-[minmax(0,4.5rem)_minmax(0,1fr)_minmax(0,5.25rem)] gap-2 sm:grid-cols-[minmax(0,5.25rem)_minmax(0,1fr)_minmax(0,6.25rem)] sm:gap-3">

              <select

                value={birthDay}

                onChange={(e) => setBirthDay(e.target.value)}

                className={dobSelectClass}

                required

                aria-label="Day of birth"

              >

                <option value="">Day</option>

                {Array.from({ length: 31 }, (_, i) => String(i + 1)).map((d) => (

                  <option key={d} value={d}>

                    {d}

                  </option>

                ))}

              </select>

              <select

                value={birthMonth}

                onChange={(e) => setBirthMonth(e.target.value)}

                className={dobSelectClass}

                required

                aria-label="Month of birth"

              >

                <option value="">Month</option>

                {BIRTH_MONTHS.map((m, i) => (

                  <option key={m} value={String(i + 1)}>

                    {m}

                  </option>

                ))}

              </select>

              <select

                value={birthYear}

                onChange={(e) => setBirthYear(e.target.value)}

                className={`${dobSelectClass} tabular-nums`}

                required

                aria-label="Year of birth"

              >

                <option value="">Year</option>

                {Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i).map(

                  (y) => (

                    <option key={y} value={String(y)}>

                      {y}

                    </option>

                  ),

                )}

              </select>

            </div>

          </fieldset>

        </div>



        <div className="mt-8 border-t border-slate-200 pt-6 dark:border-white/10">

          <h3 className="font-bold text-slate-900 dark:text-white">

            Please enter more details about your car

          </h3>

          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">

            Complete these details to receive an odometer and price comparison.

          </p>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">

            <label className="block text-sm">

              <span className={labelClass}>Odometer reading (km) *</span>

              <input

                value={odometer}

                onChange={(e) => setOdometer(e.target.value.replace(/\D/g, ""))}

                className={inputClass}

                inputMode="numeric"

                required

              />

            </label>

            <label className="block text-sm">

              <span className={labelClass}>Sale price *</span>

              <div className="relative">

                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">

                  $

                </span>

                <input

                  value={salePrice}

                  onChange={(e) => setSalePrice(e.target.value.replace(/\D/g, ""))}

                  className={`${inputClass} pl-8`}

                  inputMode="numeric"

                  required

                />

              </div>

            </label>

          </div>

        </div>



        {requiresPhones ? (

          <div className="mt-6 space-y-4 border-t border-slate-200 pt-6 dark:border-white/10">

            <label className="block text-sm">

              <span className={labelClass}>Your mobile number *</span>

              <input

                type="tel"

                value={customerPhone}

                onChange={(e) => setCustomerPhone(e.target.value)}

                className={inputClass}

                placeholder="04xx xxx xxx"

              />

            </label>

            <label className="block text-sm">

              <span className={labelClass}>Vehicle owner&apos;s mobile number *</span>

              <input

                type="tel"

                value={ownerPhone}

                onChange={(e) => setOwnerPhone(e.target.value)}

                className={inputClass}

                placeholder="04xx xxx xxx"

              />

            </label>

            <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">

              After you pay, we send the owner an SMS with the mobile inspection link

              (Insights+ only). If the text does not arrive, use the QR code on your

              report to open or resend the link.

            </p>

          </div>

        ) : null}

      </div>



      <div

        id="booking-payment"

        className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-ink-800 sm:p-8"

      >

        <h2 className="text-lg font-bold text-slate-900 dark:text-white sm:text-xl">
          Pay and confirm
        </h2>

        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">

          After payment, your full vehicle report opens immediately and we email your

          receipt and report link.
          {requiresPhones
            ? " The owner inspection SMS is sent when that report page loads."
            : null}

        </p>

        <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-ink-950/60 sm:p-5">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Order summary
          </p>
          <div className="mt-3 space-y-2 text-sm">
            <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
              <span className="min-w-0 flex-1 font-medium text-slate-800 dark:text-slate-200">
                {tierConfig.name}
              </span>
              <span className="shrink-0 font-semibold text-slate-900 dark:text-white">
                {activePromo ? (
                  <>
                    <span className="mr-2 text-slate-400 line-through">
                      {formatCents(tierConfig.priceCents)}
                    </span>
                    {formatCents(totalCents)}
                  </>
                ) : (
                  formatCents(tierConfig.priceCents)
                )}
              </span>
            </div>
            {activePromo ? (
              <p className="text-xs font-medium text-accent-600 dark:text-accent-400">
                Code {activePromo.code} applied ({activePromo.label}, incl. GST)
              </p>
            ) : null}
          </div>

          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-end">
            <label className="block min-w-0 flex-1 text-sm">
              <span className={labelClass}>Discount code</span>
              <input
                value={promoCode}
                onChange={(e) => {
                  setPromoCode(e.target.value.toUpperCase());
                  setPromoApplied(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    applyPromoCode();
                  }
                }}
                className={inputClass}
                placeholder="Enter discount code"
                autoComplete="off"
                spellCheck={false}
              />
            </label>
            <button
              type="button"
              onClick={applyPromoCode}
              className="shrink-0 rounded-xl border border-accent-500 bg-white px-4 py-3 text-sm font-bold text-accent-600 transition hover:bg-accent-50 dark:border-accent-400 dark:bg-ink-900 dark:text-accent-300 dark:hover:bg-accent-500/10 sm:py-3"
            >
              Apply
            </button>
          </div>
          {promoCode.trim() && !activePromo && promoCode.length >= 4 ? (
            <p className="mt-2 text-xs text-amber-700 dark:text-amber-400">
              Tap Apply to validate your code, or continue without a discount.
            </p>
          ) : null}
        </div>

        <div className="mt-6 space-y-5">

          <CheckoutPaymentConsent

            agreedTerms={agreedTerms}

            onAgreedTermsChange={setAgreedTerms}

            marketingOptIn={marketingOptIn}

            onMarketingOptInChange={setMarketingOptIn}

          />

          <PayButton

            identifier={identifier}

            state={state}

            isVin={isVin}

            tier={tier}

            label={payLabel}

            customerEmail={customerEmail}

            customerFirstName={firstName}

            customerLastName={lastName}

            customerPostcode={postcode}

            customerPhone={requiresPhones ? customerPhone : customerPhone || undefined}

            ownerPhone={requiresPhones ? ownerPhone : undefined}

            customerBirthDate={

              birthDay && birthMonth && birthYear

                ? `${birthYear}-${birthMonth.padStart(2, "0")}-${birthDay.padStart(2, "0")}`

                : undefined

            }

            customerOdometer={odometer ? Number(odometer) : undefined}

            advertisedPrice={salePrice ? Number(salePrice) : undefined}

            agreedTerms={agreedTerms}

            marketingOptIn={marketingOptIn}

            onTermsBlocked={() => setShowTermsModal(true)}

            validateCustomerDetails

            promoCode={promoApplied ?? undefined}

          />

        </div>



        <PaymentTermsModal

          open={showTermsModal}

          onClose={() => setShowTermsModal(false)}

        />

      </div>

    </div>

  );

}


