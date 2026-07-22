import type { Metadata } from "next";
import { VehicleInspectionsEmbed } from "@/components/VehicleInspectionsEmbed";
import {
  getVehicleInspectionsUrl,
  isDefaultBase44PreviewUrl,
} from "@/lib/vehicle-inspections";

export const metadata: Metadata = {
  title: "Vehicle Inspections",
  description:
    "Auto Verifi vehicle inspections portal for government and fleet procurement.",
  robots: { index: true, follow: true },
};

export default function VehicleInspectionsPage() {
  const src = getVehicleInspectionsUrl();

  return (
    <VehicleInspectionsEmbed
      src={src}
      showPreviewNotice={isDefaultBase44PreviewUrl(src)}
    />
  );
}
