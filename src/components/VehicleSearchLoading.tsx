import Image from "next/image";

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
          ? "flex flex-col items-center justify-center px-4 py-10 text-center"
          : "flex min-h-[50vh] flex-col items-center justify-center px-6 py-16 text-center sm:min-h-[calc(100vh-8rem)] sm:py-24"
      }
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <p className="text-lg font-bold tracking-tight text-slate-900 dark:text-white sm:text-xl">
        Searching
      </p>
      <Image
        src="/logo/icon.png"
        alt=""
        width={56}
        height={56}
        className="mt-6 h-10 w-10 animate-spin object-contain sm:h-12 sm:w-12"
        aria-hidden
        priority
      />
      <p className="sr-only">Looking up your vehicle registration or VIN.</p>
    </div>
  );
}
