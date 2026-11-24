"use client";

import { useMemo, useState } from "react";
import {
  isSydneyMetroPostcode,
  PPI_PRICE_INC_GST,
} from "@/lib/pre-purchase/parse-booking-body";
import {
  listPriceForPpiVehicleCategory,
  normalizePpiVehicleCategory,
  type PpiVehicleCategory,
} from "@/lib/pre-purchase/vehicle-pricing";

const AU_STATES = ["NSW", "VIC", "QLD", "WA", "SA", "TAS", "ACT", "NT"] as const;

const VEHICLE_CATEGORY_OPTIONS: { value: PpiVehicleCategory; label: string }[] =
  [
    { value: "passenger", label: "Passenger car / SUV ($290)" },
    { value: "commercial", label: "Ute, van or 4WD ($290)" },
    { value: "ev", label: "EV or hybrid ($290)" },
    { value: "caravan", label: "Caravan / trailer ($390)" },
    { value: "motorcycle", label: "Motorcycle ($190)" },
  ];

type PrePurchaseBookingFormProps = {
  variant?: "light" | "dark";
  cancelReturnPath?: string;
  showVehicleCategory?: boolean;
  defaultVehicleCategory?: PpiVehicleCategory;
};

export function PrePurchaseBookingForm({
  variant = "light",
  cancelReturnPath,
  showVehicleCategory = false,
  defaultVehicleCategory = "passenger",
}: PrePurchaseBookingFormProps = {}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [vehicleCategory, setVehicleCategory] = useState<PpiVehicleCategory>(
    defaultVehicleCategory,
  );

  const listPrice = useMemo(
    () => listPriceForPpiVehicleCategory(vehicleCategory),
    [vehicleCategory],
  );

  const dark = variant === "dark";
  const fieldClass = dark
    ? "mt-1 w-full rounded-lg border border-white/15 bg-[#0c1528] px-3 py-2 text-sm text-white placeholder:text-slate-500"
    : "mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-ink-950";
  const labelClass = dark
    ? "text-xs font-semibold text-slate-300"
    : "text-xs font-semibold text-slate-600";
  const legendClass = dark
    ? "col-span-full text-sm font-bold text-white"
    : "col-span-full text-sm font-bold text-slate-900 dark:text-white";

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setBusy(true);
    const form = e.currentTarget;
    const data = new FormData(form);
    const body = Object.fromEntries(data.entries()) as Record<string, FormDataEntryValue>;
    body.vehicleCategory = normalizePpiVehicleCategory(
      body.vehicleCategory ?? vehicleCategory,
    );
    if (cancelReturnPath) {
      body.cancelReturnPath = cancelReturnPath;
    }
    const postcode = String(body.postcode ?? "").trim();
    if (!isSydneyMetroPostcode(postcode)) {
      setError(
        "Use a 4-digit Sydney metro postcode between 2000 and 2234 (e.g. Mosman 2088).",
      );
      setBusy(false);
      return;
    }

    try {
      const res = await fetch("/api/inspections/pre-purchase/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body as Record<string, string>),
      });
      const json = (await res.json()) as {
        error?: string;
        checkoutUrl?: string;
        successUrl?: string;
        message?: string;
        bookingRef?: string;
      };
      if (!res.ok) {
        setError(json.error ?? "Booking failed.");
        return;
      }
      if (json.successUrl) {
        window.location.href = json.successUrl;
        return;
      }
      if (json.checkoutUrl) {
        window.location.href = json.checkoutUrl;
        return;
      }
      setMessage(
        json.message ??
          `Booking ${json.bookingRef ?? ""} received. We'll confirm by email.`,
      );
      form.reset();
    } catch {
      setError("Network error — try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form
      id="book"
      onSubmit={onSubmit}
      className={
        dark
          ? "ppi-form ppi-form-dark mx-auto max-w-2xl space-y-6 rounded-2xl border border-white/10 bg-[#0a1122] p-6 shadow-xl shadow-black/30 [&_input]:border-white/15 [&_input]:bg-[#0c1528] [&_input]:text-white [&_legend]:text-white [&_select]:border-white/15 [&_select]:bg-[#0c1528] [&_select]:text-white [&_span]:text-slate-300 [&_textarea]:border-white/15 [&_textarea]:bg-[#0c1528] [&_textarea]:text-white"
          : "ppi-form mx-auto max-w-2xl space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-ink-900"
      }
    >
      <div>
        <h2
          className={
            dark
              ? "text-2xl font-bold text-white"
              : "text-2xl font-bold text-slate-900 dark:text-white"
          }
        >
          Book a pre-purchase inspection
        </h2>
        <p
          className={
            dark
              ? "mt-2 text-sm text-slate-400"
              : "mt-2 text-sm text-slate-600 dark:text-slate-400"
          }
        >
          Mobile inspection at the seller&apos;s location.{" "}
          <strong className={dark ? "text-white" : ""}>
            ${showVehicleCategory ? listPrice : PPI_PRICE_INC_GST}
          </strong>{" "}
          inc GST.
        </p>
      </div>

      {showVehicleCategory ? (
        <label className="block">
          <span className={labelClass}>Inspection type</span>
          <select
            name="vehicleCategory"
            value={vehicleCategory}
            onChange={(e) =>
              setVehicleCategory(
                normalizePpiVehicleCategory(e.target.value),
              )
            }
            className={fieldClass}
          >
            {VEHICLE_CATEGORY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>
      ) : (
        <input type="hidden" name="vehicleCategory" value="passenger" />
      )}

      <fieldset className="grid gap-4 sm:grid-cols-2">
        <legend className="col-span-full text-sm font-bold text-slate-900 dark:text-white">
          Your details
        </legend>
        <label className="block sm:col-span-2">
          <span className="text-xs font-semibold text-slate-600">Full name</span>
          <input
            required
            name="contactName"
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-ink-950"
          />
        </label>
        <label className="block">
          <span className="text-xs font-semibold text-slate-600">Email</span>
          <input
            required
            type="email"
            name="contactEmail"
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-ink-950"
          />
        </label>
        <label className="block">
          <span className="text-xs font-semibold text-slate-600">Mobile</span>
          <input
            required
            name="contactPhone"
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-ink-950"
          />
        </label>
      </fieldset>

      <fieldset className="grid gap-4 sm:grid-cols-2">
        <legend className="col-span-full text-sm font-bold text-slate-900 dark:text-white">
          Inspection location
        </legend>
        <label className="block sm:col-span-2">
          <span className="text-xs font-semibold text-slate-600">Street address</span>
          <input
            name="addressLine"
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-ink-950"
          />
        </label>
        <label className="block">
          <span className="text-xs font-semibold text-slate-600">Suburb</span>
          <input
            required
            name="suburb"
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-ink-950"
          />
        </label>
        <label className="block">
          <span className="text-xs font-semibold text-slate-600">Postcode (NSW 2000–2234)</span>
          <input
            required
            name="postcode"
            type="text"
            inputMode="numeric"
            autoComplete="postal-code"
            maxLength={4}
            placeholder="2088"
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-ink-950"
          />
        </label>
        <label className="block sm:col-span-2">
          <span className="text-xs font-semibold text-slate-600">Access / parking notes</span>
          <textarea
            name="accessNotes"
            rows={2}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-ink-950"
          />
        </label>
        <label className="block sm:col-span-2">
          <span className="text-xs font-semibold text-slate-600">
            Preferred date &amp; time
          </span>
          <input
            name="preferredWhen"
            placeholder="e.g. Weekday after 3pm"
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-ink-950"
          />
        </label>
      </fieldset>

      <fieldset className="grid gap-4 sm:grid-cols-2">
        <legend className="col-span-full text-sm font-bold text-slate-900 dark:text-white">
          Vehicle
        </legend>
        <label className="block">
          <span className="text-xs font-semibold text-slate-600">Year</span>
          <input
            required
            name="vehicleYear"
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-ink-950"
          />
        </label>
        <label className="block">
          <span className="text-xs font-semibold text-slate-600">Make</span>
          <input
            required
            name="vehicleMake"
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-ink-950"
          />
        </label>
        <label className="block sm:col-span-2">
          <span className="text-xs font-semibold text-slate-600">Model</span>
          <input
            required
            name="vehicleModel"
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-ink-950"
          />
        </label>
        <label className="block">
          <span className="text-xs font-semibold text-slate-600">Registration</span>
          <input
            name="vehicleRego"
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-ink-950"
          />
        </label>
        <label className="block">
          <span className="text-xs font-semibold text-slate-600">State</span>
          <select
            name="vehicleState"
            defaultValue="NSW"
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-ink-950"
          >
            {AU_STATES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
        <label className="block sm:col-span-2">
          <span className="text-xs font-semibold text-slate-600">VIN (if no rego yet)</span>
          <input
            name="vehicleVin"
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-ink-950"
          />
        </label>
      </fieldset>

      <label className="block">
        <span className="text-xs font-semibold text-slate-600">
          Discount code (optional)
        </span>
        <input
          name="promoCode"
          autoComplete="off"
          placeholder="e.g. AVFREE"
          className="mt-1 w-full max-w-xs rounded-lg border border-slate-300 px-3 py-2 text-sm uppercase dark:border-slate-600 dark:bg-ink-950"
        />
      </label>

      {error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </p>
      ) : null}
      {message ? (
        <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
          {message}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={busy}
        className="w-full rounded-lg bg-accent-500 px-4 py-3 text-sm font-bold text-white transition hover:bg-accent-600 disabled:opacity-60"
      >
        {busy ? "Submitting…" : "Book Pre Purchase Inspection"}
      </button>
    </form>
  );
}
