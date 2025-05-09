import axios from 'axios';
import { API_URL } from '../config';

const userAPI = {
  getProfile: async () => {
    const response = await axios.get(`${API_URL}/users/profile`);
    return response.data;
  },

  updateProfile: async (userData) => {
    const response = await axios.put(`${API_URL}/users/profile`, userData);
    return response.data;
  },

  searchUsers: async (query) => {
    const response = await axios.get(`${API_URL}/users/search`, {
      params: { q: query }
    });
    return response.data;
  },

  getFriends: async () => {
    const response = await axios.get(`${API_URL}/friends`);
    return response.data;
  },

  getFriendRequests: async () => {
    const response = await axios.get(`${API_URL}/friends/requests`);
    return response.data;
  },

  sendFriendRequest: async (userId) => {
    const response = await axios.post(`${API_URL}/friends/requests`, { userId });
    return response.data;
  },

  acceptFriendRequest: async (requestId) => {
    const response = await axios.post(`${API_URL}/friends/requests/${requestId}/accept`);
    return response.data;
  },

  rejectFriendRequest: async (requestId) => {
    const response = await axios.post(`${API_URL}/friends/requests/${requestId}/reject`);
    return response.data;
  },

  removeFriend: async (friendId) => {
    const response = await axios.delete(`${API_URL}/friends/${friendId}`);
    return response.data;
  }
};

export default userAPI; 