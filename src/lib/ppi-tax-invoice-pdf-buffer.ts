import { createElement, type ReactElement } from "react";
import { DocumentProps, renderToBuffer } from "@react-pdf/renderer";
import { PpiTaxInvoicePdf } from "./tax-invoice-pdf";
import {
  listPriceForPpiVehicleCategory,
  normalizePpiVehicleCategory,
} from "./pre-purchase/vehicle-pricing";
import type { PrePurchaseBookingPayload } from "./pre-purchase/types";

export async function generatePpiTaxInvoicePdfBuffer(
  payload: PrePurchaseBookingPayload,
): Promise<Buffer> {
  const category = normalizePpiVehicleCategory(payload.vehicleCategory);
  const listPriceCents = Math.round(listPriceForPpiVehicleCategory(category) * 100);
  const amountPaidCents = Math.round(payload.priceIncGst * 100);
  const invoiceDate = new Date(payload.submittedAt || Date.now());

  const buffer = await renderToBuffer(
    createElement(PpiTaxInvoicePdf, {
      payload,
      invoiceDate,
      listPriceCents,
      amountPaidCents,
      currency: "aud",
    }) as ReactElement<DocumentProps>,
  );
  return Buffer.from(buffer);
}