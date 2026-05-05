import api from "./client";

export const userApi = {
  updateProfile: (data) => api.patch("/users/me", data),
  getStats: () => api.get("/users/me/stats"),
};

export default userApi;
