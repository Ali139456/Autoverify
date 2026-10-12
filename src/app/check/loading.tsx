import { VehicleSearchLoading } from "@/components/VehicleSearchLoading";

export default function CheckRouteLoading() {
  return (
    <div className="flex min-h-[calc(100dvh-5.75rem)] w-full flex-col items-center justify-center bg-white px-4 dark:bg-ink-950 sm:min-h-[calc(100vh-6rem)]">
      <VehicleSearchLoading viewportCentered />
    </div>
  );
}
