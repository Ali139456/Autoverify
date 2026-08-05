"use client";

import { useState } from "react";
import { Copy, Link2, Loader2, Smartphone } from "lucide-react";

export function InspectionStarter({ reportId }: { reportId: string }) {
  const [phone, setPhone] = useState("");
  const [inspectUrl, setInspectUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function startInspection() {
    setLoading(true);
    setError(null);
    setCopied(false);

    try {
      const res = await fetch("/api/inspections/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportId, phone }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not create inspection link.");
      setInspectUrl(data.inspectUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create inspection link.");
    } finally {
      setLoading(false);
    }
  }

  async function copyLink() {
    if (!inspectUrl) return;
    await navigator.clipboard.writeText(inspectUrl);
    setCopied(true);
  }

  return (
    <div className="rounded-2xl border border-accent-500/20 bg-ink-950/70 p-5">
      <div className="flex items-start gap-3">
        <span className="rounded-xl border border-accent-500/30 bg-accent-500/10 p-2">
          <Smartphone className="h-5 w-5 text-accent-400" aria-hidden />
        </span>
        <div>
          <h3 className="font-bold text-white">Guided mobile inspection</h3>
          <p className="mt-1 text-sm text-slate-400">
            Start a 13-step photo walkaround on your phone. Photos upload
            automatically and Ravin AI adds damage findings to this report.
          </p>
        </div>
      </div>

      <label className="mt-5 block text-sm">
        <span className="mb-1.5 block text-slate-300">Mobile number (optional)</span>
        <input
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
          placeholder="+61 4xx xxx xxx"
          className="w-full rounded-xl border border-white/10 bg-ink-900 px-4 py-3 text-white outline-none transition focus:border-accent-500/50"
        />
      </label>

      <button
        type="button"
        onClick={() => void startInspection()}
        disabled={loading}
        className="mt-4 inline-flex items-center gap-2 rounded-xl bg-accent-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-accent-500 disabled:opacity-60"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
        ) : (
          <Link2 className="h-4 w-4" aria-hidden />
        )}
        {loading ? "Creating link…" : "Create inspection link"}
      </button>

      {inspectUrl && (
        <div className="mt-4 rounded-xl border border-white/10 bg-ink-900/80 p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
            Open on your phone
          </p>
          <a
            href={inspectUrl}
            className="mt-2 block break-all text-sm font-medium text-accent-300 hover:text-white"
          >
            {inspectUrl}
          </a>
          <button
            type="button"
            onClick={() => void copyLink()}
            className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-slate-300 hover:text-white"
          >
            <Copy className="h-4 w-4" aria-hidden />
            {copied ? "Copied" : "Copy link"}
          </button>
          {phone ? (
            <p className="mt-2 text-xs text-slate-500">
              SMS delivery can be wired once your messaging provider is connected.
            </p>
          ) : null}
        </div>
      )}

      {error && (
        <p className="mt-3 text-sm font-medium text-red-400" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
