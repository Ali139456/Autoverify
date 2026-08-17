import { Logo } from "@/components/Logo";

export function ComingSoon() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-ink-950 px-4 py-16 text-center">
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[500px] w-[900px] -translate-x-1/2 rounded-full bg-accent-600/15 blur-[140px]" />
      <div className="pointer-events-none absolute -right-40 top-1/3 h-[400px] w-[400px] rounded-full bg-accent-500/10 blur-[120px]" />

      <div className="relative flex flex-col items-center">
        <Logo
          height={120}
          maxWidth="min(480px, 92vw)"
          linked={false}
          priority
          className="h-28 sm:h-32 lg:h-36"
        />
        <p className="mt-12 text-base font-bold uppercase tracking-[0.3em] text-accent-400 sm:mt-14 sm:text-lg lg:mt-16 lg:text-xl">
          Launching soon
        </p>
      </div>
    </div>
  );
}
