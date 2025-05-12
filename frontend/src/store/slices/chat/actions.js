import { createAsyncThunk } from '@reduxjs/toolkit';
import chatAPI from '../../../services/chat.api';

// Conversation actions
export const createPersonalConversation = createAsyncThunk(
  'chat/createPersonalConversation',
  async (recipientId, { rejectWithValue }) => {
    try {
      const response = await chatAPI.createPersonalConversation(recipientId);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const createGroupConversation = createAsyncThunk(
  'chat/createGroupConversation',
  async ({ name, participantIds }, { rejectWithValue }) => {
    try {
      const response = await chatAPI.createGroupConversation(name, participantIds);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const getConversations = createAsyncThunk(
  'chat/getConversations',
  async (_, { rejectWithValue }) => {
    try {
      const response = await chatAPI.getConversations();
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateConversation = createAsyncThunk(
  'chat/updateConversation',
  async ({ conversationId, data }, { rejectWithValue }) => {
    try {
      const response = await chatAPI.updateConversation(conversationId, data);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deleteConversation = createAsyncThunk(
  'chat/deleteConversation',
  async (conversationId, { rejectWithValue }) => {
    try {
      await chatAPI.deleteConversation(conversationId);
      return conversationId;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Message actions
export const getMessages = createAsyncThunk(
  'chat/getMessages',
  async ({ conversationId, offset = 0, limit = 20 }, { rejectWithValue }) => {
    try {
      const response = await chatAPI.getMessages(conversationId, offset, limit);
      return { conversationId, messages: response, hasMore: response.length >= limit };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const sendMessage = createAsyncThunk(
  'chat/sendMessage',
  async ({ conversationId, content, attachments = [] }, { getState, rejectWithValue }) => {
    try {
      const tempId = `temp-${Date.now()}`;
      const currentUserId = getState().auth.user?.id;
      
      const messageData = await chatAPI.sendMessage(conversationId, content, attachments);
      
      return {
        conversationId,
        tempId,
        message: messageData
      };
    } catch (error) {
      return rejectWithValue({
        conversationId,
        error: error.message
      });
    }
  }
);

export const markMessagesAsRead = createAsyncThunk(
  'chat/markMessagesAsRead',
  async ({ conversationId, messageIds }, { rejectWithValue }) => {
    try {
      await chatAPI.markMessagesAsRead(conversationId, messageIds);
      return { conversationId, messageIds };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deleteMessageAction = createAsyncThunk(
  'chat/deleteMessage',
  async ({ messageId, conversationId }, { rejectWithValue }) => {
    try {
      await chatAPI.deleteMessage(messageId);
      return { messageId, conversationId };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateMessageAction = createAsyncThunk(
  'chat/updateMessage',
  async ({ messageId, content }, { rejectWithValue }) => {
    try {
      const response = await chatAPI.updateMessage(messageId, content);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Participant actions
export const addParticipants = createAsyncThunk(
  'chat/addParticipants',
  async ({ conversationId, participantIds }, { rejectWithValue }) => {
    try {
      const response = await chatAPI.addParticipants(conversationId, participantIds);
      return { conversationId, participants: response };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const removeParticipant = createAsyncThunk(
  'chat/removeParticipant',
  async ({ conversationId, participantId }, { rejectWithValue }) => {
    try {
      await chatAPI.removeParticipant(conversationId, participantId);
      return { conversationId, participantId };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
); 