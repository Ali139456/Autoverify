import { Logo } from "@/components/Logo";

export function ComingSoon() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-ink-950 px-4 py-16 text-center">
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[500px] w-[900px] -translate-x-1/2 rounded-full bg-accent-600/15 blur-[140px]" />
      <div className="pointer-events-none absolute -right-40 top-1/3 h-[400px] w-[400px] rounded-full bg-accent-500/10 blur-[120px]" />

      <div className="relative flex flex-col items-center">
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
      </div>
    </div>
  );
}
