import Link from "next/link";

export type LegalBlock =
  | { type: "paragraph"; text: string }
  | { type: "list"; items: string[] };

export type LegalSection = {
  title: string;
  blocks: LegalBlock[];
};

type LegalDocumentProps = {
  title: string;
  subtitle: string;
  intro: LegalBlock[];
  sections: LegalSection[];
  footerNote?: LegalBlock[];
};

function Block({ block, first }: { block: LegalBlock; first?: boolean }) {
  if (block.type === "list") {
    return (
      <ul
        className={`space-y-2.5 pl-5 text-[15px] leading-7 text-slate-400 marker:text-accent-500/70 sm:text-base ${
          first ? "" : "mt-4"
        }`}
      >
        {block.items.map((item) => (
          <li key={item} className="pl-1">
            {item}
          </li>
        ))}
      </ul>
    );
  }

  return (
    <p
      className={`text-[15px] leading-7 text-slate-400 sm:text-base sm:leading-8 ${
        first ? "" : "mt-4"
      }`}
    >
      {block.text}
    </p>
  );
}

export function LegalDocument({
  title,
  subtitle,
  intro,
  sections,
  footerNote,
}: LegalDocumentProps) {
  return (
    <div className="relative bg-ink-950 pb-16 text-white">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-accent-600/8 to-transparent" />

      <div className="relative px-3 sm:px-6">
        <div className="mx-auto max-w-6xl px-3 py-10 sm:px-4 sm:py-14">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-accent-400">
            {subtitle}
          </p>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-[2.75rem] lg:leading-tight">
            {title}
          </h1>

          <div className="mt-8 border-l-2 border-accent-500/40 pl-5 sm:mt-10 sm:pl-6">
            {intro.map((block, index) => (
              <Block key={`intro-${index}`} block={block} first={index === 0} />
            ))}
          </div>

          <div className="mt-12 space-y-12 sm:mt-16">
            {sections.map((section, sectionIndex) => (
              <section
                key={section.title}
                className={
                  sectionIndex === 0
                    ? undefined
                    : "border-t border-white/[0.06] pt-10"
                }
              >
                <h2 className="text-base font-semibold tracking-tight text-white sm:text-lg">
                  {section.title}
                </h2>
                {section.blocks.map((block, index) => (
                  <Block
                    key={`${section.title}-${index}`}
                    block={block}
                    first={index === 0}
                  />
                ))}
              </section>
            ))}
          </div>

          {footerNote && footerNote.length > 0 && (
            <div className="mt-14 border-t border-accent-500/20 pt-10">
              {footerNote.map((block, index) => (
                <Block
                  key={`footer-${index}`}
                  block={block}
                  first={index === 0}
                />
              ))}
            </div>
          )}

          <div className="mt-14 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-white/[0.06] pt-8 text-sm text-slate-500">
            <Link href="/privacy" className="transition hover:text-accent-400">
              Privacy Policy
            </Link>
            <Link href="/terms" className="transition hover:text-accent-400">
              Terms of Use
            </Link>
            <a
              href="mailto:info@autoverifi.com.au"
              className="transition hover:text-accent-400"
            >
              info@autoverifi.com.au
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
