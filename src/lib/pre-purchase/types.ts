export type PrePurchaseBookingPayload = {
  bookingRef: string;
  submittedAt: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  suburb: string;
  postcode: string;
  addressLine: string;
  accessNotes: string;
  vehicleRego: string;
  vehicleState: string;
  vehicleVin: string;
  vehicleMake: string;
  vehicleModel: string;
  vehicleYear: string;
  preferredWhen: string;
  /** Price charged (inc GST); may be discounted via promo code. */
  priceIncGst: number;
  /** Promo applied at checkout, if any (e.g. AVFREE). */
  promoCode: string;
};
