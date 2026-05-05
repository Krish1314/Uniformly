import api from "./client";

export const checkoutApi = {
  checkout: ({ addressId, paymentMethod }) =>
    api.post("/checkout", {
      addressId,
      paymentMethod,
    }),
};
