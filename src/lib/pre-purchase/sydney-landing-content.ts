export const SYDNEY_PPI_PHONE = "1300 001 273";
export const SYDNEY_PPI_PHONE_HREF = "tel:1300001273";

export const PPI_VEHICLE_TYPES = [
  {
    id: "passenger",
    eyebrow: "Cars & SUVs",
    title: "Passenger vehicles",
    description:
      "Used cars, demo models and private sales — checked panel by panel.",
    price: 290,
  },
  {
    id: "commercial",
    eyebrow: "Light commercial",
    title: "Utes, vans & 4WDs",
    description: "Work vehicles live harder lives — we check the load-bearing bits.",
    price: 290,
  },
  {
    id: "ev",
    eyebrow: "EVs & hybrids",
    title: "Electric vehicles",
    description:
      "Battery health, charging and high-voltage systems, checked and reported.",
    price: 290,
  },
  {
    id: "caravan",
    eyebrow: "Caravans & trailers",
    title: "Caravans",
    description: "Water ingress and chassis fatigue are the expensive surprises.",
    price: 390,
  },
  {
    id: "motorcycle",
    eyebrow: "Bikes & scooters",
    title: "Motorcycles",
    description:
      "Drop damage, worn forks and hidden frame repairs, found fast.",
    price: 190,
  },
] as const;

export const PPI_INSPECTION_GROUPS = [
  {
    title: "Body & paint",
    items: [
      "Paint depth readings on every panel",
      "Panel gaps and alignment",
      "Rust, corrosion and previous repair",
      "Glass, lights and mirrors",
    ],
  },
  {
    title: "Mechanical",
    items: [
      "Cold start behaviour and engine noise",
      "Cooling system and fluid condition",
      "Transmission, clutch and driveline",
      "Oil leaks and component wear",
      "OBD2 diagnostic scan for stored and pending fault codes",
    ],
  },
  {
    title: "Chassis & suspension",
    items: [
      "Underbody and structural rails",
      "Subframe, bushes and mounts",
      "Shocks, springs and steering play",
      "Exhaust and mounting condition",
    ],
  },
  {
    title: "Brakes & tyres",
    items: [
      "Pad and disc thickness",
      "Brake fluid and line condition",
      "Tyre tread depth and age",
      "Wheel and bearing condition",
    ],
  },
  {
    title: "Interior & electrics",
    items: [
      "Seats, trim and headlining",
      "Seatbelts and airbag warning status",
      "Air conditioning output",
      "Infotainment, cameras and sensors",
    ],
  },
  {
    title: "Diagnostics",
    items: [
      "OBD2 scan of stored and pending codes",
      "Battery and charging health",
      "Module and warning light checks",
    ],
  },
  {
    title: "Compliance & history",
    items: [
      "VIN and engine number verification",
      "PPSR encumbrance check",
      "Odometer consistency with service records",
    ],
  },
  {
    title: "Road test",
    items: [
      "Acceleration through the gears",
      "Braking balance and pedal feel",
      "Tracking, alignment and vibration",
      "Rattles, wind noise and drivetrain sounds",
    ],
  },
] as const;

export const PPI_HOW_IT_WORKS = [
  {
    step: "01",
    title: "Tell us about the vehicle",
    body: "Confirm the details and location of the car you are buying and we will do the rest.",
  },
  {
    step: "02",
    title: "We arrange access",
    body: "We contact the seller, agree a time and confirm the vehicle is available for a cold start.",
  },
  {
    step: "03",
    title: "Inspection on site",
    body: "60 to 120 minutes of mechanical, body, interior and diagnostic checks, including a road test.",
  },
  {
    step: "04",
    title: "Report the same day",
    body: "A photo-backed digital report lands in your inbox with every fault graded and explained.",
  },
] as const;

export const PPI_FAQ = [
  {
    q: "What is a pre-purchase inspection?",
    a: "An independent, on-site check of a used vehicle before you buy. It covers mechanical condition, body and paint, interior, underbody, electronics, compliance items, diagnostic scan and a road test where safe.",
  },
  {
    q: "What vehicles do you inspect?",
    a: "Passenger cars and SUVs, light commercial (utes, vans, 4WDs), caravans and trailers, motorcycles and scooters, plus hybrids and electric vehicles.",
  },
  {
    q: "How long does an inspection take?",
    a: "Most passenger vehicles take 60 to 90 minutes. Commercial vehicles, caravans and motorcycles can take up to two hours.",
  },
  {
    q: "Do you come to the vehicle?",
    a: "Yes. We travel to the seller's home, dealership, storage facility or caravan park across Greater Sydney.",
  },
  {
    q: "What is included in the report?",
    a: "Body and paint, mechanical, chassis, suspension, brakes, tyres, interior, electrics, diagnostic codes, compliance checks (VIN, PPSR, odometer) and road test results. Findings are graded, photographed and explained.",
  },
  {
    q: "Can the report help me negotiate the price?",
    a: "Yes. Findings can support a lower offer where repairs, defects or items for further review are identified.",
  },
] as const;

export const SYDNEY_INSPECTION_AREAS = [
  "Sydney CBD",
  "Inner West",
  "Eastern Suburbs",
  "Northern Beaches",
  "North Shore",
  "Sutherland Shire",
  "Parramatta",
  "The Hills",
  "Western Sydney",
  "South West Sydney",
  "Central Coast",
  "Wollongong",
  "Blue Mountains",
  "Newcastle",
] as const;