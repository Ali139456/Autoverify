export type PPlateReferenceRow = {
  state: string;
  label: string;
  href: string;
};

/** Official state/territory P-plate vehicle and licence references (information only). */
export const P_PLATE_REFERENCE_ROWS: PPlateReferenceRow[] = [
  {
    state: "NSW",
    label: "NSW P1/P2 Prohibited Vehicle Search",
    href: "https://roads-waterways.transport.nsw.gov.au/roads/licence/driver/p1-p2-prohibited-vehicles.html",
  },
  {
    state: "Victoria",
    label: "Victoria Probationary Vehicle Database / Rules",
    href: "https://www.vicroads.vic.gov.au/licences/your-ps/prohibited-vehicles",
  },
  {
    state: "Queensland",
    label: "Queensland P1/P2 High-Powered Vehicle Rules & Check",
    href: "https://www.tmr.qld.gov.au/Licensing/Learning-to-drive/P1-and-P2-provisional-licences/High-powered-vehicle-restrictions",
  },
  {
    state: "South Australia",
    label: "SA P1 Provisional Licence / High-Powered Vehicle Rules",
    href: "https://www.mylicence.sa.gov.au/gls/p1-provisional-licence/high-powered-vehicle-restrictions",
  },
  {
    state: "ACT",
    label: "Access Canberra Driver Licence Information",
    href: "https://www.accesscanberra.act.gov.au/s/article/driver-licence-information-det-2661",
  },
  {
    state: "Northern Territory",
    label: "NT Driver Licence Information",
    href: "https://nt.gov.au/driving/driver-licence",
  },
  {
    state: "Tasmania",
    label: "Tasmania Licence Conditions",
    href: "https://www.transport.tas.gov.au/licensing/licence_conditions",
  },
  {
    state: "Western Australia",
    label: "WA Driving on Your P Plates",
    href: "https://www.transport.wa.gov.au/licensing/driving-on-your-p-plates.asp",
  },
];

export function isPPlateAdvisoryCopy(text: string): boolean {
  return /check state restrictions|check p plate rules|not available — check/i.test(
    text,
  );
}
