import { RegoSearchForm } from "@/components/RegoSearchForm";

export function HeroCheckLead() {
  return (
    <div className="relative min-w-0 text-center lg:text-left">
      <h1 className="animate-fade-up delay-100 text-3xl font-extrabold leading-[1.08] tracking-tight text-white sm:text-4xl lg:text-[2.65rem] lg:leading-[1.06]">
        Past, Present and Future insights to buy your next car with confidence
      </h1>
      <div className="animate-fade-up delay-300 relative mx-auto mt-6 max-w-xl sm:mt-8 lg:mx-0">
        <RegoSearchForm onDark sampleLinks="both" />
      </div>
    </div>
  );
}
