import api from "./client";

export const schoolApi = {
  getSchools: () => api.get("/schools"),
  getSchoolDetails: (id: string) => api.get(`/schools/${id}`),
};

export default schoolApi;
