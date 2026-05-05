import api from "./client";

export const addressApi = {
  getAddresses: () => api.get("/addresses"),
  createAddress: (data) => api.post("/addresses", data),
  updateAddress: (id, data) => api.patch(`/addresses/${id}`, data),
  deleteAddress: (id) => api.delete(`/addresses/${id}`),
  setDefaultAddress: (id) => api.patch(`/addresses/${id}/default`),
};
