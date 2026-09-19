import { INSIGHT_ICON_NAMES, SPEC_ICON_NAMES, WEB_ICONS } from "@/lib/report-icons";
import type { ReportIconName } from "@/lib/report-icons";

export function SpecIcon({
  index,
  className = "h-3.5 w-3.5",
}: {
  index: number;
  className?: string;
}) {
  const name = SPEC_ICON_NAMES[index] ?? "car";
  return <ReportIcon name={name} className={className} />;
}

export function InsightCategoryIcon({
  insightId,
  className = "h-4 w-4",
}: {
  insightId: string;
  className?: string;
}) {
  const name = INSIGHT_ICON_NAMES[insightId] ?? "file";
  return <ReportIcon name={name} className={className} />;
}

export function ReportIcon({
  name,
  className = "h-4 w-4",
}: {
  name: ReportIconName;
  className?: string;
}) {
  const Icon = WEB_ICONS[name];
  return <Icon className={className} aria-hidden />;
}
