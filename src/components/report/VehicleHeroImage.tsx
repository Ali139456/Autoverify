import { VEHICLE_HERO_IMAGE_DISCLAIMER } from "@/lib/vehicle-hero-image";
import type { VehicleIdentity } from "@/lib/types";

export function VehicleHeroImage({
  vehicle,
  vehicleTitle,
  className = "",
  imageClassName,
}: {
  vehicle: VehicleIdentity;
  vehicleTitle: string;
  className?: string;
  imageClassName?: string;
}) {
  const disclaimer =
    vehicle.heroImageDisclaimer ?? VEHICLE_HERO_IMAGE_DISCLAIMER;
  const defaultImgClass =
    "absolute inset-0 h-full w-full min-h-full min-w-full object-cover object-center";
  const imgClass = imageClassName ?? defaultImgClass;
  const cropLetterbox =
    vehicle.heroImageKind === "stock" ||
    vehicle.heroImageKind === "generated" ||
    Boolean(vehicle.heroImageUrl?.includes("/sample/"));

  return (
    <div className={`${className} overflow-hidden`}>
      {vehicle.heroImageUrl ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={vehicle.heroImageUrl}
            alt={`${vehicleTitle} reference photo`}
            className={imgClass}
            style={
              cropLetterbox
                ? {
                    transform: "scale(1.1)",
                    transformOrigin: "center center",
                  }
                : undefined
            }
          />
          <p className="absolute bottom-0 left-0 right-0 z-10 bg-black/55 px-3 py-1.5 text-[10px] leading-snug text-white">
            *{disclaimer}
          </p>
        </>
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-slate-800 to-slate-950 px-4 text-center">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
            {vehicle.make} {vehicle.model}
          </p>
          <p className="mt-1 text-lg font-bold text-white">{vehicle.year}</p>
          {vehicle.colour ? (
            <p className="mt-1 text-xs font-semibold uppercase text-slate-300">
              {vehicle.colour}
            </p>
          ) : null}
          <p className="mt-2 text-[11px] text-slate-400">
            No reference photo available for this vehicle
          </p>
        </div>
      )}
    </div>
  );
}
