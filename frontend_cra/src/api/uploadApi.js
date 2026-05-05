import axios from 'axios';

const uploadClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL?.replace('/api/v1', '') || 'http://localhost:8080',
});

uploadClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const uploadApi = {
  uploadImage: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return uploadClient.post('/api/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};
