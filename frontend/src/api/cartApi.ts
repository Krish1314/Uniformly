import api from "./client";

export const cartApi = {
  getCart: () => api.get("/cart"),
  addItem: (item: { productId: number | string; variantId?: number | string | null; quantity: number }) => 
    api.post("/cart", item),
  updateItem: (id: number | string, quantity: number) => 
    api.put(`/cart/${id}`, { quantity }),
  removeItem: (id: number | string) => 
    api.delete(`/cart/${id}`),
};

export default cartApi;
