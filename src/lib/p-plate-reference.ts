export type PPlateReferenceRow = {
  state: string;
  label: string;
  /** When omitted, `label` is shown as plain text (no link). */
  href?: string;
};

/** Official state/territory P-plate vehicle restrictions (information only). */
export const P_PLATE_SECTION_HEADING = "p-plate vehicle restrictions";

export const P_PLATE_REFERENCE_ROWS: PPlateReferenceRow[] = [
  {
    state: "NSW",
    label: "NSW provisional vehicle restrictions",
    href: "https://www.transport.nsw.gov.au/roadsafety/young-drivers/provisional/vehicle-restrictions",
  },
  {
    state: "VIC",
    label: "Victoria safe vehicles search",
    href: "https://vicroadssafevehicles.carsalesnetwork.com.au/#/search",
  },
  {
    state: "QLD",
    label: "Queensland high-powered vehicle check",
    href: "https://www.service.transport.qld.gov.au/hpv/public/Welcome.xhtml",
  },
  {
    state: "SA",
    label: "SA high-powered vehicles check",
    href: "https://account.ezyreg.sa.gov.au/account/check-high-powered-vehicles.htm",
  },
  {
    state: "ACT",
    label:
      "The ACT has no vehicle type or high performance car restrictions for provisional drivers",
  },
  {
    state: "NT",
    label:
      "The Northern Territory (NT) has no vehicle type or high performance car restrictions for provisional drivers",
  },
  {
    state: "TAS",
    label: "Tasmania licence conditions",
    href: "https://www.transport.tas.gov.au/licensing/licence_conditions",
  },
  {
    state: "WA",
    label:
      "WA has no high-performance/power-to-weight vehicle bans or V8 bans for P-platers",
  },
];

export function isPPlateAdvisoryCopy(text: string): boolean {
  return /check state restrictions|check p plate rules|not available — check/i.test(
    text,
  );
}
