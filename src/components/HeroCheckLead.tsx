import { RegoSearchForm } from "@/components/RegoSearchForm";

export function HeroCheckLead() {
  return (
    <div className="relative min-w-0 text-center lg:text-left">
      <h1 className="animate-fade-up delay-100 text-4xl font-extrabold leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl">
        Know what
        <br />
        you&apos;re buying.
      </h1>
      <p className="text-gradient-blue animate-fade-up delay-200 mt-3 text-2xl font-extrabold tracking-tight sm:mt-4 sm:text-3xl lg:text-4xl">
        Past, Present and Future insights to buy with confidence
      </p>
      <div className="animate-fade-up delay-300 relative mx-auto mt-6 max-w-md sm:mt-8 lg:mx-0">
        <RegoSearchForm onDark />
      </div>
    </div>
  );
}
