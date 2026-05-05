import api from "./client";

export const orderApi = {
  getOrders: () => api.get("/orders"),
  getOrderById: (id) => api.get(`/orders/${id}`),
  getOrderByNumber: (orderNumber) => api.get(`/orders/by-number/${orderNumber}`),
  getTracking: (id) => api.get(`/orders/${id}/tracking`),
};
