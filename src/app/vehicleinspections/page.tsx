import type { Metadata } from "next";
import { VehicleInspectionsEmbed } from "@/components/vehicle-inspections/VehicleInspectionsEmbed";
import { VehicleInspectionsSite } from "@/components/vehicle-inspections/VehicleInspectionsSite";
import { getVehicleInspectionsEmbedUrl } from "@/lib/vehicle-inspections";

export const metadata: Metadata = {
  title: "Vehicle Inspection Services",
  description:
    "Independent special purpose vehicle inspection, motor dealer assessment and expert witness services from Auto Verifi.",
  robots: { index: true, follow: true },
};

export default function VehicleInspectionsPage() {
  const embedUrl = getVehicleInspectionsEmbedUrl();

  if (embedUrl) {
    return <VehicleInspectionsEmbed src={embedUrl} />;
  }

  return <VehicleInspectionsSite />;
}
