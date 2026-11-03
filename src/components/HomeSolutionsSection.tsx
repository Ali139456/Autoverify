"use client";

import { useCallback, useEffect, useState } from "react";
import { Reveal } from "@/components/Reveal";
import {
  SolutionsTabContent,
  SolutionsTabNav,
} from "@/components/solutions/solution-shared";
import {
  isSolutionTab,
  parseSolutionTabFromHash,
  type SolutionTab,
} from "@/content/solutions-hub";
import { scrollToSolutionsSection } from "@/lib/scroll-to-solutions";

function tabFromLocation(): SolutionTab | null {
  if (typeof window === "undefined") return null;
  const fromHash = parseSolutionTabFromHash(window.location.hash);
  if (fromHash) return fromHash;
  const query = new URLSearchParams(window.location.search).get("solutions");
  if (query && isSolutionTab(query)) return query;
  return null;
}

export function HomeSolutionsSection({
  initialTab,
}: {
  initialTab?: SolutionTab;
}) {
  const [activeTab, setActiveTab] = useState<SolutionTab>(
    initialTab ?? "consumer",
  );

  const syncFromUrl = useCallback((scroll: boolean) => {
    const tab = tabFromLocation();
    if (tab) {
      setActiveTab(tab);
      if (!window.location.hash) {
        window.history.replaceState(null, "", `/#solutions-${tab}`);
      }
    }
    if (scroll && tab) {
      requestAnimationFrame(() => scrollToSolutionsSection());
    }
  }, []);

  useEffect(() => {
    syncFromUrl(true);
    const onHashChange = () => syncFromUrl(true);
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, [syncFromUrl]);

  useEffect(() => {
    if (!initialTab) return;
    setActiveTab(initialTab);
    requestAnimationFrame(() => scrollToSolutionsSection());
  }, [initialTab]);

  const handleTabChange = (tab: SolutionTab) => {
    setActiveTab(tab);
    window.history.replaceState(null, "", `/#solutions-${tab}`);
  };

  return (
    <section
      id="solutions"
      className="relative scroll-mt-24 overflow-x-clip border-t border-white/10 bg-ink-950 py-12 text-white sm:py-16 lg:py-20"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_0%,rgba(0,115,227,0.18),transparent)]"
        aria-hidden
      />

      <div className="av-site-container relative">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-accent-400">
            Solutions
          </p>
          <h2 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
            Past, present and future{" "}
            <span className="text-accent-500">vehicle intelligence</span>
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-slate-400 sm:text-base">
            For consumers, businesses and platforms across the automotive
            ecosystem.
          </p>
        </Reveal>

        <Reveal delay={100} className="mt-8 flex justify-center sm:mt-10">
          <SolutionsTabNav
            activeTab={activeTab}
            onTabChange={handleTabChange}
          />
        </Reveal>

        <Reveal delay={150} className="mt-10 sm:mt-12">
          <SolutionsTabContent activeTab={activeTab} />
        </Reveal>
      </div>
    </section>
  );
}
