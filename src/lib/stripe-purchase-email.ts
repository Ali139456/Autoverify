import type Stripe from "stripe";
import { getStripe, isStripeConfigured } from "./stripe";
import type { PurchaseEmailContext } from "./purchase-email-template";

export async function buildPurchaseEmailContextFromSession(
  sessionId: string,
  baseUrl: string,
  reportId: string,
): Promise<PurchaseEmailContext> {
  const reportUrl = `${baseUrl}/report/${reportId}`;
  const pdfUrl = `${baseUrl}/api/report/${reportId}/pdf`;

  if (!isStripeConfigured()) {
    return { reportUrl, pdfUrl, paidAt: new Date() };
  }

  const session = await getStripe().checkout.sessions.retrieve(sessionId, {
    expand: ["invoice"],
  });

  let invoice: Stripe.Invoice | null = null;
  if (session.invoice) {
    invoice =
      typeof session.invoice === "string"
        ? await getStripe().invoices.retrieve(session.invoice)
        : session.invoice;
  }

  const metadata = session.metadata ?? {};
  const listPriceFromMeta = Number(metadata.listPriceCents);
  const amountFromMeta = Number(metadata.amountCents);
  const promoCode = metadata.promoCode?.trim() || null;

  const amountPaidCents =
    session.amount_total ??
    invoice?.amount_paid ??
    (Number.isFinite(amountFromMeta) ? amountFromMeta : null);

  return {
    reportUrl,
    pdfUrl,
    customerName: session.customer_details?.name ?? null,
    invoiceHostedUrl: invoice?.hosted_invoice_url ?? null,
    invoicePdfUrl: invoice?.invoice_pdf ?? null,
    invoiceNumber: invoice?.number ?? null,
    amountPaidCents,
    listPriceCents: Number.isFinite(listPriceFromMeta)
      ? listPriceFromMeta
      : null,
    promoCode,
    currency: session.currency ?? invoice?.currency ?? "aud",
    paidAt: invoice?.status_transitions?.paid_at
      ? new Date(invoice.status_transitions.paid_at * 1000)
      : new Date(),
  };
}
