import api from "./client";

export const adminApi = {
  getDashboard: () => api.get("/admin/dashboard"),
  getOrders: (params) => api.get("/admin/orders", { params }),
  updateOrderStatus: (id, status) => api.patch(`/admin/orders/${id}/status`, { status }),
  getProducts: (params) => api.get("/admin/products", { params }),
  uploadProductImage: (file) => {
    const formData = new FormData();
    formData.append("image", file);
    return api.post("/admin/products/images", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
  createProduct: (data) => api.post("/admin/products", data),
  updateProduct: (id, data) => api.patch(`/admin/products/${id}`, data),
  deleteProduct: (id) => api.delete(`/admin/products/${id}`),
  confirmOrderPayment: (id) => api.patch(`/admin/orders/${id}/payment`),
  getProductVariants: (productId) => api.get(`/admin/products/${productId}/variants`),
  updateVariantStock: (productId, variantId, stockQuantity) =>
    api.patch(`/admin/products/${productId}/variants/${variantId}/stock`, { stockQuantity }),
  initializeVariants: (productId, data) =>
    api.post(`/admin/products/${productId}/variants/initialize`, data),
};

export default adminApi;
