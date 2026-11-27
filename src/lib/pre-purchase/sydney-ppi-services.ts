import type { PpiVehicleCategory } from "./vehicle-pricing";

export type SydneyPpiService = {
  slug: string;
  categoryId: PpiVehicleCategory;
  label: string;
  eyebrow: string;
  heading: string;
  card: string;
  priceLabel: string;
  priceAud: number;
  /** Optional booking dropdown suffix (Base44). */
  priceNote?: string;
  intro: string;
  focus: string[];
  bestFor: string;
};

export const SYDNEY_PPI_SERVICES: SydneyPpiService[] = [
  {
    slug: "cars",
    categoryId: "passenger",
    label: "Passenger vehicles",
    eyebrow: "Cars & SUVs",
    heading: "Pre-purchase inspection for cars and SUVs",
    card: "Used cars, demo models and private sales — checked panel by panel. $290 incl. GST.",
    priceLabel: "$290 incl. GST",
    priceAud: 290,
    intro:
      "A used car listing hides more than the photos show: fresh paint over a repaired panel, a gearbox that only slips once it is warm, a logbook that does not match the odometer. We inspect the car where it is parked and give you the facts before you transfer a deposit.",
    focus: [
      "Paint depth readings to expose repaired or replaced panels",
      "OBD2 scan for stored, pending and recently cleared fault codes",
      "Engine, transmission and driveline behaviour on a road test",
      "Underbody, suspension, steering, brakes and tyre wear",
      "Interior, electrics, air conditioning and safety systems",
    ],
    bestFor:
      "Private sellers, dealership used stock, interstate purchases and auction cars.",
  },
  {
    slug: "light-commercial",
    categoryId: "commercial",
    label: "Utes, vans & 4WDs",
    eyebrow: "Light commercial",
    heading: "Pre-purchase inspection for utes, vans and light commercial",
    card: "Work vehicles live harder lives — we check the load-bearing bits.",
    priceLabel: "$290 incl. GST",
    priceAud: 290,
    intro:
      "A work vehicle can look tidy at 200,000 km and still be one failed turbo away from a five-figure bill. We focus on the parts that carry the load: chassis, mounts, cooling, diesel systems and the service history behind the odometer.",
    focus: [
      "Chassis rails, tray mounts, tow bars and body mounts",
      "Diesel health: turbo, injectors, DPF and EGR condition",
      "Suspension and springs matched to the vehicle's rated load",
      "Gearbox, clutch, transfer case and 4WD engagement",
      "Service history, odometer verification and fault codes",
    ],
    bestFor: "Tradies, fleets, camper conversions and 4WD tourers.",
  },
  {
    slug: "electric-vehicles",
    categoryId: "ev",
    label: "Electric vehicles",
    eyebrow: "EVs & hybrids",
    heading: "Pre-purchase inspection for electric vehicles",
    card: "Battery health, charging and high-voltage systems, checked and reported.",
    priceLabel: "$290 incl. GST",
    priceAud: 290,
    priceNote: "+$250 EV battery health check",
    intro:
      "An EV can look immaculate and still hide an ageing battery or a charging fault that costs thousands. We check the high-voltage battery, charging systems and the parts that wear differently on an electric drivetrain, then tell you what it means before you buy.",
    focus: [
      "High-voltage battery state of health and cell balance",
      "Charging port, onboard charger and charge cable condition",
      "Diagnostic scan for battery, inverter and motor fault codes",
      "Brakes, suspension and tyres, which wear faster on heavy EVs",
      "Software, warning lights, cooling system and warranty status",
    ],
    bestFor:
      "Used EVs, plug-in hybrids, ex-lease and imported electric vehicles.",
  },
  {
    slug: "caravans",
    categoryId: "caravan",
    label: "Caravans",
    eyebrow: "Caravans & trailers",
    heading: "Pre-purchase inspection for caravans and trailers",
    card: "Water ingress and chassis fatigue are the expensive surprises.",
    priceLabel: "$390 incl. GST",
    priceAud: 390,
    intro:
      "Caravan faults hide in the seams. A van that presents beautifully can have soft flooring from a failed seal, a bent A-frame or brakes that will not stop it on a descent. We inspect the structure, the running gear and the systems that keep you safe on the road.",
    focus: [
      "Chassis, A-frame, welds and drawbar coupling",
      "Water ingress, sealant, floor and wall delamination",
      "Brakes, breakaway system, axles, bearings and tyres",
      "Gas, 12V, plumbing and appliance operation",
      "TARE, ATM and compliance plate verification",
    ],
    bestFor:
      "Second-hand vans, off-road models, camper trailers and horse floats.",
  },
  {
    slug: "motorcycles",
    categoryId: "motorcycle",
    label: "Motorcycles",
    eyebrow: "Bikes & scooters",
    heading: "Pre-purchase inspection for motorcycles and scooters",
    card: "Drop damage, worn forks and hidden frame repairs, found fast.",
    priceLabel: "$190 incl. GST",
    priceAud: 190,
    intro:
      "Bikes are easy to dress up and hard to read from a photo. A new set of fairings can cover a bent fork leg or a straightened frame. We check the things a seller cannot hide, and tell you what it will cost to put right.",
    focus: [
      "Frame, steering head and fork alignment for drop damage",
      "Fork seals, shock condition, swingarm and linkages",
      "Chain, sprockets, brake discs and pad thickness",
      "Tyre tread and manufacture dates",
      "Engine noise, electrics, warning lights and VIN matching",
    ],
    bestFor: "LAMS bikes, sports bikes, tourers, adventure bikes and scooters.",
  },
];

const BY_SLUG = new Map(SYDNEY_PPI_SERVICES.map((s) => [s.slug, s]));

export function getSydneyPpiService(slug: string): SydneyPpiService | undefined {
  return BY_SLUG.get(slug.trim().toLowerCase());
}

export function listSydneyPpiServiceSlugs(): string[] {
  return SYDNEY_PPI_SERVICES.map((s) => s.slug);
}

/** Short FAQ block on each service page (Base44). */
export const SYDNEY_PPI_SERVICE_FAQ = [
  {
    q: "What is a pre-purchase inspection?",
    a: "A pre-purchase inspection is an independent, on-site check of a used vehicle before you buy it. An inspector examines the mechanical condition, body and paint, interior, underbody, electronics and compliance details, runs a diagnostic scan and a road test, then provides a written report of everything found.",
  },
  {
    q: "How long does an inspection take?",
    a: "Most passenger vehicles take 60 to 90 minutes on site. Light commercial vehicles, caravans and motorcycles can take up to two hours depending on size and access.",
  },
  {
    q: "What is included in the report?",
    a: "The report covers body and paint condition, mechanical systems, chassis and suspension, brakes and tyres, interior and electrics, diagnostic fault codes, compliance checks including VIN, PPSR and odometer verification, and the results of a road test. Each finding is graded, photographed and explained in plain English.",
  },
  {
    q: "How much does a pre-purchase inspection cost?",
    a: "All passenger cars and SUVs are a fixed price of $290 incl. GST. Other vehicle types are priced based on size and location, and we will confirm a fixed price before you commit.",
  },
] as const;