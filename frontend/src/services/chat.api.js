import axios from 'axios';
import { API_URL } from '../config';

const chatAPI = {
  getConversations: async () => {
    const response = await axios.get(`${API_URL}/conversations`);
    return response.data;
  },

  getMessages: async (conversationId, offset = 0, limit = 20) => {
    const response = await axios.get(`${API_URL}/conversations/${conversationId}/messages`, {
      params: { offset, limit }
    });
    return response.data;
  },

  createPersonalConversation: async (recipientId) => {
    const response = await axios.post(`${API_URL}/conversations/personal`, { recipientId });
    return response.data;
  },

  createGroupConversation: async (name, participantIds) => {
    const response = await axios.post(`${API_URL}/conversations/group`, { name, participantIds });
    return response.data;
  },

  markMessagesAsRead: async (conversationId, messageIds) => {
    const response = await axios.put(`${API_URL}/messages/batch-read`, {
      conversationId,
      messageIds
    });
    return response.data;
  }
};

export default chatAPI; 