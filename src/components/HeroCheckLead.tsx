import { RegoSearchForm } from "@/components/RegoSearchForm";

export function HeroCheckLead() {
  return (
    <div className="relative min-w-0 text-center lg:text-left">
      <h1 className="animate-fade-up delay-100 text-3xl font-extrabold leading-[1.08] tracking-tight text-white sm:text-4xl lg:text-[2.5rem] lg:leading-[1.06]">
        <span className="block">Past, Present and</span>
        <span className="block">
          Future insights to <span className="text-accent-500">buy</span>
        </span>
        <span className="block">or sell your next car</span>
        <span className="block">with confidence</span>
      </h1>
      <div className="animate-fade-up delay-300 relative mx-auto mt-6 max-w-xl overflow-visible sm:mt-8 lg:mx-0 lg:mt-10">
        <RegoSearchForm onDark sampleLinks="both" />
      </div>
    </div>
  );
}
