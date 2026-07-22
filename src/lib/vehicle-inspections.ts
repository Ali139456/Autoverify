const DEFAULT_BASE44_URL =
  "https://app.base44.com/apps/6a5d54dd7fef6401ded98b1a/preview";

/** Public Base44 app URL (your *.base44.app link after Publish). */
export function getVehicleInspectionsUrl(): string {
  return (
    process.env.NEXT_PUBLIC_BASE44_VEHICLE_INSPECTIONS_URL?.trim() ||
    DEFAULT_BASE44_URL
  );
}

export function isDefaultBase44PreviewUrl(url: string): boolean {
  return url.includes("/editor/preview") || url.endsWith("/preview");
}
