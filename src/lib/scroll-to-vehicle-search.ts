export const VEHICLE_SEARCH_INPUT_ID = "vehicle-search-input";

/** Scroll to hero search and focus the rego/VIN field. */
export function scrollToVehicleSearch(): void {
  document.getElementById("check")?.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
  window.setTimeout(() => {
    const input = document.getElementById(
      VEHICLE_SEARCH_INPUT_ID,
    ) as HTMLInputElement | null;
    input?.focus({ preventScroll: true });
  }, 400);
}
