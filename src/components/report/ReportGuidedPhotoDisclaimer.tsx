import {
  GUIDED_PHOTOGRAPHIC_ASSESSMENT_DISCLAIMER_BODY,
  GUIDED_PHOTOGRAPHIC_ASSESSMENT_DISCLAIMER_TITLE,
} from "@/lib/guided-photo-disclaimer";

export function ReportGuidedPhotoDisclaimer({
  className = "",
}: {
  className?: string;
}) {
  return (
    <aside
      className={`report-guided-photo-disclaimer rounded-xl border border-slate-200 bg-slate-50 px-4 py-4 text-left sm:px-5 sm:py-5 ${className}`.trim()}
    >
      <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-800">
        {GUIDED_PHOTOGRAPHIC_ASSESSMENT_DISCLAIMER_TITLE}
      </p>
      <p className="mt-2 text-[11px] leading-relaxed text-slate-600 sm:text-xs">
        {GUIDED_PHOTOGRAPHIC_ASSESSMENT_DISCLAIMER_BODY}
      </p>
    </aside>
  );
}