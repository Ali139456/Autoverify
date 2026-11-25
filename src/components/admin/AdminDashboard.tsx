"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowDown,
  ArrowUp,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  LayoutList,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { Logo } from "@/components/Logo";
import type { AdminJobRow, AdminJobType } from "@/lib/admin/jobs";

const PAGE_SIZE = 20;

const TYPE_OPTIONS: { value: "all" | AdminJobType; label: string }[] = [
  { value: "all", label: "All" },
  { value: "pre_purchase", label: "Pre-purchase" },
  { value: "lender_asset", label: "Lender asset" },
  { value: "insights", label: "Insights" },
  { value: "insights_plus", label: "Insights+" },
];

const TYPE_BADGE: Record<AdminJobType, string> = {
  pre_purchase: "border-sky-400/35 bg-sky-500/15 text-sky-200",
  lender_asset: "border-violet-400/35 bg-violet-500/15 text-violet-200",
  insights: "border-accent-400/35 bg-accent-500/15 text-accent-200",
  insights_plus: "border-emerald-400/35 bg-emerald-500/15 text-emerald-200",
};

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

function statusBadgeClass(status: string): string {
  const s = status.toLowerCase();
  if (s === "paid" || s === "complete" || s === "fulfilled") {
    return "border-emerald-400/30 bg-emerald-500/15 text-emerald-200";
  }
  if (s === "failed" || s === "pending_payment") {
    return "border-amber-400/30 bg-amber-500/15 text-amber-100";
  }
  if (s.includes("processing") || s.includes("awaiting") || s === "invoiced") {
    return "border-sky-400/30 bg-sky-500/15 text-sky-100";
  }
  return "border-white/15 bg-white/10 text-slate-300";
}

export function AdminDashboard() {
  const [jobs, setJobs] = useState<AdminJobRow[]>([]);
  const [configured, setConfigured] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<"all" | AdminJobType>("all");
  const [sortNewestFirst, setSortNewestFirst] = useState(true);
  const [page, setPage] = useState(1);

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

  useEffect(() => {
    setPage(1);
  }, [typeFilter, sortNewestFirst]);

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

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageStart = (safePage - 1) * PAGE_SIZE;
  const pageRows = filtered.slice(pageStart, pageStart + PAGE_SIZE);

  const pageNumbers = useMemo(() => {
    const maxButtons = 5;
    let start = Math.max(1, safePage - Math.floor(maxButtons / 2));
    const end = Math.min(totalPages, start + maxButtons - 1);
    start = Math.max(1, end - maxButtons + 1);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }, [safePage, totalPages]);

  return (
    <div className="relative min-h-screen overflow-x-clip bg-ink-950 text-white">
      <div className="pointer-events-none absolute -top-32 left-1/2 h-[420px] w-[min(100%,56rem)] -translate-x-1/2 rounded-full bg-accent-600/12 blur-[120px]" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-72 w-72 rounded-full bg-violet-600/10 blur-[100px]" />

      <header className="relative border-b border-white/10 bg-ink-950/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <Logo height={40} variant="onDark" />
            <div className="hidden h-8 w-px bg-white/10 sm:block" aria-hidden />
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-accent-400">
                Admin
              </p>
              <h1 className="text-lg font-extrabold tracking-tight sm:text-xl">
                Bookings dashboard
              </h1>
            </div>
          </div>
          <button
            type="button"
            onClick={() => void load()}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white transition hover:border-accent-500/40 hover:bg-accent-500/10 disabled:opacity-50"
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

      <main className="relative mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        {!configured ? (
          <p className="mb-6 rounded-2xl border border-amber-400/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
            Supabase is not configured on this environment — connect the database to
            see bookings here.
          </p>
        ) : null}

        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <StatsSummary loading={loading} total={filtered.length} />
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setSortNewestFirst((v) => !v)}
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-ink-900/60 px-3.5 py-2 text-sm font-medium text-slate-200 transition hover:border-white/20"
            >
              {sortNewestFirst ? (
                <ArrowDown className="h-4 w-4 text-accent-400" aria-hidden />
              ) : (
                <ArrowUp className="h-4 w-4 text-accent-400" aria-hidden />
              )}
              {sortNewestFirst ? "Newest first" : "Oldest first"}
            </button>
          </div>
        </div>

        <nav
          className="mt-5 flex flex-wrap gap-2"
          aria-label="Filter by booking type"
        >
          {TYPE_OPTIONS.map((opt) => {
            const active = typeFilter === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => setTypeFilter(opt.value)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  active
                    ? "bg-accent-500 text-white shadow-lg shadow-accent-600/25"
                    : "border border-white/10 bg-white/5 text-slate-300 hover:border-white/20 hover:text-white"
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </nav>

        {error ? (
          <p className="mt-4 text-sm font-medium text-red-400" role="alert">
            {error}
          </p>
        ) : null}

        <div className="mt-6 overflow-hidden rounded-2xl border border-white/10 bg-ink-900/50 shadow-2xl shadow-black/40 backdrop-blur-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[880px] text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.03] text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">
                  <th className="px-4 py-3.5 lg:px-5">Date</th>
                  <th className="px-4 py-3.5 lg:px-5">Type</th>
                  <th className="px-4 py-3.5 lg:px-5">Ref</th>
                  <th className="px-4 py-3.5 lg:px-5">Customer</th>
                  <th className="px-4 py-3.5 lg:px-5">Vehicle</th>
                  <th className="px-4 py-3.5 lg:px-5">Amount</th>
                  <th className="px-4 py-3.5 lg:px-5">Status</th>
                  <th className="px-4 py-3.5 lg:px-5" aria-label="Open" />
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06]">
                {loading && jobs.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-16 text-center">
                      <Loader2
                        className="mx-auto h-8 w-8 animate-spin text-accent-400"
                        aria-hidden
                      />
                      <p className="mt-3 text-sm text-slate-400">Loading bookings…</p>
                    </td>
                  </tr>
                ) : null}
                {!loading && filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-16 text-center text-slate-400">
                      No bookings yet for this filter.
                    </td>
                  </tr>
                ) : null}
                {pageRows.map((row) => (
                  <tr
                    key={`${row.type}-${row.id}`}
                    className="transition hover:bg-white/[0.03]"
                  >
                    <td className="whitespace-nowrap px-4 py-3.5 text-slate-300 lg:px-5">
                      {formatDate(row.createdAt)}
                    </td>
                    <td className="px-4 py-3.5 lg:px-5">
                      <span
                        className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold ${TYPE_BADGE[row.type]}`}
                      >
                        {row.typeLabel}
                      </span>
                    </td>
                    <td className="max-w-[9rem] truncate px-4 py-3.5 font-mono text-xs text-slate-200 lg:px-5">
                      {row.id}
                    </td>
                    <td className="px-4 py-3.5 lg:px-5">
                      <CustomerCell
                        customerName={row.customerName}
                        email={row.customerEmail}
                        phone={row.customerPhone}
                      />
                    </td>
                    <td
                      className="max-w-[11rem] truncate px-4 py-3.5 text-slate-400 lg:px-5"
                      title={row.vehicleSummary ?? undefined}
                    >
                      {row.vehicleSummary ?? "—"}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5 font-semibold tabular-nums text-white lg:px-5">
                      {formatMoney(row.amountAud)}
                    </td>
                    <td className="px-4 py-3.5 lg:px-5">
                      <span
                        className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize ${statusBadgeClass(row.status)}`}
                      >
                        {row.status.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 lg:px-5">
                      {row.href ? (
                        <Link
                          href={row.href}
                          className="inline-flex items-center gap-1 rounded-lg border border-accent-500/30 bg-accent-500/10 px-2.5 py-1 text-xs font-semibold text-accent-300 transition hover:bg-accent-500/20"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Open
                          <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                        </Link>
                      ) : (
                        <span className="text-slate-600">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filtered.length > 0 ? (
            <div className="flex flex-col gap-3 border-t border-white/10 bg-ink-950/40 px-4 py-4 sm:flex-row sm:items-center sm:justify-between lg:px-5">
              <p className="text-sm text-slate-400">
                Showing{" "}
                <span className="font-semibold text-slate-200">
                  {pageStart + 1}–{Math.min(pageStart + PAGE_SIZE, filtered.length)}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-slate-200">{filtered.length}</span>
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  disabled={safePage <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Previous page"
                >
                  <ChevronLeft className="h-4 w-4" aria-hidden />
                  Prev
                </button>
                <div className="flex items-center gap-1">
                  {pageNumbers.map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setPage(n)}
                      className={`min-w-[2.25rem] rounded-lg px-2 py-1.5 text-sm font-semibold transition ${
                        n === safePage
                          ? "bg-accent-500 text-white"
                          : "border border-white/10 text-slate-300 hover:border-white/20 hover:text-white"
                      }`}
                      aria-current={n === safePage ? "page" : undefined}
                    >
                      {n}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  disabled={safePage >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Next page"
                >
                  Next
                  <ChevronRight className="h-4 w-4" aria-hidden />
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </main>
    </div>
  );
}

function StatsSummary({ loading, total }: { loading: boolean; total: number }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-ink-900/60 px-4 py-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-500/15 text-accent-400">
        <LayoutList className="h-5 w-5" aria-hidden />
      </div>
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
          Total in view
        </p>
        <p className="text-xl font-extrabold tabular-nums text-white">
          {loading ? "—" : total}
          <span className="ml-1.5 text-sm font-medium text-slate-500">
            booking{total === 1 ? "" : "s"}
          </span>
        </p>
      </div>
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
    <div className="max-w-[14rem] leading-snug">
      {customerName ? (
        <p className="truncate font-medium text-slate-100">{customerName}</p>
      ) : null}
      {email ? (
        <p className="truncate text-xs text-slate-400">{email}</p>
      ) : null}
      {phone ? <p className="text-xs text-slate-500">{phone}</p> : null}
      {!customerName && !email && !phone ? (
        <span className="text-slate-600">—</span>
      ) : null}
    </div>
  );
}