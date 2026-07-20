import {
  BadgeDollarSign,
  Brain,
  CarFront,
  Check,
  FileText,
  Sparkles,
  X,
} from "lucide-react";

type Availability = [boolean, boolean, boolean, boolean];

interface FeatureRow {
  feature: string;
  cols: Availability; // [PPSR basic, Competitors, Insights, Insights+]
}

interface Category {
  name: string;
  icon: React.ElementType;
  rows: FeatureRow[];
}

const CATEGORIES: Category[] = [
  {
    name: "History Check",
    icon: FileText,
    rows: [
      { feature: "Stolen & written-off status", cols: [true, true, true, true] },
      { feature: "Finance owing", cols: [true, true, true, true] },
      { feature: "Odometer history & fraud check", cols: [false, true, true, true] },
      { feature: "Exact model variant & series", cols: [false, true, true, true] },
      { feature: "P Plate legal status", cols: [false, false, true, true] },
      { feature: "Warranty status", cols: [false, false, true, true] },
    ],
  },
  {
    name: "Current Condition",
    icon: CarFront,
    rows: [
      { feature: "AI damage detection", cols: [false, false, false, true] },
      { feature: "Photo-based condition report", cols: [false, false, false, true] },
      { feature: "Estimated repair costs", cols: [false, false, false, true] },
    ],
  },
  {
    name: "Market Value",
    icon: BadgeDollarSign,
    rows: [
      { feature: "Live market valuation", cols: [false, false, true, true] },
      { feature: "Trade-in, private & retail ranges", cols: [false, false, true, true] },
      { feature: "Comparable cars for sale", cols: [false, false, true, true] },
    ],
  },
  {
    name: "Future Outlook",
    icon: Brain,
    rows: [
      { feature: "AI risk score & risk factors", cols: [false, false, true, true] },
      { feature: "5-year depreciation forecast", cols: [false, false, true, true] },
      { feature: "3-year residual value", cols: [false, false, true, true] },
      { feature: "Buy recommendation", cols: [false, false, true, true] },
    ],
  },
];

const COLUMNS = [
  "PPSR basic report",
  "Competitor history reports",
  "Auto Verifi Insights",
  "Auto Verifi Insights+",
];

function Mark({ ok }: { ok: boolean }) {
  return (
    <span
      className={`mx-auto flex h-6 w-6 items-center justify-center rounded-full ${
        ok ? "bg-accent-600" : "bg-slate-200"
      }`}
    >
      {ok ? (
        <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} aria-hidden />
      ) : (
        <X className="h-3.5 w-3.5 text-slate-400" strokeWidth={3} aria-hidden />
      )}
    </span>
  );
}

export function ComparisonTable() {
  return (
    <div className="overflow-x-auto rounded-2xl">
      <table className="w-full min-w-[760px] border-collapse overflow-hidden rounded-2xl bg-white text-left text-sm">
        <thead>
          <tr className="bg-accent-600 text-white">
            <th className="w-36 px-4 py-4 text-xs font-bold sm:w-44 sm:px-5">
              Report category
            </th>
            <th className="px-4 py-4 text-xs font-bold sm:px-5">
              Report feature
            </th>
            {COLUMNS.map((c, i) => (
              <th
                key={c}
                className={`w-28 px-3 py-4 text-center text-xs font-bold sm:w-32 ${
                  i >= 2 ? "bg-accent-700/60" : ""
                }`}
              >
                <span className="inline-flex items-center justify-center gap-1">
                  {i === 3 && <Sparkles className="h-3.5 w-3.5" aria-hidden />}
                  {c}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {CATEGORIES.map(({ name, icon: Icon, rows }) =>
            rows.map((row, ri) => (
              <tr
                key={name + row.feature}
                className={`border-b border-slate-100 ${
                  ri % 2 === 1 ? "bg-blue-50/60" : "bg-white"
                }`}
              >
                {ri === 0 && (
                  <td
                    rowSpan={rows.length}
                    className="border-r border-slate-100 bg-white px-4 py-4 align-top sm:px-5"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-accent-500/30 bg-blue-50 text-accent-600">
                        <Icon className="h-5 w-5" aria-hidden />
                      </span>
                      <span className="text-sm font-bold text-slate-900">
                        {name}
                      </span>
                    </div>
                  </td>
                )}
                <td className="px-4 py-3.5 font-medium text-slate-700 sm:px-5">
                  {row.feature}
                </td>
                {row.cols.map((ok, ci) => (
                  <td
                    key={ci}
                    className={`px-3 py-3.5 text-center ${
                      ci >= 2 ? "bg-blue-100/40" : ""
                    }`}
                  >
                    <Mark ok={ok} />
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
