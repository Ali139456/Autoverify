import { sendContactFormEmail } from "@/lib/email";
import type { PrePurchaseBookingPayload } from "./types";

function formatPayload(payload: PrePurchaseBookingPayload): string {
  return [
    `Booking ref: ${payload.bookingRef}`,
    "",
    `Contact: ${payload.contactName}`,
    `Email: ${payload.contactEmail}`,
    `Phone: ${payload.contactPhone}`,
    "",
    `Location: ${payload.addressLine || "—"}, ${payload.suburb} NSW ${payload.postcode}`,
    `Access: ${payload.accessNotes || "—"}`,
    `Preferred time: ${payload.preferredWhen || "—"}`,
    "",
    `Vehicle: ${payload.vehicleYear} ${payload.vehicleMake} ${payload.vehicleModel}`,
    `Rego: ${payload.vehicleRego} (${payload.vehicleState})`,
    `VIN: ${payload.vehicleVin || "—"}`,
    "",
    `Paid: $${payload.priceIncGst.toFixed(2)} inc GST`,
  ].join("\n");
}

export async function notifyPrePurchaseBooking(
  payload: PrePurchaseBookingPayload,
  paid: boolean,
): Promise<void> {
  await sendContactFormEmail({
    name: payload.contactName,
    email: payload.contactEmail,
    phone: payload.contactPhone,
    subject: `${paid ? "Paid" : "Pending"} pre-purchase inspection ${payload.bookingRef}`,
    message: formatPayload(payload),
  });
}
