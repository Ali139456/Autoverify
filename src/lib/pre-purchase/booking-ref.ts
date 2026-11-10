export function allocatePrePurchaseBookingRef(): string {
  const day = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const suffix = Math.floor(1000 + Math.random() * 9000);
  return `PPI-${day}-${suffix}`;
}
