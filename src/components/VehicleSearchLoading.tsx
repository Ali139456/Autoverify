/** Viewfinder mark only (no AUTO VERIFI wordmark). */
const ICON_SRC = "/logo/auto-verifi-mark.svg";

function SearchSpinnerRing({ compact }: { compact?: boolean }) {
  return (
    <div
      className={
        compact
          ? "relative h-10 w-10 shrink-0"
          : "relative h-12 w-12 shrink-0 sm:h-14 sm:w-14"
      }
      aria-hidden
    >
      <div
        className={
          compact
            ? "absolute inset-0 box-border animate-spin rounded-full border-[2.5px] border-[#0073E3]/20 border-t-[#0073E3]"
            : "absolute inset-0 box-border animate-spin rounded-full border-[3px] border-[#0073E3]/20 border-t-[#0073E3]"
        }
      />
      {/* eslint-disable-next-line @next/next/no-img-element -- small static brand mark in loading overlay */}
      <img
        src={ICON_SRC}
        alt=""
        width={compact ? 20 : 28}
        height={compact ? 20 : 28}
        className={
          compact
            ? "absolute left-1/2 top-1/2 h-[18px] w-[18px] -translate-x-1/2 -translate-y-1/2 object-contain"
            : "absolute left-1/2 top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 object-contain sm:h-6 sm:w-6"
        }
      />
    </div>
  );
}

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
          ? "flex w-full flex-col items-center justify-center px-4 py-8"
          : "flex w-full min-h-[50vh] flex-col items-center justify-center px-6 py-16 sm:min-h-[calc(100vh-8rem)] sm:py-24"
      }
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="flex w-full max-w-[12rem] flex-col items-center justify-center">
        <p
          className={
            embedded
              ? "w-full text-center text-base font-bold tracking-tight text-slate-900 dark:text-white"
              : "w-full text-center text-lg font-bold tracking-tight text-slate-900 dark:text-white sm:text-xl"
          }
        >
          Searching
        </p>
        <div className={embedded ? "mt-4" : "mt-6"}>
          <SearchSpinnerRing compact={embedded} />
        </div>
        <p className="sr-only">Looking up your vehicle registration or VIN.</p>
      </div>
    </div>
  );
}
