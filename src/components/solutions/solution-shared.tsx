import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Building2,
  Car,
  CarFront,
  Gauge,
  KeyRound,
  Landmark,
  ShieldCheck,
  ShoppingCart,
  Smartphone,
  Store,
  Tag,
  Users,
  type LucideIcon,
} from "lucide-react";
import {
  BUSINESS_OFFERINGS,
  CONSUMER_OFFERINGS,
  INTEGRATIONS_CONTENT,
  SOLUTION_TABS,
  type SolutionOfferingCard,
  type SolutionTab,
} from "@/content/solutions-hub";

export const CONSUMER_ICONS: Record<string, LucideIcon> = {
  buy: ShoppingCart,
  sell: Tag,
  own: Car,
};

export const BUSINESS_ICONS: Record<string, LucideIcon> = {
  marketplace: Store,
  lender: Landmark,
  dealer: CarFront,
  "ride-share": Smartphone,
  insurance: ShieldCheck,
  "car-rental": KeyRound,
  "car-share": Gauge,
  fmo: Building2,
};

export function enquireHref(title: string) {
  const message = encodeURIComponent(`Enquiry about ${title}`);
  return `/contact?subject=${encodeURIComponent("Partnership or business")}&message=${message}`;
}

function SolutionCard({
  card,
  icon: Icon,
}: {
  card: SolutionOfferingCard;
  icon: LucideIcon;
}) {
  return (
    <article className="flex h-full flex-col rounded-2xl border border-white/10 bg-[#0a1230]/90 p-6 sm:p-7">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent-500/15 text-accent-400">
        <Icon className="h-5 w-5" aria-hidden />
      </div>
      <h3 className="mt-5 text-xl font-bold text-white">{card.title}</h3>
      <p className="mt-3 text-sm leading-relaxed text-slate-400">
        {card.description}
      </p>
      <ul className="mt-5 flex-1 list-none space-y-2 p-0">
        {card.bullets.map((item) => (
          <li
            key={item}
            className="flex gap-2 text-sm leading-snug text-accent-300/95"
          >
            <span
              className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent-500"
              aria-hidden
            />
            {item}
          </li>
        ))}
      </ul>
      <Link
        href={enquireHref(card.title)}
        className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-full bg-accent-500 px-5 py-3 text-sm font-bold text-white transition hover:bg-accent-600"
      >
        Enquire
        <ArrowRight className="h-4 w-4" aria-hidden />
      </Link>
    </article>
  );
}

function OfferingGrid({
  cards,
  icons,
  columns,
}: {
  cards: SolutionOfferingCard[];
  icons: Record<string, LucideIcon>;
  columns: "three" | "business";
}) {
  const gridClass =
    columns === "three"
      ? "grid gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6"
      : "grid gap-5 sm:grid-cols-2 lg:gap-6 xl:grid-cols-3";

  return (
    <div className={gridClass}>
      {cards.map((card) => (
        <SolutionCard
          key={card.id}
          card={card}
          icon={icons[card.id] ?? Users}
        />
      ))}
    </div>
  );
}

export function IntegrationsPanel() {
  const { eyebrow, title, intro, ecosystemImage } = INTEGRATIONS_CONTENT;

  return (
    <div className="space-y-10 text-center sm:space-y-12">
      <div className="mx-auto max-w-4xl px-1">
        <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-accent-400">
          {eyebrow}
        </p>
        <h3 className="mt-4 text-2xl font-extrabold tracking-tight text-white sm:text-3xl lg:text-[2.75rem] lg:leading-tight">
          {title}
        </h3>
        <p className="mx-auto mt-4 max-w-3xl text-base leading-relaxed text-slate-300 sm:text-lg">
          {intro}
        </p>
      </div>

      <div className="mx-auto w-full max-w-md px-2 sm:max-w-lg md:max-w-xl lg:max-w-2xl">
        <Image
          src={ecosystemImage}
          alt="Auto Verifi vehicle intelligence hub connected to marketplaces, lenders, insurers, dealers, auction houses, rental, car share and ride share"
          width={900}
          height={900}
          sizes="(max-width: 640px) 88vw, (max-width: 1024px) 512px, 672px"
          className="mx-auto h-auto w-full object-contain"
        />
      </div>

      <div className="flex flex-wrap justify-center gap-3">
        <Link
          href={enquireHref("Integrations")}
          className="inline-flex items-center gap-2 rounded-full bg-accent-500 px-6 py-3 text-sm font-bold text-white transition hover:bg-accent-600"
        >
          Enquire about integrations
          <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      </div>
    </div>
  );
}

export function SolutionsTabNav({
  activeTab,
  onTabChange,
}: {
  activeTab: SolutionTab;
  onTabChange: (tab: SolutionTab) => void;
}) {
  const baseClass =
    "rounded-full px-5 py-2.5 text-sm font-semibold transition sm:px-6";
  const activeClass =
    "bg-accent-500 text-white shadow-[0_0_24px_rgba(0,115,227,0.35)]";
  const inactiveClass =
    "text-slate-300 hover:bg-white/5 hover:text-white";

  return (
    <nav
      className="inline-flex flex-wrap gap-1 rounded-full border border-white/10 bg-[#0a1230]/80 p-1"
      aria-label="Solutions audience"
    >
      {SOLUTION_TABS.map((tab) => {
        const isActive = tab.slug === activeTab;
        const className = `${baseClass} ${isActive ? activeClass : inactiveClass}`;

        return (
          <button
            key={tab.slug}
            type="button"
            aria-current={isActive ? "page" : undefined}
            onClick={() => onTabChange(tab.slug)}
            className={className}
          >
            {tab.label}
          </button>
        );
      })}
    </nav>
  );
}

export function SolutionsTabContent({ activeTab }: { activeTab: SolutionTab }) {
  if (activeTab === "consumer") {
    return (
      <OfferingGrid
        cards={CONSUMER_OFFERINGS}
        icons={CONSUMER_ICONS}
        columns="three"
      />
    );
  }
  if (activeTab === "business") {
    return (
      <OfferingGrid
        cards={BUSINESS_OFFERINGS}
        icons={BUSINESS_ICONS}
        columns="business"
      />
    );
  }
  return <IntegrationsPanel />;
}
