import { NextRequest, NextResponse } from "next/server";
import { applySecurityHeaders } from "./headers";

type RateBucket = { count: number; resetAt: number };

const rateBuckets = new Map<string, RateBucket>();

function clientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return req.headers.get("x-real-ip")?.trim() || "unknown";
}

export function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
): { allowed: boolean; retryAfterSec?: number } {
  const now = Date.now();
  let bucket = rateBuckets.get(key);
  if (!bucket || now > bucket.resetAt) {
    bucket = { count: 0, resetAt: now + windowMs };
    rateBuckets.set(key, bucket);
  }
  bucket.count += 1;
  if (bucket.count > limit) {
    return {
      allowed: false,
      retryAfterSec: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
    };
  }
  return { allowed: true };
}

/** Reject cross-site browser POSTs (CSRF-style) on production. */
export function assertSameOrigin(req: NextRequest): NextResponse | null {
  if (process.env.NODE_ENV !== "production") return null;

  const host = req.headers.get("host")?.toLowerCase();
  if (!host) {
    return applySecurityHeaders(
      NextResponse.json({ error: "Forbidden." }, { status: 403 }),
    );
  }

  const origin = req.headers.get("origin");
  if (origin) {
    try {
      if (new URL(origin).host.toLowerCase() === host) return null;
    } catch {
      // fall through
    }
    return applySecurityHeaders(
      NextResponse.json({ error: "Forbidden." }, { status: 403 }),
    );
  }

  const referer = req.headers.get("referer");
  if (referer) {
    try {
      if (new URL(referer).host.toLowerCase() === host) return null;
    } catch {
      // fall through
    }
    return applySecurityHeaders(
      NextResponse.json({ error: "Forbidden." }, { status: 403 }),
    );
  }

  return null;
}

export function tooManyRequests(retryAfterSec: number): NextResponse {
  return applySecurityHeaders(
    NextResponse.json(
      { error: "Too many requests. Please wait and try again." },
      {
        status: 429,
        headers: { "Retry-After": String(retryAfterSec) },
      },
    ),
  );
}

/** Same-origin + IP rate limit for checkout, forms, and report actions. */
export function guardBrowserPost(
  req: NextRequest,
  routeKey: string,
  limit = 40,
  windowMs = 60 * 60 * 1000,
): NextResponse | null {
  const originBlock = assertSameOrigin(req);
  if (originBlock) return originBlock;

  const key = `${clientIp(req)}:${routeKey}`;
  const { allowed, retryAfterSec } = rateLimit(key, limit, windowMs);
  if (!allowed) return tooManyRequests(retryAfterSec ?? 60);
  return null;
}

/** Rate limit only (e.g. token-based inspection uploads from mobile). */
export function guardRateLimit(
  req: NextRequest,
  routeKey: string,
  limit = 80,
  windowMs = 60 * 60 * 1000,
): NextResponse | null {
  const key = `${clientIp(req)}:${routeKey}`;
  const { allowed, retryAfterSec } = rateLimit(key, limit, windowMs);
  if (!allowed) return tooManyRequests(retryAfterSec ?? 60);
  return null;
}

export function getOpsSecret(): string | null {
  return process.env.AUTOVERIFI_OPS_SECRET?.trim() ?? null;
}

/** Protects support/trace endpoints that expose customer report metadata. */
export function requireOpsAuth(req: NextRequest): NextResponse | null {
  const secret = getOpsSecret();
  if (!secret) {
    return applySecurityHeaders(
      NextResponse.json({ error: "Not found." }, { status: 404 }),
    );
  }
  const provided =
    req.headers.get("x-autoverifi-ops-key")?.trim() ??
    req.nextUrl.searchParams.get("opsKey")?.trim();
  if (!provided || provided !== secret) {
    return applySecurityHeaders(
      NextResponse.json({ error: "Unauthorized." }, { status: 401 }),
    );
  }
  return null;
}

export function safeInternalPath(path: string | null | undefined): string {
  if (!path) return "/";
  const trimmed = path.trim();
  if (!trimmed.startsWith("/") || trimmed.startsWith("//")) return "/";
  if (trimmed.includes("\\") || trimmed.includes("\0")) return "/";
  return trimmed;
}

export function clampText(value: unknown, maxLen: number): string {
  return String(value ?? "")
    .trim()
    .slice(0, maxLen);
}

export function isReasonableEmail(email: string): boolean {
  if (email.length < 3 || email.length > 254) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function rejectOversizedBody(
  req: NextRequest,
  maxBytes: number,
): NextResponse | null {
  const lengthHeader = req.headers.get("content-length");
  if (lengthHeader) {
    const length = Number(lengthHeader);
    if (Number.isFinite(length) && length > maxBytes) {
      return applySecurityHeaders(
        NextResponse.json({ error: "Request too large." }, { status: 413 }),
      );
    }
  }
  return null;
}

export function payloadTooLargeResponse(): NextResponse {
  return applySecurityHeaders(
    NextResponse.json({ error: "Request too large." }, { status: 413 }),
  );
}

export function isBoundedAccessToken(value: string): boolean {
  const trimmed = value.trim();
  return trimmed.length >= 16 && trimmed.length <= 128 && /^[\w-]+$/.test(trimmed);
}

export async function readBoundedJson(
  req: NextRequest,
  maxBytes = 128_000,
): Promise<unknown> {
  const lengthHeader = req.headers.get("content-length");
  if (lengthHeader) {
    const length = Number(lengthHeader);
    if (Number.isFinite(length) && length > maxBytes) {
      throw new Error("PAYLOAD_TOO_LARGE");
    }
  }
  const raw = await req.text();
  if (raw.length > maxBytes) throw new Error("PAYLOAD_TOO_LARGE");
  if (!raw.trim()) return {};
  return JSON.parse(raw) as unknown;
}
