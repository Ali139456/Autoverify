export type NavLinkItem = {
  href: string;
  label: string;
  external?: boolean;
};

export type NavDropdown = {
  type: "dropdown";
  id: string;
  label: string;
  items: NavLinkItem[];
};

export type NavEntry = NavLinkItem | NavDropdown;

export function isNavDropdown(entry: NavEntry): entry is NavDropdown {
  return "type" in entry && entry.type === "dropdown";
}

export const WHATS_INCLUDED_MENU: NavDropdown = {
  type: "dropdown",
  id: "whats-included",
  label: "What's included",
  items: [
    { href: "/#whats-included", label: "Report features" },
    { href: "/pricing", label: "Pricing" },
    { href: "/#faq", label: "FAQ" },
  ],
};

export const SOLUTIONS_MENU: NavDropdown = {
  type: "dropdown",
  id: "solutions",
  label: "Solutions",
  items: [
    { href: "/solutions/consumer", label: "Consumer" },
    { href: "/solutions/dealers", label: "Dealers" },
    { href: "/solutions/government", label: "Government" },
    { href: "/solutions/audit", label: "Audit & consulting" },
  ],
};

export const COMPANY_MENU: NavDropdown = {
  type: "dropdown",
  id: "company",
  label: "Company",
  items: [
    { href: "/about", label: "About us" },
    { href: "/contact", label: "Contact" },
  ],
};

export const MAIN_NAV: NavEntry[] = [
  WHATS_INCLUDED_MENU,
  SOLUTIONS_MENU,
  COMPANY_MENU,
];
