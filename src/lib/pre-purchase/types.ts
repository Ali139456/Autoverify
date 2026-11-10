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
  priceIncGst: number;
};
