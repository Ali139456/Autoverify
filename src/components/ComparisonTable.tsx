import {
  BarChart3,
  Check,
  FileText,
  Lightbulb,
  Minus,
  Shield,
  X,
} from "lucide-react";

type CompetitorLevel = "yes" | "partial" | "limited";

type ComparisonRow = {
  name: string;
  icon: React.ElementType;
  iconClass: string;
  iconBg: string;
  features: string;
  competitor: CompetitorLevel;
};

const ROWS: ComparisonRow[] = [
  {
    name: "History & Identity",
    icon: FileText,
    iconClass: "text-blue-600",
    iconBg: "bg-blue-50 border-blue-200",
    features:
      "Finance/PPSR • Stolen • Written-off • Odometer history • Exact variant & build details",
    competitor: "yes",
  },
  {
    name: "Safety & Suitability",
    icon: Shield,
    iconClass: "text-violet-600",
    iconBg: "bg-violet-50 border-violet-200",
    features:
      "Safety/recall information • P-plate status • Warranty status • Factory specifications & options",
    competitor: "partial",
  },
  {
    name: "Market & Value",
    icon: BarChart3,
    iconClass: "text-emerald-600",
    iconBg: "bg-emerald-50 border-emerald-200",
    features:
      "Retail & trade valuation • Market comparison • Cars for sale • Market supply & days-to-sell",
    competitor: "partial",
  },
  {
    name: "Buying Insights",
    icon: Lightbulb,
    iconClass: "text-red-600",
    iconBg: "bg-red-50 border-red-200",
    features:
      "Odometer vs market • Vehicle-specific insights • Key risks • Smarter buying decision",
    competitor: "limited",
  },
];

const COMPETITOR_BADGE: Record<
  CompetitorLevel,
  { label: string; className: string; Icon: React.ElementType }
> = {
  yes: {
    label: "Yes",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
    Icon: Check,
  },
  partial: {
    label: "Partial",
    className: "border-amber-200 bg-amber-50 text-amber-700",
    Icon: Minus,
  },
  limited: {
    label: "Limited",
    className: "border-red-200 bg-red-50 text-red-700",
    Icon: X,
  },
};

function CompetitorBadge({ level }: { level: CompetitorLevel }) {
  const { label, className, Icon } = COMPETITOR_BADGE[level];

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold ${className}`}
    >
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/80">
        <Icon className="h-3.5 w-3.5" strokeWidth={3} aria-hidden />
      </span>
      {label}
    </span>
  );
}

export function ComparisonTable() {
  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-sm">
      <table className="w-full min-w-[640px] border-collapse bg-white text-left text-sm">
        <thead>
          <tr className="bg-accent-600 text-white">
            <th className="w-44 px-5 py-4 text-sm font-bold sm:w-52">Check</th>
            <th className="px-5 py-4 text-sm font-bold">Auto Verifi Insights</th>
            <th className="w-44 px-5 py-4 text-center text-sm font-bold sm:w-52">
              Competitor Reports
            </th>
          </tr>
        </thead>
        <tbody>
          {ROWS.map((row, index) => {
            const Icon = row.icon;

            return (
              <tr
                key={row.name}
                className={`border-t border-slate-100 ${
                  index % 2 === 1 ? "bg-slate-50/70" : "bg-white"
                }`}
              >
                <td className="px-5 py-5 align-top">
                  <div className="flex items-start gap-3">
                    <span
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${row.iconBg}`}
                    >
                      <Icon className={`h-5 w-5 ${row.iconClass}`} aria-hidden />
                    </span>
                    <span className="pt-2 text-sm font-bold text-slate-900">
                      {row.name}
                    </span>
                  </div>
                </td>
                <td className="px-5 py-5 align-middle text-sm leading-relaxed text-slate-700">
                  {row.features}
                </td>
                <td className="px-5 py-5 text-center align-middle">
                  <CompetitorBadge level={row.competitor} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
