import { Shield, Wrench } from "lucide-react";
import {
  formatManufacturerWarrantyStatus,
  formatServicingGuidelines,
} from "@/lib/report-design";
import type { ManufacturerWarrantyServiceInfo } from "@/lib/types";

function PreviewCard({
  icon: Icon,
  title,
  status,
  statusSubtext,
  detail,
}: {
  icon: typeof Shield;
  title: string;
  status: string;
  statusSubtext?: string;
  detail?: string;
}) {
  const body = status.trim() || detail?.trim() || "";
  if (!body) return null;

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-ink-900/50">
      <div className="flex items-start gap-2">
        <Icon className="mt-0.5 h-4 w-4 shrink-0 text-slate-600 dark:text-slate-400" aria-hidden />
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            {title}
          </p>
          {status.trim() ? (
            <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">
              {status}
            </p>
          ) : null}
          {statusSubtext?.trim() ? (
            <p className="mt-0.5 text-xs text-slate-500">{statusSubtext}</p>
          ) : null}
          {detail?.trim() && !status.trim() ? (
            <p className="mt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
              {detail}
            </p>
          ) : null}
          {detail?.trim() && status.trim() ? (
            <p className="mt-1.5 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
              {detail}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

/** OEM warranty + servicing preview on the rego check step (same data as report Key Insights). */
export function CheckWarrantyServicingPreview({
  info,
}: {
  info?: ManufacturerWarrantyServiceInfo | null;
}) {
  const warranty = formatManufacturerWarrantyStatus(info);
  const servicing = formatServicingGuidelines(info);

  return (
    <div className="border-t border-slate-200 px-6 py-5 dark:border-white/10">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
        Manufacturer warranty &amp; servicing
      </p>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <PreviewCard
          icon={Shield}
          title="Warranty status"
          status={warranty.status ?? ""}
          statusSubtext={warranty.statusSubtext}
          detail={warranty.detail}
        />
        <PreviewCard
          icon={Wrench}
          title="Servicing guidelines"
          status={servicing.status ?? ""}
          statusSubtext={servicing.statusSubtext}
          detail={servicing.detail}
        />
      </div>
    </div>
  );
}
