import type { LavAssetContext, LavVerificationSummary } from "@/lib/types";

export const LAV_INVOICE_PROMO = "AVINV";

export type { LavAssetContext, LavVerificationSummary };

export type LavAssetInput = {
  type: string;
  year: string;
  make: string;
  model: string;
  identifier: string;
  rego: string;
  description: string;
};

export type LavBookingPayload = {
  bookingRef: string;
  submittedAt: string;
  inspectionType: string;
  assets: LavAssetInput[];
  vendorType: string;
  vendorName: string;
  vendorPhone: string;
  vendorEmail: string;
  address: string;
  suburb: string;
  state: string;
  postcode: string;
  accessNotes: string;
  role: string;
  company: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  lender: string;
  borrower: string;
  reference: string;
  ccEmails: string;
  billing: string;
  promoCode: string;
  subtotal: number;
  gst: number;
  estimate: number;
};

export type LavBookingStatus =
  | "pending_payment"
  | "paid"
  | "invoiced"
  | "fulfilled"
  | "failed";

export type LavCaptureLink = {
  assetIndex: number;
  reportId: string;
  inspectUrl: string;
  label: string;
};

export type LavFulfillmentResult = {
  captureLinks: LavCaptureLink[];
  assetReportIds: string[];
  smsWarnings: string[];
};
