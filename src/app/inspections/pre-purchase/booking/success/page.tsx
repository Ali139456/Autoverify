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
      <div className="mt-3 space-y-2 text-slate-600 dark:text-slate-400">
        {ref ? (
          <p>
            Reference <strong>{ref}</strong>
          </p>
        ) : null}
        <p>
          We will schedule the inspection and be in touch within 24 hours to
          confirm your inspection date and time.
        </p>
      </div>
      <Link
        href="/inspections/pre-purchase"
        className="mt-8 inline-flex rounded-lg bg-accent-500 px-4 py-2 text-sm font-bold text-white hover:bg-accent-600"
      >
        Back to pre-purchase
      </Link>
    </div>
  );
}
