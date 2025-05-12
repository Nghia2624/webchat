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
  },

  sendMessage: async (conversationId, content, attachments = []) => {
    const formData = new FormData();
    formData.append('content', content);
    attachments.forEach(file => {
      formData.append('attachments', file);
    });

    const response = await axios.post(
      `${API_URL}/conversations/${conversationId}/messages`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    );
    return response.data;
  },

  deleteMessage: async (messageId) => {
    const response = await axios.delete(`${API_URL}/messages/${messageId}`);
    return response.data;
  },

  updateMessage: async (messageId, content) => {
    const response = await axios.put(`${API_URL}/messages/${messageId}`, { content });
    return response.data;
  },

  addParticipants: async (conversationId, participantIds) => {
    const response = await axios.post(`${API_URL}/conversations/${conversationId}/participants`, {
      participantIds
    });
    return response.data;
  },

  removeParticipant: async (conversationId, participantId) => {
    const response = await axios.delete(
      `${API_URL}/conversations/${conversationId}/participants/${participantId}`
    );
    return response.data;
  },

  updateConversation: async (conversationId, data) => {
    const response = await axios.put(`${API_URL}/conversations/${conversationId}`, data);
    return response.data;
  },

  deleteConversation: async (conversationId) => {
    const response = await axios.delete(`${API_URL}/conversations/${conversationId}`);
    return response.data;
  }
};

export default chatAPI; 