import {
  FACTORY_EQUIPMENT_COLUMNS,
  factoryEquipmentRows,
  factoryFeatureCellKey,
} from "@/lib/factory-equipment-layout";
import type { VehicleFactoryFeature } from "@/lib/types";

export function FactoryEquipmentGrid({
  features,
}: {
  features: VehicleFactoryFeature[];
}) {
  const rows = factoryEquipmentRows(features, FACTORY_EQUIPMENT_COLUMNS);

  return (
    <div className="report-spec-factory-grid mt-3 overflow-hidden rounded-lg border border-slate-200 bg-white">
      {rows.map((row, rowIndex) => (
        <div
          key={`factory-row-${rowIndex}`}
          className="report-spec-factory-grid-row grid grid-cols-3 border-t border-slate-200 first:border-t-0"
        >
          {Array.from({ length: FACTORY_EQUIPMENT_COLUMNS }, (_, colIndex) => {
            const feature = row[colIndex];
            return (
              <div
                key={`factory-cell-${rowIndex}-${colIndex}`}
                className="report-spec-factory-grid-cell border-r border-slate-200 px-2.5 py-1.5 text-sm text-slate-700 last:border-r-0 sm:px-3 sm:py-2"
              >
                {feature ? (
                  <span className="block leading-snug">
                    {feature.label}
                    {feature.code ? (
                      <span className="ml-1 text-xs text-slate-400">
                        ({feature.code})
                      </span>
                    ) : null}
                  </span>
                ) : (
                  <span className="block min-h-[1.25em]" aria-hidden />
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

export function FactoryEquipmentGridFromFeatures({
  features,
}: {
  features: VehicleFactoryFeature[];
}) {
  if (features.length === 0) {
    return (
      <p className="mt-3 rounded-xl border border-dashed border-slate-200 p-4 text-sm text-slate-500">
        No factory option list was returned for this vehicle.
      </p>
    );
  }
  return <FactoryEquipmentGrid features={features} />;
}
