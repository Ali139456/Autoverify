"use client";

import { useState } from "react";
import { PPI_PRICE_INC_GST } from "@/lib/pre-purchase/parse-booking-body";

const AU_STATES = ["NSW", "VIC", "QLD", "WA", "SA", "TAS", "ACT", "NT"] as const;

export function PrePurchaseBookingForm() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setBusy(true);
    const form = e.currentTarget;
    const data = new FormData(form);
    const body = Object.fromEntries(data.entries());

    try {
      const res = await fetch("/api/inspections/pre-purchase/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = (await res.json()) as {
        error?: string;
        checkoutUrl?: string;
        message?: string;
        bookingRef?: string;
      };
      if (!res.ok) {
        setError(json.error ?? "Booking failed.");
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
      className="ppi-form mx-auto max-w-2xl space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-ink-900"
    >
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-accent-500">
          Sydney metro only (launching wider soon)
        </p>
        <h2 className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
          Book a pre-purchase inspection
        </h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          Mobile inspection at the seller&apos;s location.{" "}
          <strong>${PPI_PRICE_INC_GST}</strong> inc GST.
        </p>
      </div>

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
            pattern="2\\d{3}"
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
        {busy ? "Submitting…" : `Pay $${PPI_PRICE_INC_GST} and book`}
      </button>
    </form>
  );
}
