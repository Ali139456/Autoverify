import { NextRequest, NextResponse } from "next/server";
import { sendContactFormEmail } from "@/lib/email";
import {
  clampText,
  guardBrowserPost,
  isReasonableEmail,
  readBoundedJson,
} from "@/lib/security";

function formatBookingMessage(body: Record<string, unknown>): string {
  const assets = Array.isArray(body.assets) ? body.assets : [];
  const lines: string[] = [
    `Booking ref: ${clampText(body.bookingRef, 32)}`,
    `Inspection: ${clampText(body.inspectionType, 80)}`,
    `Total: ${clampText(String(body.subtotal ?? ""), 20)} + GST ${clampText(String(body.gst ?? ""), 20)} = ${clampText(String(body.estimate ?? ""), 20)} inc GST`,
    "",
    ...assets.map((raw, i) => {
      const a = raw as Record<string, unknown>;
      return `Asset ${i + 1}: ${clampText(a.type, 80)} | ${clampText(a.year, 8)} ${clampText(a.make, 80)} ${clampText(a.model, 80)} | ID ${clampText(a.identifier, 80) || "-"} | Rego ${clampText(a.rego, 40) || "-"} | ${clampText(a.description, 200) || ""}`;
    }),
    "",
    `Vendor: ${clampText(body.vendorName, 120)} (${clampText(body.vendorType, 80)}) ${clampText(body.vendorPhone, 40)} ${clampText(body.vendorEmail, 254)}`,
    `Location: ${clampText(body.address, 200)}, ${clampText(body.suburb, 80)} ${clampText(body.state, 8)} ${clampText(body.postcode, 8)}`,
    `Access: ${clampText(body.accessNotes, 500) || "-"}`,
    "",
    `Ordered by: ${clampText(body.contactName, 120)}, ${clampText(body.company, 120)} (${clampText(body.role, 80)}) ${clampText(body.contactPhone, 40)} ${clampText(body.contactEmail, 254)}`,
    `Lender: ${clampText(body.lender, 120)} | Borrower: ${clampText(body.borrower, 120)} | Ref: ${clampText(body.reference, 80) || "-"}`,
    `CC: ${clampText(body.ccEmails, 500) || "-"} | Billing: ${clampText(body.billing, 80)}`,
  ];
  return lines.join("\n");
}

export async function POST(req: NextRequest) {
  const blocked = guardBrowserPost(req, "lav-booking", 6, 60 * 60 * 1000);
  if (blocked) return blocked;

  try {
    const body = (await readBoundedJson(req)) as Record<string, unknown>;
    const contactName = clampText(body.contactName, 120);
    const contactEmail = clampText(body.contactEmail, 254).toLowerCase();
    const bookingRef = clampText(body.bookingRef, 32);

    if (!contactName || !isReasonableEmail(contactEmail) || !bookingRef) {
      return NextResponse.json(
        { error: "Please complete your contact details." },
        { status: 400 },
      );
    }

    await sendContactFormEmail({
      name: contactName,
      email: contactEmail,
      phone: clampText(body.contactPhone, 40),
      subject: `Asset verification booking ${bookingRef}`,
      message: formatBookingMessage(body),
    });

    return NextResponse.json({ ok: true, bookingRef });
  } catch (err) {
    console.error("[lav-booking]", err);
    return NextResponse.json(
      { error: "We could not submit your booking. Please email us directly." },
      { status: 503 },
    );
  }
}
