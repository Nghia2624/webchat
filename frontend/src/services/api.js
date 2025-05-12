import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8081/api';

export const authApi = {
  login: (data) => axios.post(`${API_URL}/auth/login`, data),
  register: (data) => axios.post(`${API_URL}/auth/register`, data),
  refreshToken: (refreshToken) => axios.post(`${API_URL}/auth/refresh`, { refreshToken }),
}; 