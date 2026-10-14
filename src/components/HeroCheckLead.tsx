import { RegoSearchForm } from "@/components/RegoSearchForm";

export function HeroCheckLead() {
  return (
    <div className="relative min-w-0 text-center lg:text-left">
      <h1 className="animate-fade-up delay-100 text-4xl font-extrabold leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl">
        Past, Present and Future insights to buy your next car with confidence
      </h1>
      <div className="animate-fade-up delay-300 relative mx-auto mt-6 max-w-xl sm:mt-8 lg:mx-0">
        <RegoSearchForm onDark sampleLinks="both" />
      </div>
    </div>
  );
}
