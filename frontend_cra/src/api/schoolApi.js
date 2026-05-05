import api from "./client";

export const schoolApi = {
  getSchools: (params = {}) => api.get("/schools", { params }),
  getSchoolById: (id) => api.get(`/schools/${id}`),
};
