/** True when running a production Node build (e.g. Vercel production). */
export function isProductionRuntime(): boolean {
  return process.env.NODE_ENV === "production";
}
