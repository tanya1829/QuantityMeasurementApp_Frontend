// src/utils/api.js
import axios from 'axios';

const BASE_URL = 'http://localhost:5071/api/v1';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach token to every request if present
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// AUTH
export const loginUser = (email, password) =>
  api.post('/auth/login', { email, password });

export const registerUser = (name, email, password) =>
  api.post('/auth/register', { name, email, password });

export const forgotPassword = (email) =>
  api.post('/auth/forgot-password', { email });

// HISTORY
export const getHistory = () => api.get('/history');

export const saveHistory = (entry) => api.post('/history', entry);

export const deleteHistory = (id) => api.delete(`/history/${id}`);

export const clearAllHistory = () => api.delete('/history');

export default api;