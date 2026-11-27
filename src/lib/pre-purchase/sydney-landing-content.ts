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
    a: "A pre-purchase inspection is an independent, on-site check of a used vehicle before you buy it. An inspector examines the mechanical condition, body and paint, interior, underbody, electronics and compliance details, runs a diagnostic scan and a road test, then provides a written report of everything found.",
  },
  {
    q: "What vehicles do you inspect?",
    a: "We inspect passenger cars and SUVs, light commercial vehicles such as utes, vans and 4WDs, caravans and trailers, and motorcycles and scooters. Each vehicle type follows a checklist specific to its construction and the faults that matter most.",
  },
  {
    q: "How long does an inspection take?",
    a: "Most passenger vehicles take 60 to 90 minutes on site. Light commercial vehicles, caravans and motorcycles can take up to two hours depending on size and access.",
  },
  {
    q: "Do you come to the vehicle?",
    a: "Yes. The inspection happens where the vehicle is stored — the seller's home, a dealership yard, a storage facility or a caravan park. You do not need to move the vehicle or be present.",
  },
  {
    q: "What is included in the report?",
    a: "The report covers body and paint condition, mechanical systems, chassis and suspension, brakes and tyres, interior and electrics, diagnostic fault codes, compliance checks including VIN, PPSR and odometer verification, and the results of a road test. Each finding is graded, photographed and explained in plain English.",
  },
  {
    q: "Can the report help me negotiate the price?",
    a: "Yes. Use our findings to negotiate on the price where any repairs, defects or items for review are identified that could affect the cost of bringing the vehicle to roadworthy or good condition.",
  },
  {
    q: "Do you check for accident damage and odometer tampering?",
    a: "Yes. Paint depth readings expose repaired or replaced panels, underbody inspection looks for structural repair, and we cross-check the odometer against service records and the PPSR report.",
  },
  {
    q: "How much does a pre-purchase inspection cost?",
    a: "All passenger cars and SUVs are a fixed price of $290 incl. GST. Other vehicle types are priced based on size and location, and we will confirm a fixed price before you commit.",
  },
  {
    q: "How soon can you inspect a vehicle?",
    a: "Most inspections are booked within one to two business days, and urgent inspections can often be arranged sooner. Availability depends on the seller's access and your location.",
  },
  {
    q: "What if the seller will not allow an inspection?",
    a: "Treat it as a warning sign. A genuine seller with nothing to hide will usually welcome an independent inspection. If access is refused, we recommend walking away rather than buying blind.",
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