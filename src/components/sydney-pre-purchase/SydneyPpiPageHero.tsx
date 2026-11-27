export function SydneyPpiPageHero({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <section className="relative w-full min-w-0 overflow-hidden border-b border-white/10 bg-black">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_55%_at_50%_-15%,rgba(0,115,227,0.32),transparent_65%)]"
        aria-hidden
      />
      <div className={`sydney-ppi-container relative py-14 sm:py-16 lg:py-20`}>
        <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-accent-400">
          {eyebrow}
        </p>
        <h1 className="mt-4 max-w-3xl text-[clamp(1.9rem,4.5vw,3.25rem)] font-extrabold leading-[1.05] tracking-tight text-white text-balance">
          {title}
        </h1>
        {description ? (
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-400 sm:text-[1.05rem]">
            {description}
          </p>
        ) : null}
      </div>
    </section>
  );
}