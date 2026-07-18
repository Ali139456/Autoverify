"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CreditCard, Loader2 } from "lucide-react";

export function PayButton({
  rego,
  state,
  label,
}: {
  rego: string;
  state: string;
  label: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function pay() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rego, state }),
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
