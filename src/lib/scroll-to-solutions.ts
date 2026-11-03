import {
  parseSolutionTabFromHash,
  type SolutionTab,
} from "@/content/solutions-hub";

export function scrollToSolutionsSection(behavior: ScrollBehavior = "smooth") {
  const el = document.getElementById("solutions");
  if (!el) return;
  el.scrollIntoView({ behavior, block: "start" });
}

/** Navbar / in-page: open homepage Solutions block on the given tab. */
export function navigateToSolutionsTab(tab: SolutionTab) {
  const hash = `#solutions-${tab}`;

  if (window.location.pathname !== "/") {
    window.location.assign(`/${hash}`);
    return;
  }

  if (window.location.hash !== hash) {
    window.location.hash = hash;
  }

  requestAnimationFrame(() => scrollToSolutionsSection());
}

export function navigateToSolutionsNavHref(href: string, pathname: string) {
  const tab = parseSolutionTabFromHash(href.replace(/^\//, ""));
  if (!tab) return false;

  if (pathname !== "/") {
    return false;
  }

  navigateToSolutionsTab(tab);
  return true;
}
