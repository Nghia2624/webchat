import { createSlice } from '@reduxjs/toolkit';
import * as actions from './chat/actions';
import * as selectors from './chat/selectors';
import { mergeMessages } from './chat/utils';

const initialState = {
  conversations: [],
  messages: {},
  activeConversation: null,
  loading: false,
  loadingMore: false,
  error: null,
  message: null,
  connectionStatus: 'disconnected',
  onlineUsers: [],
  typingUsers: {},
  selectedMessages: [],
  unreadCounts: {},
  loadingConversations: false,
  loadingMessages: false,
  sendingMessages: []
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setActiveConversation: (state, action) => {
      state.activeConversation = action.payload;
    },
    setConnectionStatus: (state, action) => {
      state.connectionStatus = action.payload;
    },
    addMessage: (state, action) => {
      const message = action.payload;
      const conversationId = message.conversationId;
      
      if (!state.messages[conversationId]) {
        state.messages[conversationId] = [];
      }
      
      // Check if message already exists
      const existingMessageIndex = state.messages[conversationId].findIndex(
        msg => msg.id === message.id
      );
      
      if (existingMessageIndex === -1) {
        state.messages[conversationId].push(message);
      } else {
        state.messages[conversationId][existingMessageIndex] = message;
      }
      
      // Update conversation last message
      const conversationIndex = state.conversations.findIndex(
        conv => conv.id === conversationId
      );
      
      if (conversationIndex !== -1) {
        state.conversations[conversationIndex] = {
          ...state.conversations[conversationIndex],
          lastMessage: message,
          updatedAt: message.createdAt
        };
      }
    },
    updateMessageStatus: (state, action) => {
      const { id, status } = action.payload;
      Object.keys(state.messages).forEach(conversationId => {
        const messageIndex = state.messages[conversationId].findIndex(
          msg => msg.id === id
        );
        if (messageIndex !== -1) {
          state.messages[conversationId][messageIndex] = {
            ...state.messages[conversationId][messageIndex],
            status
          };
        }
      });
    },
    updateTypingStatus: (state, action) => {
      const { conversationId, userId, isTyping } = action.payload;
      if (!state.typingUsers[conversationId]) {
        state.typingUsers[conversationId] = [];
      }
      if (isTyping && !state.typingUsers[conversationId].includes(userId)) {
        state.typingUsers[conversationId].push(userId);
      } else if (!isTyping) {
        state.typingUsers[conversationId] = state.typingUsers[conversationId].filter(
          id => id !== userId
        );
      }
    },
    addOnlineUser: (state, action) => {
      if (!state.onlineUsers.includes(action.payload)) {
        state.onlineUsers.push(action.payload);
      }
    },
    removeOnlineUser: (state, action) => {
      state.onlineUsers = state.onlineUsers.filter(id => id !== action.payload);
    },
    selectMessage: (state, action) => {
      const messageId = action.payload;
      if (!state.selectedMessages.includes(messageId)) {
        state.selectedMessages.push(messageId);
      }
    },
    deselectMessage: (state, action) => {
      const messageId = action.payload;
      state.selectedMessages = state.selectedMessages.filter(id => id !== messageId);
    },
    clearSelectedMessages: (state) => {
      state.selectedMessages = [];
    },
    incrementUnreadCount: (state, action) => {
      const conversationId = action.payload;
      state.unreadCounts[conversationId] = (state.unreadCounts[conversationId] || 0) + 1;
    },
    clearUnreadCount: (state, action) => {
      const conversationId = action.payload;
      state.unreadCounts[conversationId] = 0;
    },
    addSendingMessage: (state, action) => {
      state.sendingMessages.push(action.payload);
    },
    removeSendingMessage: (state, action) => {
      state.sendingMessages = state.sendingMessages.filter(id => id !== action.payload);
    }
  },
  extraReducers: (builder) => {
    // Create personal conversation
    builder
      .addCase(actions.createPersonalConversation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(actions.createPersonalConversation.fulfilled, (state, action) => {
        state.loading = false;
        state.conversations.unshift(action.payload);
      })
      .addCase(actions.createPersonalConversation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

    // Create group conversation
      .addCase(actions.createGroupConversation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(actions.createGroupConversation.fulfilled, (state, action) => {
        state.loading = false;
        state.conversations.unshift(action.payload);
      })
      .addCase(actions.createGroupConversation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

    // Get conversations
      .addCase(actions.getConversations.pending, (state) => {
        state.loadingConversations = true;
        state.error = null;
      })
      .addCase(actions.getConversations.fulfilled, (state, action) => {
        state.loadingConversations = false;
        state.conversations = action.payload;
      })
      .addCase(actions.getConversations.rejected, (state, action) => {
        state.loadingConversations = false;
        state.error = action.payload;
      })

    // Get messages
      .addCase(actions.getMessages.pending, (state) => {
        state.loadingMessages = true;
        state.error = null;
      })
      .addCase(actions.getMessages.fulfilled, (state, action) => {
        state.loadingMessages = false;
        const { conversationId, messages, hasMore } = action.payload;
        state.messages[conversationId] = mergeMessages(
          state.messages[conversationId] || [],
          messages
        );
      })
      .addCase(actions.getMessages.rejected, (state, action) => {
        state.loadingMessages = false;
        state.error = action.payload;
      })

    // Send message
      .addCase(actions.sendMessage.pending, (state, action) => {
        const { tempId } = action.meta.arg;
        state.sendingMessages.push(tempId);
      })
      .addCase(actions.sendMessage.fulfilled, (state, action) => {
        const { conversationId, tempId, message } = action.payload;
        state.messages[conversationId] = mergeMessages(
          state.messages[conversationId] || [],
          [message]
        );
        state.sendingMessages = state.sendingMessages.filter(id => id !== tempId);
      })
      .addCase(actions.sendMessage.rejected, (state, action) => {
        const { tempId } = action.meta.arg;
        state.sendingMessages = state.sendingMessages.filter(id => id !== tempId);
        state.error = action.payload;
      })

    // Mark messages as read
      .addCase(actions.markMessagesAsRead.fulfilled, (state, action) => {
        const { conversationId, messageIds } = action.payload;
        if (state.messages[conversationId]) {
          state.messages[conversationId] = state.messages[conversationId].map(msg => {
            if (messageIds.includes(msg.id)) {
              return { ...msg, read: true };
            }
            return msg;
          });
        }
        state.unreadCounts[conversationId] = 0;
      })

    // Delete message
      .addCase(actions.deleteMessageAction.fulfilled, (state, action) => {
        const { conversationId, messageId } = action.payload;
        if (state.messages[conversationId]) {
          state.messages[conversationId] = state.messages[conversationId].filter(
            msg => msg.id !== messageId
          );
        }
      })

    // Update message
      .addCase(actions.updateMessageAction.fulfilled, (state, action) => {
        const updatedMessage = action.payload;
        const conversationId = updatedMessage.conversationId;
        if (state.messages[conversationId]) {
          state.messages[conversationId] = state.messages[conversationId].map(msg => {
            if (msg.id === updatedMessage.id) {
              return updatedMessage;
            }
            return msg;
          });
        }
      })

    // Add participants
      .addCase(actions.addParticipants.fulfilled, (state, action) => {
        const { conversationId, participants } = action.payload;
        const conversation = state.conversations.find(conv => conv.id === conversationId);
        if (conversation) {
          conversation.participants = participants;
        }
      })

    // Remove participant
      .addCase(actions.removeParticipant.fulfilled, (state, action) => {
        const { conversationId, participantId } = action.payload;
        const conversation = state.conversations.find(conv => conv.id === conversationId);
        if (conversation) {
          conversation.participants = conversation.participants.filter(
            p => p.id !== participantId
          );
        }
      })

    // Update conversation
      .addCase(actions.updateConversation.fulfilled, (state, action) => {
        const updatedConversation = action.payload;
        state.conversations = state.conversations.map(conv => {
          if (conv.id === updatedConversation.id) {
            return updatedConversation;
          }
          return conv;
        });
      })

    // Delete conversation
      .addCase(actions.deleteConversation.fulfilled, (state, action) => {
        const conversationId = action.payload;
        state.conversations = state.conversations.filter(conv => conv.id !== conversationId);
        if (state.activeConversation === conversationId) {
          state.activeConversation = null;
        }
        delete state.messages[conversationId];
        delete state.unreadCounts[conversationId];
      });
  }
});

export const {
  setActiveConversation,
  setConnectionStatus,
  addMessage,
  updateMessageStatus,
  updateTypingStatus,
  addOnlineUser,
  removeOnlineUser,
  selectMessage,
  deselectMessage,
  clearSelectedMessages,
  incrementUnreadCount,
  clearUnreadCount,
  addSendingMessage,
  removeSendingMessage
} = chatSlice.actions;

// Export actions
export const sendMessage = actions.sendMessage;
export const getMessages = actions.getMessages;
export const getConversations = actions.getConversations;
export const fetchConversations = actions.fetchConversations;
export const createPersonalConversation = actions.createPersonalConversation;
export const createGroupConversation = actions.createGroupConversation;
export const updateConversation = actions.updateConversation;
export const deleteConversation = actions.deleteConversation;
export const markMessagesAsRead = actions.markMessagesAsRead;
export const deleteMessageAction = actions.deleteMessageAction;
export const updateMessageAction = actions.updateMessageAction;
export const addParticipants = actions.addParticipants;
export const removeParticipant = actions.removeParticipant;

// Export selectors
export const selectConnectionStatus = selectors.selectConnectionStatus;
export const selectActiveConversation = selectors.selectActiveConversation;
export const selectConversations = selectors.selectConversations;
export const selectMessages = selectors.selectMessages;
export const selectLoading = selectors.selectLoading;
export const selectError = selectors.selectError;
export const selectOnlineUsers = selectors.selectOnlineUsers;
export const selectTypingUsers = selectors.selectTypingUsers;
export const selectSelectedMessages = selectors.selectSelectedMessages;
export const selectUnreadCounts = selectors.selectUnreadCounts;
export const selectSendingMessages = selectors.selectSendingMessages;

export { actions, selectors };

export default chatSlice.reducer;