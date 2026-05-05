import api from "./client";

export const productApi = {
  getProducts: (params = {}) => api.get("/products", { params }),
  getFeaturedProducts: () => api.get("/products/featured"),
  getProductById: (id) => api.get(`/products/${id}`),
  getRelatedProducts: (id) => api.get(`/products/${id}/related`),
};
