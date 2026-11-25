"use client";

import { useState } from "react";
import { Loader2, Lock } from "lucide-react";
import { Logo } from "@/components/Logo";

export function AdminLoginForm({ onSuccess }: { onSuccess?: () => void }) {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? "Could not sign in.");
      }

      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not sign in.");
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-ink-950 px-4 py-16">
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[500px] w-[900px] -translate-x-1/2 rounded-full bg-accent-600/15 blur-[140px]" />

      <div className="relative w-full max-w-md rounded-3xl border border-white/10 bg-ink-900/80 p-8 shadow-2xl">
        <div className="flex justify-center">
          <Logo height={48} linked={false} priority variant="onDark" />
        </div>

        <h1 className="mt-6 text-center text-2xl font-bold text-white">
          Bookings dashboard
        </h1>
        <p className="mt-2 text-center text-sm text-slate-400">
          Admin access only — track Insights, Insights+, pre-purchase, and lender
          asset jobs.
        </p>

        <form onSubmit={onSubmit} className="mt-8 space-y-4">
          <label className="block text-sm">
            <span className="mb-1.5 block text-slate-300">Password</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              className="w-full rounded-xl border border-white/10 bg-ink-950 px-4 py-3 text-white outline-none transition focus:border-accent-500/50"
              placeholder="Enter admin password"
            />
          </label>

          <button
            type="submit"
            disabled={loading || !password.trim()}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-accent-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-accent-500 disabled:opacity-60"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            ) : (
              <Lock className="h-4 w-4" aria-hidden />
            )}
            {loading ? "Checking…" : "Sign in"}
          </button>
        </form>

        {error ? (
          <p className="mt-4 text-center text-sm font-medium text-red-400" role="alert">
            {error}
          </p>
        ) : null}
      </div>
    </div>
  );
}