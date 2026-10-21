/** Homepage vehicle search section — use `#check` on `/`, `/#check` elsewhere. */
export function homeCheckHref(pathname: string): string {
  return pathname === "/" ? "#check" : "/#check";
}

export function buildCheckUrl(params: {
  rego?: string;
  vin?: string;
  state?: string;
  tier?: "insights" | "insights_plus";
  category?: string;
  catalogueVehicleId?: string;
}): string {
  const search = new URLSearchParams();
  if (params.vin) search.set("vin", params.vin);
  else if (params.rego) search.set("rego", params.rego);
  if (params.state) search.set("state", params.state);
  if (params.tier === "insights_plus") search.set("tier", "insights_plus");
  if (params.category) search.set("category", params.category);
  if (params.catalogueVehicleId) {
    search.set("vehicleId", params.catalogueVehicleId);
  }
  const qs = search.toString();
  return qs ? `/check?${qs}` : "/check";
}
