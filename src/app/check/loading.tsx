import { VehicleSearchLoading } from "@/components/VehicleSearchLoading";

export default function CheckRouteLoading() {
  return (
    <div className="min-h-[calc(100vh-6rem)] bg-white dark:bg-ink-950">
      <VehicleSearchLoading />
    </div>
  );
}
