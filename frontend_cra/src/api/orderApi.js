import api from "./client";

export const orderApi = {
  getOrders: () => api.get("/orders"),
  getOrderById: (id) => api.get(`/orders/${id}`),
  getOrderByNumber: (orderNumber) => api.get(`/orders/by-number/${orderNumber}`),
  getTracking: (id) => api.get(`/orders/${id}/tracking`),
  getCancellationReasons: () => api.get("/orders/cancellation-reasons"),
  /** Cancel with reason code (PLACED / PACKED only). */
  cancelOrder: (id, reason) => api.post(`/orders/${id}/cancel`, { reason }),
  downloadInvoice: (id) => api.get(`/orders/${id}/invoice`, { responseType: 'blob' }),
};

