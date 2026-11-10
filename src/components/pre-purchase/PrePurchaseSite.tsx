import { PrePurchaseBookingForm } from "./PrePurchaseBookingForm";

export function PrePurchaseSite() {
  return (
    <div className="w-full">
      <section className="border-b border-slate-200 bg-gradient-to-b from-slate-50 to-white py-14 dark:border-slate-800 dark:from-ink-950 dark:to-ink-900">
        <div className="av-site-container grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-accent-500">
              Pre-purchase inspections
            </p>
            <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
              Know what you&apos;re buying before you pay.
            </h1>
            <p className="mt-4 max-w-xl text-base text-slate-600 dark:text-slate-400">
              A qualified inspector attends the vehicle, checks condition and
              history context, and delivers a written report. Sydney metro
              bookings are live; other cities open on waitlist.
            </p>
            <ul className="mt-6 space-y-2 text-sm text-slate-700 dark:text-slate-300">
              <li>On-site at seller address</li>
              <li>Road test where safe and permitted</li>
              <li>Written report within 24 hours of inspection</li>
            </ul>
          </div>
          <PrePurchaseBookingForm />
        </div>
      </section>
    </div>
  );
}
