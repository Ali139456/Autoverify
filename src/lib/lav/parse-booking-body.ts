import { clampText, isReasonableEmail } from "@/lib/security";
import { LAV_INVOICE_PROMO, type LavAssetInput, type LavBookingPayload } from "./types";

function normalizePromo(raw: string): string {
  return raw.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
}

export function parseLavBookingBody(
  body: Record<string, unknown>,
): { payload: LavBookingPayload } | { error: string } {
  const bookingRef = clampText(body.bookingRef, 32);
  const contactName = clampText(body.contactName, 120);
  const contactEmail = clampText(body.contactEmail, 254).toLowerCase();

  if (!bookingRef || !contactName || !isReasonableEmail(contactEmail)) {
    return { error: "Please complete your contact details." };
  }

  const assetsRaw = Array.isArray(body.assets) ? body.assets : [];
  if (assetsRaw.length === 0) {
    return { error: "Add at least one asset." };
  }

  const assets: LavAssetInput[] = assetsRaw.map((raw) => {
    const a = raw as Record<string, unknown>;
    return {
      type: clampText(a.type, 80),
      year: clampText(a.year, 8),
      make: clampText(a.make, 80),
      model: clampText(a.model, 80),
      identifier: clampText(a.identifier, 32).toUpperCase(),
      rego: clampText(a.rego, 40),
      description: clampText(a.description, 200),
    };
  });

  const promoCode = normalizePromo(clampText(body.promoCode, 32));
  if (promoCode && promoCode !== LAV_INVOICE_PROMO) {
    return { error: "That discount code is not valid for this booking." };
  }

  const subtotal = Number(body.subtotal);
  const gst = Number(body.gst);
  const estimate = Number(body.estimate);

  const payload: LavBookingPayload = {
    bookingRef,
    submittedAt: clampText(body.submittedAt, 40) || new Date().toISOString(),
    inspectionType: clampText(body.inspectionType, 80),
    assets,
    vendorType: clampText(body.vendorType, 80),
    vendorName: clampText(body.vendorName, 120),
    vendorPhone: clampText(body.vendorPhone, 24),
    vendorEmail: clampText(body.vendorEmail, 254),
    address: clampText(body.address, 200),
    suburb: clampText(body.suburb, 80),
    state: clampText(body.state, 8),
    postcode: clampText(body.postcode, 8),
    accessNotes: clampText(body.accessNotes, 500),
    role: clampText(body.role, 80),
    company: clampText(body.company, 120),
    contactName,
    contactPhone: clampText(body.contactPhone, 24),
    contactEmail,
    lender: clampText(body.lender, 120),
    borrower: clampText(body.borrower, 120),
    reference: clampText(body.reference, 80),
    ccEmails: clampText(body.ccEmails, 500),
    buyerPhone: clampText(body.buyerPhone, 24),
    billing: clampText(body.billing, 120),
    promoCode,
    subtotal: Number.isFinite(subtotal) ? subtotal : 0,
    gst: Number.isFinite(gst) ? gst : 0,
    estimate: Number.isFinite(estimate) ? estimate : 0,
  };

  return { payload };
}
