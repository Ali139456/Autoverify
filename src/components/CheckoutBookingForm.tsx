"use client";



import { useState } from "react";

import { PayButton } from "@/components/PayButton";

import { CheckoutPaymentConsent } from "@/components/CheckoutPaymentConsent";

import { PaymentTermsModal } from "@/components/PaymentTermsModal";

import type { ReportTier } from "@/lib/types";



const inputClass =

  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-accent-500 dark:border-white/10 dark:bg-ink-950 dark:text-white dark:placeholder:text-slate-500";



const labelClass = "mb-1.5 block font-medium text-slate-700 dark:text-slate-300";



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

  const requiresPhones = tier === "insights_plus";



  const payLabel = "Pay securely — Buy Report";



  return (

    <div className="scroll-mt-28 space-y-6">

      <div

        id="checkout-details"

        className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-ink-800 sm:p-8"

      >

        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white sm:text-xl">
            Enter details to begin purchase
          </h2>
          <p className="text-xs italic text-slate-500">* indicates required field</p>
        </div>



        <div className="mt-6 grid gap-4 sm:grid-cols-2">

          <label className="block text-sm">

            <span className={labelClass}>First name *</span>

            <input

              value={firstName}

              onChange={(e) => setFirstName(e.target.value)}

              className={inputClass}

              required

              autoComplete="given-name"

            />

          </label>

          <label className="block text-sm">

            <span className={labelClass}>Last name *</span>

            <input

              value={lastName}

              onChange={(e) => setLastName(e.target.value)}

              className={inputClass}

              required

              autoComplete="family-name"

            />

          </label>

          <label className="block text-sm sm:col-span-2">

            <span className={labelClass}>Email address *</span>

            <input

              type="email"

              value={customerEmail}

              onChange={(e) => setCustomerEmail(e.target.value)}

              className={inputClass}

              required

              autoComplete="email"

            />

          </label>

          <label className="block text-sm">

            <span className={labelClass}>Postcode</span>

            <input

              value={postcode}

              onChange={(e) => setPostcode(e.target.value)}

              className={inputClass}

              inputMode="numeric"

              autoComplete="postal-code"

            />

          </label>

          <label className="block text-sm">

            <span className={labelClass}>Phone number</span>

            <input

              type="tel"

              value={customerPhone}

              onChange={(e) => setCustomerPhone(e.target.value)}

              className={inputClass}

              placeholder="04xx xxx xxx"

              autoComplete="tel"

            />

          </label>

          <fieldset className="sm:col-span-2">

            <legend className={`${labelClass} text-sm`}>Date of birth *</legend>

            <div className="mt-1 grid grid-cols-3 gap-2">

              <select

                value={birthDay}

                onChange={(e) => setBirthDay(e.target.value)}

                className={inputClass}

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

                className={inputClass}

                required

                aria-label="Month of birth"

              >

                <option value="">Month</option>

                {[

                  "January",

                  "February",

                  "March",

                  "April",

                  "May",

                  "June",

                  "July",

                  "August",

                  "September",

                  "October",

                  "November",

                  "December",

                ].map((m, i) => (

                  <option key={m} value={String(i + 1)}>

                    {m}

                  </option>

                ))}

              </select>

              <select

                value={birthYear}

                onChange={(e) => setBirthYear(e.target.value)}

                className={inputClass}

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

              The vehicle owner will receive an SMS link to complete the guided photo

              condition scan.

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

        </p>



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


