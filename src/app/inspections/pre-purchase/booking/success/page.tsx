import Link from "next/link";

export default async function PrePurchaseBookingSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string }>;
}) {
  const { ref } = await searchParams;
  return (
    <div className="mx-auto max-w-xl px-4 py-20 text-center">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
        Booking confirmed
      </h1>
      <p className="mt-3 text-slate-600 dark:text-slate-400">
        {ref ? (
          <>
            Reference <strong>{ref}</strong>. We&apos;ll email your confirmation
            and schedule the inspection.
          </>
        ) : (
          <>Payment received. We&apos;ll email your confirmation shortly.</>
        )}
      </p>
      <Link
        href="/inspections/pre-purchase"
        className="mt-8 inline-flex rounded-lg bg-accent-500 px-4 py-2 text-sm font-bold text-white hover:bg-accent-600"
      >
        Back to pre-purchase
      </Link>
    </div>
  );
}
