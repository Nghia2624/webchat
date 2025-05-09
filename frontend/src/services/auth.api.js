import axios from 'axios';
import { API_URL } from '../config';

const authAPI = {
  login: async (email, password) => {
    const response = await axios.post(`${API_URL}/auth/login`, { email, password });
    return response.data;
  },

  register: async (userData) => {
    const response = await axios.post(`${API_URL}/auth/register`, userData);
    return response.data;
  },

  refreshToken: async (refreshToken) => {
    const response = await axios.post(`${API_URL}/auth/refresh`, { refreshToken });
    return response.data;
  },

  logout: async () => {
    // Implement if needed
  }
};

export default authAPI; 