import api from "./client";

export const productApi = {
  getProducts: (params: any) => api.get("/products", { params }),
  getProductDetails: (id: string) => api.get(`/products/${id}`),
  getFeaturedProducts: () => api.get("/products/featured"),
  getCategories: () => api.get("/products/categories/all"),
};

export default productApi;
