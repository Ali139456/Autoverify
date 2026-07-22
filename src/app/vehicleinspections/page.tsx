import type { Metadata } from "next";
import { VehicleInspectionsSite } from "@/components/vehicle-inspections/VehicleInspectionsSite";

export const metadata: Metadata = {
  title: "Vehicle Inspection Services",
  description:
    "Independent special purpose vehicle inspection, motor dealer assessment and expert witness services from Auto Verifi.",
  robots: { index: true, follow: true },
};

export default function VehicleInspectionsPage() {
  return <VehicleInspectionsSite />;
}
