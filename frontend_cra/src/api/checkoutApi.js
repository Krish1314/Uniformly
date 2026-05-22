import api from "./client";

export const checkoutApi = {
  /** Step 1: Initialise checkout. Returns razorpayOrderId + razorpayKeyId for online payments, or marks COD directly. */
  initCheckout: ({ addressId, paymentMethod }) =>
    api.post("/checkout/init", { addressId, paymentMethod }),

  /** Step 2 (online only): Verify Razorpay payment signature and confirm order as PAID. */
  verifyPayment: ({ orderNumber, razorpayOrderId, razorpayPaymentId, razorpaySignature }) =>
    api.post("/checkout/verify", { orderNumber, razorpayOrderId, razorpayPaymentId, razorpaySignature }),

  /** Called when Razorpay fires payment.failed — marks order as PAYMENT_FAILED in DB. */
  markPaymentFailed: (orderNumber) =>
    api.patch(`/checkout/${orderNumber}/fail`),
};
