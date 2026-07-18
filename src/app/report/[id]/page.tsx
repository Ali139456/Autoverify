import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  AlertTriangle,
  BadgeDollarSign,
  Brain,
  Camera,
  CarFront,
  CheckCircle2,
  Download,
  FileText,
  Lock,
  ShieldCheck,
  TrendingDown,
  XCircle,
} from "lucide-react";
import { getReport } from "@/lib/store";
import { DamageUpload } from "@/components/DamageUpload";

export const metadata: Metadata = {
  title: "Vehicle Report",
  robots: { index: false },
};

const money = (n: number) => `$${n.toLocaleString("en-AU")}`;

function Section({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-white/10 bg-ink-800/70 p-6">
      <div className="flex items-center gap-3 border-b border-white/10 pb-4">
        <span className="rounded-lg border border-accent-500/30 bg-accent-500/10 p-2">
          <Icon className="h-5 w-5 text-accent-400" aria-hidden />
        </span>
        <h2 className="text-lg font-bold text-white">{title}</h2>
      </div>
      <div className="pt-4">{children}</div>
    </section>
  );
}

function CheckItem({
  ok,
  label,
  okText,
  warnText,
}: {
  ok: boolean;
  label: string;
  okText: string;
  warnText: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-xl border border-white/5 bg-ink-950/60 p-4">
      <div>
        <p className="text-sm font-semibold text-white">{label}</p>
        <p className={`mt-0.5 text-sm ${ok ? "text-emerald-400" : "text-red-400"}`}>
          {ok ? okText : warnText}
        </p>
      </div>
      {ok ? (
        <CheckCircle2 className="h-6 w-6 shrink-0 text-emerald-400" aria-hidden />
      ) : (
        <XCircle className="h-6 w-6 shrink-0 text-red-400" aria-hidden />
      )}
    </div>
  );
}

export default async function ReportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const report = await getReport(id);
  if (!report) notFound();

  const { vehicle, registration, valuation, market, ai, damage } = report;

  if (report.status !== "paid") {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center sm:px-6">
        <Lock className="mx-auto h-10 w-10 text-slate-500" aria-hidden />
        <h1 className="mt-4 text-2xl font-bold text-white">
          This report hasn&apos;t been unlocked yet
        </h1>
        <p className="mt-2 text-slate-400">
          Complete payment to view the full report for {vehicle.rego} (
          {vehicle.state}).
        </p>
        <Link
          href={`/check?rego=${vehicle.rego}&state=${vehicle.state}`}
          className="glow-blue mt-8 inline-block rounded-xl bg-accent-600 px-6 py-3 font-bold text-white hover:bg-accent-500"
        >
          Complete purchase
        </Link>
      </div>
    );
  }

  const riskColour =
    ai.riskLabel === "Low Risk"
      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
      : ai.riskLabel === "Moderate Risk"
        ? "border-amber-500/30 bg-amber-500/10 text-amber-300"
        : "border-red-500/30 bg-red-500/10 text-red-300";

  const maxForecast = Math.max(
    ...ai.depreciationForecast.map((d) => d.predictedValue)
  );

  return (
    <div className="relative overflow-hidden">
      {/* Report header */}
      <div className="relative border-b border-white/10 bg-ink-900">
        <div className="pointer-events-none absolute -top-24 left-1/2 h-[300px] w-[700px] -translate-x-1/2 rounded-full bg-accent-600/15 blur-[110px]" />
        <div className="relative mx-auto max-w-5xl px-4 py-10 sm:px-6">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-accent-400">
                <ShieldCheck className="h-4 w-4" aria-hidden />
                Auto Verifi Report · {report.id}
              </p>
              <h1 className="mt-2 text-3xl font-extrabold text-white sm:text-4xl">
                {vehicle.year} {vehicle.make} {vehicle.model}
              </h1>
              <p className="mt-1 text-slate-400">
                {vehicle.variant} · {vehicle.rego} ({vehicle.state}) · VIN{" "}
                {vehicle.vin || "—"}
              </p>
            </div>
            <a
              href={`/api/report/${report.id}/pdf`}
              className="glow-blue inline-flex items-center justify-center gap-2 rounded-xl bg-accent-600 px-6 py-3 font-bold text-white transition hover:bg-accent-500"
            >
              <Download className="h-5 w-5" aria-hidden />
              Download PDF
            </a>
          </div>
        </div>
      </div>

      <div className="relative mx-auto max-w-5xl space-y-6 px-4 py-10 sm:px-6">
        {/* AI summary banner */}
        <div className={`rounded-2xl border p-6 ${riskColour}`}>
          <div className="flex items-center gap-3">
            <Brain className="h-6 w-6" aria-hidden />
            <h2 className="text-lg font-bold">
              AI Assessment: {ai.riskLabel} — score {ai.riskScore}/100
            </h2>
          </div>
          <p className="mt-2 text-sm leading-relaxed">{ai.summary}</p>
        </div>

        {/* Vehicle details */}
        <Section icon={CarFront} title="Vehicle details">
          <dl className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-4">
            {[
              ["Make", vehicle.make],
              ["Model", vehicle.model],
              ["Variant", vehicle.variant],
              ["Year", String(vehicle.year)],
              ["Body", vehicle.bodyType],
              ["Engine", vehicle.engine],
              ["Fuel", vehicle.fuelType],
              ["Transmission", vehicle.transmission],
              ["Colour", vehicle.colour],
              [
                "Odometer",
                vehicle.odometer
                  ? `${vehicle.odometer.toLocaleString()} km`
                  : "—",
              ],
            ].map(([label, value]) => (
              <div key={label}>
                <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  {label}
                </dt>
                <dd className="mt-0.5 font-semibold text-white">
                  {value || "—"}
                </dd>
              </div>
            ))}
          </dl>
        </Section>

        {/* Registration & PPSR */}
        <Section icon={ShieldCheck} title="Registration & PPSR checks">
          <div className="grid gap-3 sm:grid-cols-2">
            <CheckItem
              ok={registration.status === "Registered"}
              label="Registration"
              okText={`Registered — expires ${registration.expiryDate ?? "—"}`}
              warnText={`Status: ${registration.status}`}
            />
            <CheckItem
              ok={!registration.stolen}
              label="Stolen check"
              okText="No stolen record found"
              warnText="Stolen record found"
            />
            <CheckItem
              ok={!registration.writtenOff}
              label="Write-off check"
              okText="No write-off record found"
              warnText={registration.writeOffDetails ?? "Write-off recorded"}
            />
            <CheckItem
              ok={!registration.financeOwing}
              label="Finance / PPSR"
              okText="No security interests found"
              warnText={registration.financeDetails ?? "Finance owing"}
            />
          </div>
        </Section>

        {/* Valuation */}
        <Section
          icon={BadgeDollarSign}
          title={`Current market valuation (${valuation.confidence.toLowerCase()} confidence)`}
        >
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              ["Trade-in", valuation.tradeLow, valuation.tradeHigh],
              ["Private sale", valuation.privateLow, valuation.privateHigh],
              ["Dealer retail", valuation.retailLow, valuation.retailHigh],
            ].map(([label, low, high]) => (
              <div
                key={label as string}
                className="rounded-xl border border-white/5 bg-ink-950/60 p-5 text-center"
              >
                <p className="text-sm font-medium text-slate-400">{label}</p>
                <p className="mt-1 text-xl font-extrabold text-accent-300">
                  {money(low as number)} – {money(high as number)}
                </p>
              </div>
            ))}
          </div>
        </Section>

        {/* Market */}
        <Section icon={TrendingDown} title="Market snapshot & comparables">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              ["Average price", money(market.averagePrice)],
              ["Median price", money(market.medianPrice)],
              ["Active listings", String(market.activeListings)],
              ["Avg days listed", `${market.averageDaysOnMarket} days`],
            ].map(([label, value]) => (
              <div
                key={label}
                className="rounded-xl border border-white/5 bg-ink-950/60 p-4 text-center"
              >
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  {label}
                </p>
                <p className="mt-1 text-lg font-bold text-white">{value}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 text-xs uppercase tracking-wide text-slate-500">
                  <th className="pb-2 pr-4">Similar vehicle</th>
                  <th className="pb-2 pr-4">Price</th>
                  <th className="pb-2 pr-4">Odometer</th>
                  <th className="pb-2 pr-4">Location</th>
                  <th className="pb-2">Listed</th>
                </tr>
              </thead>
              <tbody className="text-slate-300">
                {market.comparableListings.map((l, i) => (
                  <tr key={i} className="border-b border-white/5">
                    <td className="py-3 pr-4 font-medium text-white">
                      {l.title}
                    </td>
                    <td className="py-3 pr-4 font-semibold text-accent-300">
                      {money(l.price)}
                    </td>
                    <td className="py-3 pr-4">{l.odometer.toLocaleString()} km</td>
                    <td className="py-3 pr-4">{l.location}</td>
                    <td className="py-3">{l.daysListed} days</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        {/* AI insights */}
        <Section icon={Brain} title="AI future insights">
          <div className="grid gap-6 lg:grid-cols-2">
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                Risk factors
              </h3>
              <ul className="mt-3 space-y-2">
                {ai.riskFactors.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-slate-300">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-accent-400" aria-hidden />
                    {f}
                  </li>
                ))}
              </ul>
              <div className="mt-5 rounded-xl border border-white/5 bg-ink-950/60 p-4">
                <p className="text-sm font-semibold text-white">Recommendation</p>
                <p className="mt-1 text-sm leading-relaxed text-slate-400">
                  {ai.buyRecommendation}
                </p>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                5-year depreciation forecast
              </h3>
              <div className="mt-3 space-y-2">
                {ai.depreciationForecast.map((d) => (
                  <div key={d.year} className="flex items-center gap-3">
                    <span className="w-12 text-sm font-medium text-slate-500">
                      {d.year}
                    </span>
                    <div className="h-6 flex-1 overflow-hidden rounded bg-ink-950">
                      <div
                        className="h-full rounded bg-gradient-to-r from-accent-700 to-accent-500"
                        style={{
                          width: `${Math.max(
                            (d.predictedValue / maxForecast) * 100,
                            6
                          )}%`,
                        }}
                      />
                    </div>
                    <span className="w-20 text-right text-sm font-bold text-white">
                      {money(d.predictedValue)}
                    </span>
                  </div>
                ))}
              </div>
              <p className="mt-4 rounded-xl border border-white/5 bg-ink-950/60 p-4 text-sm text-slate-300">
                Projected 3-year residual value:{" "}
                <span className="font-bold text-accent-300">
                  {money(ai.residualValue3yr)}
                </span>
              </p>
            </div>
          </div>
        </Section>

        {/* Damage analysis */}
        <Section icon={Camera} title="AI photo damage analysis">
          {damage ? (
            <>
              <div className="mb-4 flex flex-wrap items-center gap-4">
                <span className="rounded-full border border-accent-500/40 bg-accent-500/10 px-4 py-1.5 text-sm font-semibold text-accent-300">
                  Overall condition: {damage.overallCondition}
                </span>
                <span className="text-sm text-slate-500">
                  {damage.analyzedPhotos} photo(s) analyzed
                </span>
              </div>
              {damage.findings.length === 0 ? (
                <p className="flex items-center gap-2 text-sm font-medium text-emerald-400">
                  <CheckCircle2 className="h-5 w-5" aria-hidden />
                  No visible damage detected in the supplied photos.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[520px] text-left text-sm">
                    <thead>
                      <tr className="border-b border-white/10 text-xs uppercase tracking-wide text-slate-500">
                        <th className="pb-2 pr-4">Panel</th>
                        <th className="pb-2 pr-4">Type</th>
                        <th className="pb-2 pr-4">Severity</th>
                        <th className="pb-2 pr-4">Confidence</th>
                        <th className="pb-2">Est. repair</th>
                      </tr>
                    </thead>
                    <tbody className="text-slate-300">
                      {damage.findings.map((f, i) => (
                        <tr key={i} className="border-b border-white/5">
                          <td className="py-3 pr-4 font-medium text-white">{f.panel}</td>
                          <td className="py-3 pr-4">{f.type}</td>
                          <td className="py-3 pr-4">
                            <span
                              className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                                f.severity === "Minor"
                                  ? "bg-emerald-500/15 text-emerald-300"
                                  : f.severity === "Moderate"
                                    ? "bg-amber-500/15 text-amber-300"
                                    : "bg-red-500/15 text-red-300"
                              }`}
                            >
                              {f.severity}
                            </span>
                          </td>
                          <td className="py-3 pr-4">{Math.round(f.confidence * 100)}%</td>
                          <td className="py-3 font-semibold text-accent-300">
                            {money(f.repairEstimate)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <p className="mt-4 text-sm text-slate-300">
                    Total estimated repair cost:{" "}
                    <span className="font-bold text-white">
                      {money(damage.totalRepairEstimate)}
                    </span>
                  </p>
                </div>
              )}
              <div className="mt-6">
                <DamageUpload reportId={report.id} />
              </div>
            </>
          ) : (
            <>
              <p className="mb-4 text-sm text-slate-400">
                Have photos of the car? Upload them and our AI (powered by
                Ravin.ai) will scan every panel for dents, scratches and damage
                — the results are added to this report and your PDF.
              </p>
              <DamageUpload reportId={report.id} />
            </>
          )}
        </Section>

        {/* Footer actions */}
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-accent-500/30 bg-gradient-to-r from-accent-700/20 to-ink-800 p-8 text-center sm:flex-row sm:justify-between sm:text-left">
          <div>
            <h2 className="flex items-center gap-2 text-lg font-bold text-white">
              <FileText className="h-5 w-5 text-accent-400" aria-hidden />
              Keep this report forever
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              Download the PDF to save, print or share with your mechanic.
            </p>
          </div>
          <a
            href={`/api/report/${report.id}/pdf`}
            className="glow-blue inline-flex shrink-0 items-center gap-2 rounded-xl bg-accent-600 px-6 py-3 font-bold text-white transition hover:bg-accent-500"
          >
            <Download className="h-5 w-5" aria-hidden />
            Download PDF
          </a>
        </div>

        <p className="text-center text-xs leading-relaxed text-slate-600">
          Generated {new Date(report.createdAt).toLocaleString("en-AU")}. This
          report is compiled from third-party data sources and AI models and is
          provided for information only. Always obtain an official PPSR
          certificate and independent inspection before purchase.
        </p>
      </div>
    </div>
  );
}
