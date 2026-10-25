import {
  createInspection,
  getInspectionOwnerUrl,
  updateInspection,
} from "@/lib/inspections";
import {
  coerceRavinInspectorLiteUrl,
  createRavinPartnerInvite,
  isRavinPartnerConfigured,
} from "@/lib/ravin-partner";
import { normalizeAuMobile } from "@/lib/phone";
import { sendInspectionLinkSms, isSmsConfigured } from "@/lib/sms";
import { getBaseUrl } from "@/lib/stripe";
import { updateReport } from "@/lib/store";
import { createLavAssetReport } from "./build-asset-report";
import { getLavBookingByRef, updateLavBooking } from "./booking-store";
import { sendLavBookingConfirmationEmail } from "./confirmation-email";
import type {
  LavBookingPayload,
  LavCaptureLink,
  LavFulfillmentResult,
} from "./types";

function isDigitalInspection(inspectionType: string): boolean {
  return inspectionType.toLowerCase().includes("digital");
}

async function startDigitalCapture(input: {
  reportId: string;
  rego: string;
  state: string;
  vendorPhone: string;
  vehicleLabel: string;
}): Promise<{ inspectUrl: string; smsWarnings: string[] }> {
  const smsWarnings: string[] = [];
  const inspection = await createInspection({
    reportId: input.reportId,
    phone: input.vendorPhone,
  });

  const baseUrl = getBaseUrl();
  const inspectUrl = getInspectionOwnerUrl(inspection, baseUrl);

  if (isRavinPartnerConfigured()) {
    try {
      const invite = await createRavinPartnerInvite({
        claimId: input.reportId,
        lp: input.rego || "LAV",
        state: input.state || "NSW",
      });
      await updateInspection(inspection.id, {
        ravinInspectionId: invite.invitationId,
        ravinInviteUrl: coerceRavinInspectorLiteUrl(invite.inviteUrl),
      });
    } catch (err) {
      console.error("[lav/fulfill] Ravin invite failed:", err);
    }
  }

  await updateReport(input.reportId, {
    workflowStatus: "awaiting_inspection",
    ownerPhone: input.vendorPhone,
    customerPhone: input.vendorPhone,
  });

  if (isSmsConfigured()) {
    try {
      await sendInspectionLinkSms({
        to: input.vendorPhone,
        inspectUrl,
        vehicleLabel: input.vehicleLabel,
        recipient: "owner",
      });
    } catch (err) {
      smsWarnings.push(
        err instanceof Error
          ? `Vendor SMS: ${err.message}`
          : "Vendor SMS failed.",
      );
    }
  } else {
    smsWarnings.push("SMS not configured — share the capture link manually.");
  }

  return { inspectUrl, smsWarnings };
}

export async function fulfillLavBooking(
  bookingRef: string,
): Promise<LavFulfillmentResult> {
  const record = await getLavBookingByRef(bookingRef);
  if (!record) {
    throw new Error("Booking not found.");
  }
  if (record.status === "fulfilled" && record.fulfillment) {
    return record.fulfillment;
  }

  const payload = record.payload as LavBookingPayload;
  const digital = isDigitalInspection(payload.inspectionType);
  const vendorPhone = normalizeAuMobile(payload.vendorPhone);
  const contactPhone = normalizeAuMobile(payload.contactPhone);

  const captureLinks: LavCaptureLink[] = [];
  const assetReportIds: string[] = [];
  const smsWarnings: string[] = [];

  const paid =
    record.status === "paid" ||
    record.status === "invoiced" ||
    payload.promoCode === "AVINV";

  for (let i = 0; i < payload.assets.length; i++) {
    const asset = payload.assets[i];
    const { report } = await createLavAssetReport({
      booking: payload,
      asset,
      assetIndex: i,
      paid,
    });
    assetReportIds.push(report.id);

    const label = `${asset.year} ${asset.make} ${asset.model}`.trim() || asset.type;

    if (digital && vendorPhone) {
      const capture = await startDigitalCapture({
        reportId: report.id,
        rego: report.vehicle.rego,
        state: report.vehicle.state,
        vendorPhone,
        vehicleLabel: label,
      });
      captureLinks.push({
        assetIndex: i + 1,
        reportId: report.id,
        inspectUrl: capture.inspectUrl,
        label,
      });
      smsWarnings.push(...capture.smsWarnings);

      if (contactPhone && contactPhone !== vendorPhone && isSmsConfigured()) {
        try {
          await sendInspectionLinkSms({
            to: contactPhone,
            inspectUrl: capture.inspectUrl,
            vehicleLabel: label,
            recipient: "purchaser",
          });
        } catch (err) {
          smsWarnings.push(
            err instanceof Error
              ? `Customer SMS: ${err.message}`
              : "Customer SMS failed.",
          );
        }
      }
    }
  }

  const result: LavFulfillmentResult = {
    captureLinks,
    assetReportIds,
    smsWarnings,
  };

  await updateLavBooking(bookingRef, {
    status: "fulfilled",
    assetReportIds,
    fulfillment: result,
  });

  await sendLavBookingConfirmationEmail({
    payload,
    captureLinks,
    assetReportIds,
    invoiceAccount: payload.promoCode === "AVINV",
    digital,
  }).catch((err) => {
    console.error("[lav/fulfill] confirmation email failed:", err);
  });

  return result;
}
