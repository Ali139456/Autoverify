export function VehicleSearchLoading({
  embedded = false,
}: {
  /** When true, omit outer min-height (used over the search form). */
  embedded?: boolean;
}) {
  return (
    <div
      className={
        embedded
          ? "flex w-full flex-col items-center justify-center px-4 py-10"
          : "flex w-full min-h-[50vh] flex-col items-center justify-center px-6 py-16 sm:min-h-[calc(100vh-8rem)] sm:py-24"
      }
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="flex w-full max-w-[12rem] flex-col items-center justify-center">
        <p className="w-full text-center text-lg font-bold tracking-tight text-slate-900 dark:text-white sm:text-xl">
          Searching
        </p>
        <div
          className="mt-6 box-border h-10 w-10 shrink-0 animate-spin rounded-full border-[3px] border-[#0073E3]/20 border-t-[#0073E3] sm:h-12 sm:w-12"
          aria-hidden
        />
        <p className="sr-only">Looking up your vehicle registration or VIN.</p>
      </div>
    </div>
  );
}
