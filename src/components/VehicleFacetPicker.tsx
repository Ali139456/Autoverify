"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { buildCheckUrl } from "@/lib/routes";
import type { AutograbAssetCategory } from "@/lib/autograb-catalogue";

type FacetValue = { value: string; count: number };

type FacetVehicle = {
  id?: string;
  legacy_id?: string;
  title?: string;
  year?: string | number;
  make?: string;
  model?: string;
  badge?: string | null;
};

const selectClass =
  "w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-accent-500 dark:border-white/10 dark:bg-ink-950 dark:text-white";

async function loadFacetValues(
  facet: string,
  filters: Record<string, string>,
  category: AutograbAssetCategory,
): Promise<FacetValue[]> {
  const params = new URLSearchParams({ facet, category, ...filters });
  const res = await fetch(`/api/vehicles/facets?${params.toString()}`);
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error ?? "Could not load vehicle options.");
  }
  const list = data[facet];
  return Array.isArray(list) ? (list as FacetValue[]) : [];
}

export function VehicleFacetPicker({
  category = "conventional",
  rego,
  vin,
  state,
  tier,
}: {
  category?: AutograbAssetCategory;
  rego?: string;
  vin?: string;
  state: string;
  tier?: "insights" | "insights_plus";
}) {
  const router = useRouter();
  const [make, setMake] = useState("");
  const [year, setYear] = useState("");
  const [model, setModel] = useState("");
  const [badge, setBadge] = useState("");
  const [makes, setMakes] = useState<FacetValue[]>([]);
  const [years, setYears] = useState<FacetValue[]>([]);
  const [models, setModels] = useState<FacetValue[]>([]);
  const [badges, setBadges] = useState<FacetValue[]>([]);
  const [vehicles, setVehicles] = useState<FacetVehicle[]>([]);
  const [loading, setLoading] = useState<"makes" | "search" | null>("makes");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading("makes");
    setError(null);
    loadFacetValues("make", {}, category)
      .then((values) => {
        if (!cancelled) setMakes(values);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Could not load makes.",
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(null);
      });
    return () => {
      cancelled = true;
    };
  }, [category]);

  useEffect(() => {
    if (!make) {
      setYears([]);
      setYear("");
      return;
    }
    let cancelled = false;
    setLoading("makes");
    loadFacetValues("year", { make }, category)
      .then((values) => {
        if (!cancelled) setYears(values);
      })
      .catch(() => {
        if (!cancelled) setYears([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(null);
      });
    return () => {
      cancelled = true;
    };
  }, [make, category]);

  useEffect(() => {
    if (!make || !year) {
      setModels([]);
      setModel("");
      return;
    }
    let cancelled = false;
    loadFacetValues("model", { make, year }, category)
      .then((values) => {
        if (!cancelled) setModels(values);
      })
      .catch(() => {
        if (!cancelled) setModels([]);
      });
    return () => {
      cancelled = true;
    };
  }, [make, year, category]);

  useEffect(() => {
    if (!make || !year || !model) {
      setBadges([]);
      setBadge("");
      setVehicles([]);
      return;
    }
    let cancelled = false;
    loadFacetValues("badge", { make, year, model }, category)
      .then((values) => {
        if (!cancelled) setBadges(values);
      })
      .catch(() => {
        if (!cancelled) setBadges([]);
      });
    return () => {
      cancelled = true;
    };
  }, [make, year, model, category]);

  const runSearch = useCallback(async () => {
    if (!make || !year || !model) return;
    setLoading("search");
    setError(null);
    try {
      const params = new URLSearchParams({
        category,
        make,
        year,
        model,
        ...(badge ? { badge } : {}),
      });
      const res = await fetch(`/api/vehicles/facets/search?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? data.message ?? "Search failed.");
      }
      const list = Array.isArray(data.vehicles)
        ? (data.vehicles as FacetVehicle[])
        : [];
      setVehicles(list);
      if (list.length === 0) {
        setError("No matching vehicles. Try a different badge or model.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Search failed.");
      setVehicles([]);
    } finally {
      setLoading(null);
    }
  }, [badge, category, make, model, year]);

  useEffect(() => {
    if (make && year && model && (badges.length === 0 || badge)) {
      void runSearch();
    }
  }, [badge, badges.length, make, model, runSearch, year]);

  function onSelectVehicle(vehicle: FacetVehicle) {
    const catalogueVehicleId =
      vehicle.id?.trim() || vehicle.legacy_id?.trim();
    if (!catalogueVehicleId) {
      setError("This vehicle could not be selected. Try another match.");
      return;
    }
    router.push(
      buildCheckUrl({
        rego,
        vin,
        state,
        tier,
        category,
        catalogueVehicleId,
      }),
    );
  }

  return (
    <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5 text-left dark:border-white/10 dark:bg-ink-900/50">
      <p className="text-sm font-semibold text-slate-900 dark:text-white">
        Select your vehicle manually
      </p>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
        Choose make, year, model, and badge to find the correct car in our
        catalogue.
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-slate-700 dark:text-slate-300">
            Make
          </span>
          <select
            className={selectClass}
            value={make}
            onChange={(e) => {
              setMake(e.target.value);
              setYear("");
              setModel("");
              setBadge("");
            }}
          >
            <option value="">Select make</option>
            {makes.map((item) => (
              <option key={item.value} value={item.value}>
                {item.value}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-sm">
          <span className="mb-1 block font-medium text-slate-700 dark:text-slate-300">
            Year
          </span>
          <select
            className={selectClass}
            value={year}
            disabled={!make}
            onChange={(e) => {
              setYear(e.target.value);
              setModel("");
              setBadge("");
            }}
          >
            <option value="">Select year</option>
            {years.map((item) => (
              <option key={item.value} value={item.value}>
                {item.value}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-sm">
          <span className="mb-1 block font-medium text-slate-700 dark:text-slate-300">
            Model
          </span>
          <select
            className={selectClass}
            value={model}
            disabled={!year}
            onChange={(e) => {
              setModel(e.target.value);
              setBadge("");
            }}
          >
            <option value="">Select model</option>
            {models.map((item) => (
              <option key={item.value} value={item.value}>
                {item.value}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-sm">
          <span className="mb-1 block font-medium text-slate-700 dark:text-slate-300">
            Badge / variant
          </span>
          <select
            className={selectClass}
            value={badge}
            disabled={!model || badges.length === 0}
            onChange={(e) => setBadge(e.target.value)}
          >
            <option value="">
              {badges.length ? "Select badge (optional)" : "Any badge"}
            </option>
            {badges.map((item) => (
              <option key={item.value} value={item.value}>
                {item.value}
              </option>
            ))}
          </select>
        </label>
      </div>

      {(loading === "makes" || loading === "search") && (
        <p className="mt-4 flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          Loading options…
        </p>
      )}

      {error ? (
        <p className="mt-4 text-sm font-medium text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      ) : null}

      {vehicles.length > 0 ? (
        <ul className="mt-4 space-y-2">
          {vehicles.map((vehicle) => {
            const key = vehicle.id ?? vehicle.title ?? Math.random().toString();
            return (
              <li key={key}>
                <button
                  type="button"
                  onClick={() => onSelectVehicle(vehicle)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-left text-sm transition hover:border-accent-500 hover:bg-accent-50/50 dark:border-white/10 dark:bg-ink-950 dark:hover:border-accent-500/50"
                >
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {vehicle.title ??
                      `${vehicle.year ?? ""} ${vehicle.make ?? ""} ${vehicle.model ?? ""}`.trim()}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
