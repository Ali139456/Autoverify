import { NextRequest, NextResponse } from "next/server";
import { sendContactFormEmail } from "@/lib/email";
import {
  clampText,
  guardBrowserPost,
  isReasonableEmail,
  readBoundedJson,
} from "@/lib/security";

export async function POST(req: NextRequest) {
  const blocked = guardBrowserPost(req, "contact-form", 8, 60 * 60 * 1000);
  if (blocked) return blocked;

  try {
    const body = (await readBoundedJson(req)) as Record<string, unknown>;

    if (clampText(body.company, 120)) {
      return NextResponse.json({ ok: true });
    }

    const name = clampText(body.name, 120);
    const email = clampText(body.email, 254).toLowerCase();
    const phone = clampText(body.phone, 40);
    const subject = clampText(body.subject, 120);
    const message = clampText(body.message, 4000);

    if (!name || !isReasonableEmail(email) || message.length < 10) {
      return NextResponse.json(
        { error: "Please enter your name, a valid email, and a message." },
        { status: 400 },
      );
    }

    await sendContactFormEmail({ name, email, phone, subject, message });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[contact]", err);
    return NextResponse.json(
      { error: "We could not send your message. Please email us directly." },
      { status: 503 },
    );
  }
}
