import { Logo } from "@/components/Logo";

export function ComingSoon() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-ink-950 px-4 py-16 text-center">
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[500px] w-[900px] -translate-x-1/2 rounded-full bg-accent-600/15 blur-[140px]" />
      <div className="pointer-events-none absolute -right-40 top-1/3 h-[400px] w-[400px] rounded-full bg-accent-500/10 blur-[120px]" />

      <div className="relative mx-auto flex w-full max-w-xl flex-col items-center text-center">
        <Logo
          height={64}
          maxWidth="min(340px, 88vw)"
          linked={false}
          priority
          className="sm:!h-[72px] lg:!h-20"
        />
        <p className="mt-10 text-xs font-bold uppercase tracking-[0.25em] text-accent-400 sm:mt-12">
          Launching soon
        </p>
        <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
          Coming soon
        </h1>
        <p className="mt-4 text-base leading-relaxed text-slate-400 sm:text-lg">
          Auto Verifi is on the way — Australia&apos;s smarter car history check
          with past, present and future vehicle insights in one report.
        </p>
        <a
          href="mailto:info@autoverifi.com.au"
          className="mt-8 inline-block text-sm font-medium text-accent-400 transition hover:text-white"
        >
          info@autoverifi.com.au
        </a>
      </div>
    </div>
  );
}
