import { clampText, isReasonableEmail } from "@/lib/security";
import type { PrePurchaseBookingPayload } from "./types";

export const PPI_PRICE_INC_GST = 290;

export function isSydneyMetroPostcode(postcode: string): boolean {
  const trimmed = postcode.trim();
  const n = Number(trimmed);
  return /^[0-9]{4}$/.test(trimmed) && n >= 2000 && n <= 2234;
}

export function parsePrePurchaseBookingBody(
  body: Record<string, unknown>,
): { payload: Omit<PrePurchaseBookingPayload, "bookingRef"> } | { error: string } {
  const contactName = clampText(body.contactName, 120);
  const contactEmail = clampText(body.contactEmail, 254).toLowerCase();
  const contactPhone = clampText(body.contactPhone, 24);

  if (!contactName || !isReasonableEmail(contactEmail) || !contactPhone.trim()) {
    return { error: "Please complete your contact details." };
  }

  const suburb = clampText(body.suburb, 80);
  const postcode = clampText(body.postcode, 8);
  if (!suburb || !isSydneyMetroPostcode(postcode)) {
    return {
      error:
        "Pre-purchase inspections are Sydney-only for now. Use a NSW postcode between 2000 and 2234.",
    };
  }

  const vehicleRego = clampText(body.vehicleRego, 24);
  const vehicleState = clampText(body.vehicleState, 8).toUpperCase() || "NSW";
  const vehicleMake = clampText(body.vehicleMake, 80);
  const vehicleModel = clampText(body.vehicleModel, 80);
  const vehicleYear = clampText(body.vehicleYear, 8);

  if (!vehicleRego && !clampText(body.vehicleVin, 32)) {
    return { error: "Enter the registration plate or VIN for the vehicle." };
  }
  if (!vehicleMake || !vehicleModel || !vehicleYear) {
    return { error: "Enter the vehicle make, model and year." };
  }

  return {
    payload: {
      submittedAt: new Date().toISOString(),
      contactName,
      contactEmail,
      contactPhone,
      suburb,
      postcode,
      addressLine: clampText(body.addressLine, 200),
      accessNotes: clampText(body.accessNotes, 500),
      vehicleRego,
      vehicleState,
      vehicleVin: clampText(body.vehicleVin, 32).toUpperCase(),
      vehicleMake,
      vehicleModel,
      vehicleYear,
      preferredWhen: clampText(body.preferredWhen, 200),
      priceIncGst: PPI_PRICE_INC_GST,
    },
  };
}
