import client from './client';

export const categoryApi = {
  getCategories: () => client.get('/categories'),
  
  // Admin endpoints
  updateSizeGuide: (id, data) => client.put(`/admin/categories/${id}/size-guide`, data),
};
