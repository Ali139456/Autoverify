import { VehicleSearchLoading } from "@/components/VehicleSearchLoading";

export default function CheckRouteLoading() {
  return (
    <div className="flex min-h-[calc(100vh-6rem)] w-full items-center justify-center bg-white dark:bg-ink-950">
      <VehicleSearchLoading />
    </div>
  );
}
