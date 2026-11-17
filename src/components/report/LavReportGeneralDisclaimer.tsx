import { lavGeneralDisclaimerParagraphs } from "@/lib/lav/lav-disclaimer";
import { REPORT_TERMS_URL } from "@/lib/report-disclaimer";

/** General disclaimer copy for LAV reports (no section heading). */
export function LavReportGeneralDisclaimer() {
  const [terms, ...rest] = lavGeneralDisclaimerParagraphs();

  return (
    <section
      className="report-general-disclaimer border-t border-slate-200 pt-5"
      aria-label="General disclaimer"
    >
      <p className="text-[11px] leading-relaxed text-slate-600">
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
        <p
          key={paragraph}
          className="mt-2 text-[11px] leading-relaxed text-slate-600"
        >
          {paragraph}
        </p>
      ))}
    </section>
  );
}