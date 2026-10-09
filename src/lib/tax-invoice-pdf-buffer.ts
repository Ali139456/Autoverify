import { createElement, type ReactElement } from "react";
import { DocumentProps, renderToBuffer } from "@react-pdf/renderer";
import { getReportTierConfig, resolveReportTier } from "./pricing";
import type { PurchaseEmailContext } from "./purchase-email-template";
import { TaxInvoicePdf } from "./tax-invoice-pdf";
import { formatReportReference } from "./report-design";
import type { VehicleReport } from "./types";

function defaultInvoiceNumber(report: VehicleReport): string {
  return formatReportReference(report.vehicle);
}

export async function generateTaxInvoicePdfBuffer(
  report: VehicleReport,
  ctx: PurchaseEmailContext,
): Promise<Buffer> {
  const tier = resolveReportTier(report.tier);
  const tierConfig = getReportTierConfig(tier);
  const listPriceCents = ctx.listPriceCents ?? tierConfig.priceCents;
  const amountPaidCents = ctx.amountPaidCents ?? listPriceCents;
  const invoiceNumber =
    ctx.invoiceNumber?.trim() || defaultInvoiceNumber(report);
  const invoiceDate = ctx.paidAt ?? new Date(report.createdAt);
  const currency = ctx.currency ?? "aud";

  const buffer = await renderToBuffer(
    createElement(TaxInvoicePdf, {
      report,
      invoiceNumber,
      invoiceDate,
      listPriceCents,
      amountPaidCents,
      promoCode: ctx.promoCode ?? null,
      currency,
    }) as ReactElement<DocumentProps>,
  );
  return Buffer.from(buffer);
}
