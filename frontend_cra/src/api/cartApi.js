import api from "./client";

export const cartApi = {
  getCart: () => api.get("/cart"),

  addItem: ({ productId, variantId, quantity }) =>
    api.post("/cart/items", {
      productId,
      variantId,
      quantity,
    }),

  updateItem: (cartItemId, quantity) =>
    api.patch(`/cart/items/${cartItemId}`, {
      quantity,
    }),

  removeItem: (cartItemId) => api.delete(`/cart/items/${cartItemId}`),

  clearCart: () => api.delete("/cart"),
};
