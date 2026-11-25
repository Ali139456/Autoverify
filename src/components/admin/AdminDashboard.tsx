"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowDown, ArrowUp, ExternalLink, Loader2, RefreshCw } from "lucide-react";
import type { AdminJobRow, AdminJobType } from "@/lib/admin/jobs";

const TYPE_OPTIONS: { value: "all" | AdminJobType; label: string }[] = [
  { value: "all", label: "All types" },
  { value: "pre_purchase", label: "Pre-purchase" },
  { value: "lender_asset", label: "Lender asset" },
  { value: "insights", label: "Insights" },
  { value: "insights_plus", label: "Insights+" },
];

function formatDate(iso: string): string {
  const ms = Date.parse(iso);
  if (!Number.isFinite(ms)) return iso;
  return new Intl.DateTimeFormat("en-AU", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Australia/Sydney",
  }).format(ms);
}

function formatMoney(amount: number | null): string {
  if (amount == null || !Number.isFinite(amount)) return "—";
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
  }).format(amount);
}

export function AdminDashboard() {
  const [jobs, setJobs] = useState<AdminJobRow[]>([]);
  const [configured, setConfigured] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<"all" | AdminJobType>("all");
  const [sortNewestFirst, setSortNewestFirst] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/jobs", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "Could not load jobs.");
      }
      setJobs(data.jobs ?? []);
      setConfigured(Boolean(data.configured));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load jobs.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = useMemo(() => {
    let rows = jobs;
    if (typeFilter !== "all") {
      rows = rows.filter((row) => row.type === typeFilter);
    }
    rows = [...rows].sort((a, b) => {
      const da = Date.parse(a.createdAt);
      const db = Date.parse(b.createdAt);
      return sortNewestFirst ? db - da : da - db;
    });
    return rows;
  }, [jobs, sortNewestFirst, typeFilter]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-5 sm:px-6">
          <div>
            <h1 className="text-xl font-bold tracking-tight">Bookings dashboard</h1>
            <p className="mt-0.5 text-sm text-slate-500">
              {loading ? "Loading…" : `${filtered.length} job${filtered.length === 1 ? "" : "s"}`}
            </p>
          </div>
          <button
            type="button"
            onClick={() => void load()}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 disabled:opacity-60"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            ) : (
              <RefreshCw className="h-4 w-4" aria-hidden />
            )}
            Refresh
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        {!configured ? (
          <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            Supabase is not configured on this environment — connect the database to
            see bookings here.
          </p>
        ) : null}

        <div className="mt-4 flex flex-wrap items-end gap-4">
          <label className="text-sm">
            <span className="mb-1 block font-medium text-slate-600">Type</span>
            <select
              value={typeFilter}
              onChange={(e) =>
                setTypeFilter(e.target.value as "all" | AdminJobType)
              }
              className="min-w-[11rem] rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
            >
              {TYPE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>

          <label className="text-sm">
            <span className="mb-1 block font-medium text-slate-600">Date</span>
            <button
              type="button"
              onClick={() => setSortNewestFirst((v) => !v)}
              className="inline-flex min-w-[11rem] items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium"
            >
              {sortNewestFirst ? (
                <>
                  <ArrowDown className="h-4 w-4" aria-hidden />
                  Newest first
                </>
              ) : (
                <>
                  <ArrowUp className="h-4 w-4" aria-hidden />
                  Oldest first
                </>
              )}
            </button>
          </label>
        </div>

        {error ? (
          <p className="mt-4 text-sm font-medium text-red-600" role="alert">
            {error}
          </p>
        ) : null}

        <div className="mt-6 overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-slate-100 bg-slate-50/80 text-xs font-semibold uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Ref</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Vehicle</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3" aria-label="Link" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading && jobs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-slate-500">
                    <Loader2
                      className="mx-auto h-6 w-6 animate-spin text-slate-400"
                      aria-hidden
                    />
                  </td>
                </tr>
              ) : null}
              {!loading && filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-slate-500">
                    No bookings yet for this filter.
                  </td>
                </tr>
              ) : null}
              {filtered.map((row) => (
                <tr key={`${row.type}-${row.id}`} className="hover:bg-slate-50/60">
                  <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                    {formatDate(row.createdAt)}
                  </td>
                  <td className="px-4 py-3 font-medium">{row.typeLabel}</td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-700">
                    {row.id}
                  </td>
                  <td className="px-4 py-3">
                    <CustomerCell
                      customerName={row.customerName}
                      email={row.customerEmail}
                      phone={row.customerPhone}
                    />
                  </td>
                  <td className="max-w-[10rem] truncate px-4 py-3 text-slate-600">
                    {row.vehicleSummary ?? "—"}
                  </td>
                  <td className="px-4 py-3 tabular-nums">{formatMoney(row.amountAud)}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
                      {row.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {row.href ? (
                      <Link
                        href={row.href}
                        className="inline-flex items-center gap-1 text-accent-600 hover:underline"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Open
                        <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                      </Link>
                    ) : (
                      <span className="text-slate-300">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}

function CustomerCell({
  customerName,
  email,
  phone,
}: {
  customerName: string | null;
  email: string | null;
  phone: string | null;
}) {
  return (
    <div className="leading-snug">
      {customerName ? (
        <p className="font-medium text-slate-800">{customerName}</p>
      ) : null}
      {email ? <p className="text-xs text-slate-500">{email}</p> : null}
      {phone ? <p className="text-xs text-slate-500">{phone}</p> : null}
      {!customerName && !email && !phone ? (
        <span className="text-slate-400">—</span>
      ) : null}
    </div>
  );
}