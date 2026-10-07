import {
  REPORT_GENERAL_DISCLAIMER_PARAGRAPHS,
  REPORT_GENERAL_DISCLAIMER_TITLE,
  REPORT_TERMS_URL,
} from "@/lib/report-disclaimer";

/** General disclaimer block rendered at the end of the last report page (before PPSR). */
export function ReportGeneralDisclaimer() {
  const [terms, ...rest] = REPORT_GENERAL_DISCLAIMER_PARAGRAPHS;

  return (
    <section
      className="report-general-disclaimer border-t border-slate-200 pt-5"
      aria-label={REPORT_GENERAL_DISCLAIMER_TITLE}
    >
      <h3 className="text-xs font-bold uppercase tracking-wide text-slate-900">
        {REPORT_GENERAL_DISCLAIMER_TITLE}
      </h3>
      <p className="mt-2 text-[11px] leading-relaxed text-slate-600">
        {terms}{" "}
        (
        <a
          href={REPORT_TERMS_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-[#0073E3] underline underline-offset-2"
        >
          {REPORT_TERMS_URL}
        </a>
        ).
      </p>
      {rest.map((paragraph) => (
        <p key={paragraph} className="mt-2 text-[11px] leading-relaxed text-slate-600">
          {paragraph}
        </p>
      ))}
    </section>
  );
}
