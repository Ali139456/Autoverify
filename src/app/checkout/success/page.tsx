import { redirect } from "next/navigation";
import Link from "next/link";
import { getStripe, isStripeConfigured } from "@/lib/stripe";
import { getReport, updateReport } from "@/lib/store";

export const metadata = { title: "Payment Complete", robots: { index: false } };

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string; report_id?: string }>;
}) {
  const { session_id: sessionId, report_id: reportId } = await searchParams;

  if (reportId && sessionId && isStripeConfigured()) {
    const report = await getReport(reportId);
    if (report && report.status === "pending_payment") {
      // Verify directly with Stripe (works even before the webhook fires)
      const session = await getStripe().checkout.sessions.retrieve(sessionId);
      if (
        session.payment_status === "paid" &&
        session.metadata?.reportId === reportId
      ) {
        await updateReport(reportId, { status: "paid" });
      }
    }
    if (report) {
      redirect(`/report/${reportId}`);
    }
  } else if (reportId) {
    redirect(`/report/${reportId}`);
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-20 text-center sm:px-6">
      <h1 className="text-2xl font-bold text-white">
        We couldn&apos;t locate your report
      </h1>
      <p className="mt-3 text-slate-400">
        Your payment may still have gone through. Please contact support with
        your payment receipt, or try your search again.
      </p>
      <Link
        href="/"
        className="glow-blue mt-8 inline-block rounded-xl bg-accent-600 px-6 py-3 font-bold text-white hover:bg-accent-500"
      >
        Back to home
      </Link>
    </div>
  );
}
