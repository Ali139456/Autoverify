import { applyPercentDiscount, lookupPromoCode } from "@/lib/promo-codes";
import { clampText, isReasonableEmail } from "@/lib/security";
import type { PrePurchaseBookingPayload } from "./types";
import {
  listPriceForPpiVehicleCategory,
  normalizePpiVehicleCategory,
} from "./vehicle-pricing";

/** Default Sydney passenger / SUV pre-purchase price (inc GST). */
export const PPI_PRICE_INC_GST = 290;

export function isSydneyMetroPostcode(postcode: string): boolean {
  const trimmed = postcode.trim();
  const n = Number(trimmed);
  return /^[0-9]{4}$/.test(trimmed) && n >= 2000 && n <= 2234;
}

/** e.g. "Parramatta 2150" or "2088" */
export function parseSuburbPostcodeLine(
  raw: string,
): { suburb: string; postcode: string } | { error: string } {
  const line = raw.trim();
  if (!line) {
    return { error: "Enter the suburb or postcode where the vehicle is." };
  }
  const postcodeMatch = line.match(/\b([0-9]{4})\b/);
  if (!postcodeMatch) {
    return { error: "Include a 4-digit Sydney postcode (2000–2234)." };
  }
  const postcode = postcodeMatch[1];
  if (!isSydneyMetroPostcode(postcode)) {
    return {
      error:
        "Pre-purchase inspections are Sydney-only for now. Use a postcode between 2000 and 2234.",
    };
  }
  const suburb = line
    .replace(postcodeMatch[0], "")
    .replace(/[,]/g, " ")
    .trim();
  return { suburb: suburb || "Sydney", postcode };
}

/** e.g. "2019 Toyota Hilux SR5" */
export function parseVehicleDescriptionLine(
  raw: string,
): { vehicleYear: string; vehicleMake: string; vehicleModel: string } | { error: string } {
  const line = raw.trim();
  if (!line) {
    return { error: "Enter the make, model and year." };
  }
  const withYear = line.match(/^(\d{4})\s+(.+)$/);
  if (withYear) {
    const rest = withYear[2].trim();
    const parts = rest.split(/\s+/);
    const make = parts[0] ?? "";
    const model = parts.slice(1).join(" ") || rest;
    if (!make) return { error: "Enter the make, model and year." };
    return {
      vehicleYear: withYear[1],
      vehicleMake: make,
      vehicleModel: model,
    };
  }
  const parts = line.split(/\s+/);
  if (parts.length < 2) {
    return { error: "Enter the make, model and year (e.g. 2019 Toyota Hilux SR5)." };
  }
  return {
    vehicleYear: "",
    vehicleMake: parts[0],
    vehicleModel: parts.slice(1).join(" "),
  };
}

export type PrePurchaseParseOptions = {
  /** Denise booking UI — suburb line + vehicle line, no rego/VIN required. */
  requestFlow?: boolean;
};

export function parsePrePurchaseBookingBody(
  body: Record<string, unknown>,
  options: PrePurchaseParseOptions = {},
): { payload: Omit<PrePurchaseBookingPayload, "bookingRef"> } | { error: string } {
  const requestFlow =
    options.requestFlow === true ||
    body.requestFlow === true ||
    String(body.requestFlow) === "true";
  const contactName = clampText(body.contactName, 120);
  const contactEmail = clampText(body.contactEmail, 254).toLowerCase();
  const contactPhone = clampText(body.contactPhone, 24);

  if (!contactName || !isReasonableEmail(contactEmail) || !contactPhone.trim()) {
    return { error: "Please complete your contact details." };
  }

  let suburb = clampText(body.suburb, 80);
  let postcode = clampText(body.postcode, 8);
  if (requestFlow && clampText(body.suburbPostcode, 120)) {
    const parsedLoc = parseSuburbPostcodeLine(String(body.suburbPostcode));
    if ("error" in parsedLoc) return parsedLoc;
    suburb = parsedLoc.suburb;
    postcode = parsedLoc.postcode;
  } else if (!suburb || !isSydneyMetroPostcode(postcode)) {
    return {
      error:
        "Pre-purchase inspections are Sydney-only for now. Use a NSW postcode between 2000 and 2234.",
    };
  }

  let vehicleRego = clampText(body.vehicleRego, 24);
  const vehicleState = clampText(body.vehicleState, 8).toUpperCase() || "NSW";
  let vehicleMake = clampText(body.vehicleMake, 80);
  let vehicleModel = clampText(body.vehicleModel, 80);
  let vehicleYear = clampText(body.vehicleYear, 8);

  if (requestFlow && clampText(body.vehicleDescription, 160)) {
    const parsedVehicle = parseVehicleDescriptionLine(
      String(body.vehicleDescription),
    );
    if ("error" in parsedVehicle) return parsedVehicle;
    vehicleYear = parsedVehicle.vehicleYear;
    vehicleMake = parsedVehicle.vehicleMake;
    vehicleModel = parsedVehicle.vehicleModel;
  }

  if (!requestFlow) {
    if (!vehicleRego && !clampText(body.vehicleVin, 32)) {
      return { error: "Enter the registration plate or VIN for the vehicle." };
    }
  } else {
    vehicleRego = vehicleRego || "";
  }
  if (!vehicleMake || !vehicleModel) {
    return { error: "Enter the vehicle make, model and year." };
  }

  const sellerType = clampText(body.sellerType, 40) || "private";
  const listingUrl = clampText(body.listingUrl, 500);

  const promoRaw = requestFlow ? "" : clampText(body.promoCode, 64);
  const promo = requestFlow ? null : lookupPromoCode(promoRaw);
  if (!requestFlow && promoRaw.trim() && !promo) {
    return { error: "That discount code is not valid." };
  }
  const vehicleCategory = normalizePpiVehicleCategory(body.vehicleCategory);
  const listPrice = listPriceForPpiVehicleCategory(vehicleCategory);
  const listCents = Math.round(listPrice * 100);
  const priceCents =
    requestFlow || !promo
      ? listCents
      : applyPercentDiscount(listCents, promo.percentOff);

  const accessNotes = [
    clampText(body.accessNotes, 500),
    listingUrl ? `Listing: ${listingUrl}` : "",
    sellerType ? `Seller: ${sellerType}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  return {
    payload: {
      submittedAt: new Date().toISOString(),
      contactName,
      contactEmail,
      contactPhone,
      suburb,
      postcode,
      addressLine: clampText(body.addressLine, 200),
      accessNotes,
      vehicleRego,
      vehicleState,
      vehicleVin: clampText(body.vehicleVin, 32).toUpperCase(),
      vehicleMake,
      vehicleModel,
      vehicleYear,
      preferredWhen:
        clampText(body.preferredDate, 80) || clampText(body.preferredWhen, 200),
      sellerType,
      listingUrl,
      priceIncGst: requestFlow ? listPrice : priceCents / 100,
      promoCode: promo?.code ?? "",
      vehicleCategory,
    },
  };
}
