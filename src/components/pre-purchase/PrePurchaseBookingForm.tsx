"use client";

import { ArrowRight } from "lucide-react";
import { useState } from "react";
import {
  normalizePpiVehicleCategory,
  type PpiVehicleCategory,
} from "@/lib/pre-purchase/vehicle-pricing";
import { SYDNEY_PPI_SERVICES } from "@/lib/pre-purchase/sydney-ppi-services";

const SELLER_OPTIONS = [
  { value: "private", label: "Private seller" },
  { value: "dealer", label: "Dealer" },
  { value: "auction", label: "Auction" },
  { value: "unknown", label: "Not sure" },
] as const;

type PrePurchaseBookingFormProps = {
  variant?: "light" | "dark";
  cancelReturnPath?: string;
  /** Quote-first flow (no Stripe on submit). */
  requestFlow?: boolean;
  showVehicleCategory?: boolean;
  defaultVehicleCategory?: PpiVehicleCategory;
};

export function PrePurchaseBookingForm({
  variant = "light",
  cancelReturnPath,
  requestFlow = false,
  showVehicleCategory = true,
  defaultVehicleCategory = "passenger",
}: PrePurchaseBookingFormProps = {}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [vehicleCategory, setVehicleCategory] = useState<PpiVehicleCategory>(
    defaultVehicleCategory,
  );

  const dark = variant === "dark";
  const fieldClass = dark
    ? "mt-1.5 w-full rounded-lg border border-white/15 bg-[#0c1528] px-3 py-2.5 text-sm text-white placeholder:text-slate-500"
    : "mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm dark:border-slate-600 dark:bg-ink-950";
  const labelClass = dark
    ? "text-xs font-semibold text-slate-300"
    : "text-xs font-semibold text-slate-600";

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
    if (requestFlow) {
      body.requestFlow = "true";
    }
    if (cancelReturnPath) {
      body.cancelReturnPath = cancelReturnPath;
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
        setError(json.error ?? "Could not send your request.");
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
          `Request ${json.bookingRef ?? ""} received. We'll be in touch shortly.`,
      );
      form.reset();
    } catch {
      setError("Network error — try again.");
    } finally {
      setBusy(false);
    }
  }

  const categoryOptions = SYDNEY_PPI_SERVICES.map((service) => {
    const note = service.priceNote ? ` (${service.priceNote})` : "";
    return {
      value: service.categoryId,
      label: `${service.label} — ${service.priceLabel}${note}`,
    };
  });

  return (
    <form
      id="book"
      onSubmit={onSubmit}
      className={
        dark
          ? "ppi-form ppi-form-dark space-y-5 rounded-2xl border border-white/10 bg-gradient-to-br from-[#0a1a3f] via-[#0c1d4d] to-[#0a0f2e] p-6 sm:p-8"
          : "ppi-form mx-auto max-w-2xl space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-ink-900"
      }
    >
      <div>
        <p
          className={
            dark
              ? "text-[11px] font-bold uppercase tracking-[0.2em] text-accent-400"
              : "text-[11px] font-bold uppercase tracking-[0.2em] text-accent-500"
          }
        >
          Booking request
        </p>
        <h2
          className={
            dark
              ? "mt-2 text-2xl font-bold text-white sm:text-[1.65rem]"
              : "mt-2 text-2xl font-bold text-slate-900 dark:text-white sm:text-[1.65rem]"
          }
        >
          Book inspection
        </h2>
        <p
          className={
            dark
              ? "mt-3 text-sm leading-relaxed text-slate-400"
              : "mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400"
          }
        >
          Send the vehicle details and the suburb it is in. We reply with a fixed
          price and the next available inspection time — usually within one
          business day.
        </p>
      </div>

      {showVehicleCategory ? (
        <label className="block">
          <span className={labelClass}>Vehicle type</span>
          <select
            name="vehicleCategory"
            value={vehicleCategory}
            onChange={(e) =>
              setVehicleCategory(normalizePpiVehicleCategory(e.target.value))
            }
            className={fieldClass}
          >
            {categoryOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>
      ) : (
        <input type="hidden" name="vehicleCategory" value={vehicleCategory} />
      )}

      <label className="block">
        <span className={labelClass}>Full name</span>
        <input
          required
          name="contactName"
          autoComplete="name"
          placeholder="Jordan Smith"
          className={fieldClass}
        />
      </label>

      <label className="block">
        <span className={labelClass}>Phone</span>
        <input
          required
          name="contactPhone"
          autoComplete="tel"
          placeholder="0400 000 000"
          className={fieldClass}
        />
      </label>

      <label className="block">
        <span className={labelClass}>Email</span>
        <input
          required
          type="email"
          name="contactEmail"
          autoComplete="email"
          placeholder="you@email.com"
          className={fieldClass}
        />
      </label>

      <label className="block">
        <span className={labelClass}>Suburb or postcode</span>
        <input
          required
          name="suburbPostcode"
          autoComplete="postal-code"
          placeholder="Parramatta 2150"
          className={fieldClass}
        />
      </label>

      <label className="block">
        <span className={labelClass}>Make, model and year</span>
        <input
          required
          name="vehicleDescription"
          placeholder="2019 Toyota Hilux SR5"
          className={fieldClass}
        />
      </label>

      <label className="block">
        <span className={labelClass}>Who is selling it?</span>
        <select name="sellerType" defaultValue="private" className={fieldClass}>
          {SELLER_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className={labelClass}>Listing link (optional)</span>
        <input
          name="listingUrl"
          type="url"
          inputMode="url"
          placeholder="https://"
          className={fieldClass}
        />
      </label>

      <label className="block">
        <span className={labelClass}>Preferred date (optional)</span>
        <input name="preferredDate" type="date" className={fieldClass} />
      </label>

      <label className="block">
        <span className={labelClass}>Anything we should know? (optional)</span>
        <textarea
          name="accessNotes"
          rows={3}
          className={fieldClass}
        />
      </label>

      {error ? (
        <p className="rounded-lg border border-red-500/40 bg-red-950/40 px-3 py-2 text-sm text-red-200">
          {error}
        </p>
      ) : null}
      {message ? (
        <p className="rounded-lg border border-emerald-500/40 bg-emerald-950/30 px-3 py-2 text-sm text-emerald-100">
          {message}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={busy}
        className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-accent-500 px-4 py-3.5 text-sm font-bold text-white transition hover:bg-accent-600 disabled:opacity-60"
      >
        {busy ? "Sending…" : "Request this inspection"}
        <ArrowRight className="h-4 w-4" aria-hidden />
      </button>
    </form>
  );
}