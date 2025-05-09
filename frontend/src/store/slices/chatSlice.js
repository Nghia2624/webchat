import { createSlice, createAsyncThunk, createSelector } from '@reduxjs/toolkit';
import { chatAPI } from '../../services';
import websocketService from '../../services/websocket';

// Async thunk actions
export const createPersonalConversation = createAsyncThunk(
  'chat/createPersonalConversation',
  async (recipientId, { rejectWithValue }) => {
    try {
      const response = await chatAPI.createPersonalConversation(recipientId);
      return response.data;
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
      return response.data;
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
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const getMessages = createAsyncThunk(
  'chat/getMessages',
  async ({ conversationId, offset = 0, limit = 20 }, { rejectWithValue }) => {
    try {
      const response = await chatAPI.getMessages(conversationId, offset, limit);
      return { conversationId, messages: response.data, hasMore: response.data.length >= limit };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const sendMessage = createAsyncThunk(
  'chat/sendMessage',
  async ({ conversationId, content, attachment }, { getState, rejectWithValue }) => {
    try {
      // Tạo message với ID tạm thời để hiển thị ngay
      const tempId = `temp-${Date.now()}`;
      const currentUserId = getState().auth.user?.id;
      
      // Gửi message thông qua websocket và lưu response
      const messageData = await websocketService.sendMessage(conversationId, content, attachment);
      
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

/**
 * Sắp xếp tin nhắn theo thời gian tạo
 */
const sortMessagesByDate = (messages) => {
  return [...messages].sort((a, b) => {
    return new Date(a.createdAt) - new Date(b.createdAt);
  });
};

/**
 * Gộp tin nhắn và loại bỏ trùng lặp
 */
const mergeMessages = (existingMessages, newMessages, prepend = false) => {
  // Tạo Map với key là ID tin nhắn để loại bỏ trùng lặp
  const messagesMap = new Map();
  
  // Thêm tin nhắn hiện có vào map
  existingMessages.forEach(msg => {
    messagesMap.set(msg.id, msg);
  });
  
  // Thêm hoặc cập nhật với tin nhắn mới
  newMessages.forEach(msg => {
    // Nếu tồn tại tin nhắn tạm thời có cùng nội dung, thay thế nó
    if (!msg.isTemp) {
      const tempMessage = existingMessages.find(m => 
        m.isTemp && 
        m.senderId === msg.senderId && 
        m.content === msg.content &&
        Math.abs(new Date(m.createdAt) - new Date(msg.createdAt)) < 60000 // Trong vòng 1 phút
      );
      
      if (tempMessage) {
        messagesMap.delete(tempMessage.id);
      }
    }
    
    messagesMap.set(msg.id, msg);
  });
  
  // Chuyển map lại thành mảng và sắp xếp theo thời gian
  return sortMessagesByDate(Array.from(messagesMap.values()));
};

const initialState = {
  conversations: [],
  activeConversation: null,
  messages: {},
  loading: false,
  loadingMore: false,
  hasMoreMessages: {}, // conversationId -> boolean
  connectionStatus: 'disconnected', // 'disconnected', 'connecting', 'connected', 'reconnecting', 'failed'
  error: null,
  onlineUsers: [],
  typingUsers: {}, // conversationId -> mảng userIds đang nhập
  messageCache: {}, // Cache cho tối ưu hóa việc tải tin nhắn
  unreadCounts: {}, // conversationId -> số tin nhắn chưa đọc
  selectedMessages: [], // Danh sách ID tin nhắn được chọn (cho chức năng trả lời, chuyển tiếp, v.v.)
  lastReadTime: {}, // conversationId -> thời gian cuối cùng đọc tin nhắn
  loadingConversations: false,
  loadingMessages: false,
  sendingMessages: {}, // Record<conversationId, boolean>
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setActiveConversation: (state, action) => {
      const prevActiveId = state.activeConversation?.id;
      state.activeConversation = action.payload;
      
      // Đặt lại số lượng chưa đọc khi mở cuộc trò chuyện
      if (action.payload && state.unreadCounts[action.payload.id]) {
        state.unreadCounts[action.payload.id] = 0;
      }
      
      // Xóa danh sách tin nhắn được chọn khi chuyển cuộc trò chuyện
      if (prevActiveId !== action.payload?.id) {
        state.selectedMessages = [];
      }
      
      // Cập nhật thời gian đọc cuối cùng
      if (action.payload) {
        state.lastReadTime[action.payload.id] = new Date().toISOString();
      }
    },
    addMessage: (state, action) => {
      const message = action.payload;
      if (!message || !message.conversationId) return;
      
      const { conversationId } = message;
      
      // Đảm bảo có một mảng cho cuộc trò chuyện này
      if (!state.messages[conversationId]) {
        state.messages[conversationId] = [];
      }
      
      // Không thêm trùng lặp
      if (!state.messages[conversationId].find(msg => msg.id === message.id)) {
        // Thay thế tin nhắn tạm thời nếu tồn tại
        const tempIndex = state.messages[conversationId].findIndex(
          m => m.isTemp && 
          m.senderId === message.senderId && 
          m.content === message.content &&
          Math.abs(new Date(m.createdAt) - new Date(message.createdAt)) < 60000
        );
        
        if (tempIndex !== -1) {
          state.messages[conversationId].splice(tempIndex, 1);
        }
        
        state.messages[conversationId].push(message);
        
        // Giữ tin nhắn được sắp xếp theo ngày
        state.messages[conversationId] = sortMessagesByDate(state.messages[conversationId]);
        
        // Cập nhật số lượng chưa đọc cho tin nhắn không phải từ người dùng hiện tại
        const currentUserId = state.activeConversation?.user_id;
        if (message.senderId !== currentUserId) {
          // Chỉ tăng nếu không xem cuộc trò chuyện này
          if (!state.activeConversation || state.activeConversation.id !== conversationId) {
            if (!state.unreadCounts[conversationId]) {
              state.unreadCounts[conversationId] = 0;
            }
            state.unreadCounts[conversationId]++;
          } else {
            // Cập nhật thời gian đọc cuối cùng nếu đang xem cuộc trò chuyện
            state.lastReadTime[conversationId] = new Date().toISOString();
          }
        }
      }
      
      // Cập nhật cuộc trò chuyện với tin nhắn cuối cùng
      const conversationIndex = state.conversations.findIndex(c => c.id === conversationId);
      if (conversationIndex !== -1) {
        state.conversations[conversationIndex].lastMessage = message;
        
        // Di chuyển cuộc trò chuyện lên đầu danh sách
        const [conversation] = state.conversations.splice(conversationIndex, 1);
        state.conversations.unshift(conversation);
      }
    },
    setOnlineUsers: (state, action) => {
      state.onlineUsers = action.payload;
    },
    updateMessageStatus: (state, action) => {
      const { message_id, status } = action.payload;
      
      // Tìm và cập nhật trạng thái tin nhắn trong tất cả các cuộc trò chuyện
      Object.keys(state.messages).forEach(conversationId => {
        const messages = state.messages[conversationId];
        const messageIndex = messages.findIndex(msg => msg.id === message_id);
        
        if (messageIndex !== -1) {
          messages[messageIndex].status = status;
        }
      });
    },
    setTypingStatus: (state, action) => {
      const { conversation_id, user_id, is_typing } = action.payload;
      
      // Đảm bảo chúng ta có một mảng cho cuộc trò chuyện này
      if (!state.typingUsers[conversation_id]) {
        state.typingUsers[conversation_id] = [];
      }
      
      if (is_typing) {
        // Thêm người dùng vào mảng đang nhập nếu chưa có
        if (!state.typingUsers[conversation_id].includes(user_id)) {
          state.typingUsers[conversation_id].push(user_id);
        }
      } else {
        // Xóa người dùng khỏi mảng đang nhập
        state.typingUsers[conversation_id] = state.typingUsers[conversation_id].filter(id => id !== user_id);
      }
    },
    resetUnreadCount: (state, action) => {
      const conversationId = action.payload;
      if (conversationId) {
        state.unreadCounts[conversationId] = 0;
        state.lastReadTime[conversationId] = new Date().toISOString();
      }
    },
    setConnectionStatus: (state, action) => {
      state.connectionStatus = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearConversation: (state, action) => {
      const conversationId = action.payload;
      if (state.messages[conversationId]) {
        delete state.messages[conversationId];
      }
      if (state.hasMoreMessages[conversationId]) {
        delete state.hasMoreMessages[conversationId];
      }
      if (state.unreadCounts[conversationId]) {
        delete state.unreadCounts[conversationId];
      }
      if (state.lastReadTime[conversationId]) {
        delete state.lastReadTime[conversationId];
      }
      if (state.typingUsers[conversationId]) {
        delete state.typingUsers[conversationId];
      }
    },
    clearAllChat: (state) => {
      state.messages = {};
      state.activeConversation = null;
      state.hasMoreMessages = {};
      state.unreadCounts = {};
      state.lastReadTime = {};
      state.typingUsers = {};
      state.selectedMessages = [];
    },
    markMessageFailed: (state, action) => {
      const { messageId, conversationId } = action.payload;
      if (state.messages[conversationId]) {
        const messageIndex = state.messages[conversationId].findIndex(msg => msg.id === messageId);
        if (messageIndex !== -1) {
          state.messages[conversationId][messageIndex].status = 'failed';
        }
      }
    },
    retryMessage: (state, action) => {
      const { messageId, conversationId } = action.payload;
      if (state.messages[conversationId]) {
        const messageIndex = state.messages[conversationId].findIndex(msg => msg.id === messageId);
        if (messageIndex !== -1) {
          state.messages[conversationId][messageIndex].status = 'sending';
        }
      }
    },
    selectMessage: (state, action) => {
      const messageId = action.payload;
      if (!state.selectedMessages.includes(messageId)) {
        state.selectedMessages.push(messageId);
      }
    },
    unselectMessage: (state, action) => {
      const messageId = action.payload;
      state.selectedMessages = state.selectedMessages.filter(id => id !== messageId);
    },
    clearSelectedMessages: (state) => {
      state.selectedMessages = [];
    },
    updateLastReadTime: (state, action) => {
      const { conversationId, timestamp = new Date().toISOString() } = action.payload;
      if (conversationId) {
        state.lastReadTime[conversationId] = timestamp;
      }
    },
    setTyping: (state, action) => {
      const { conversationId, isTyping } = action.payload;
      if (isTyping) {
        // Gửi trạng thái đang nhập qua websocket
        websocketService.sendTypingStatus(conversationId, true);
      } else {
        // Gửi trạng thái dừng nhập qua websocket
        websocketService.sendTypingStatus(conversationId, false);
      }
    },
    updateTypingStatus: (state, action) => {
      const { conversationId, userId, isTyping } = action.payload;
      
      if (!state.typingUsers[conversationId]) {
        state.typingUsers[conversationId] = [];
      }
      
      if (isTyping) {
        // Thêm user vào danh sách typing nếu chưa có
        if (!state.typingUsers[conversationId].includes(userId)) {
          state.typingUsers[conversationId].push(userId);
        }
      } else {
        // Xóa user khỏi danh sách typing
        state.typingUsers[conversationId] = state.typingUsers[conversationId].filter(
          id => id !== userId
        );
      }
    },
    receiveMessage: (state, action) => {
      const { message } = action.payload;
      const conversationId = message.conversationId;
      
      // Tìm conversation
      const conversation = state.conversations.find(c => c.id === conversationId);
      if (!conversation) return;
      
      // Thêm tin nhắn vào conversation
      if (!conversation.messages) {
        conversation.messages = [];
      }
      
      // Kiểm tra xem tin nhắn đã tồn tại chưa
      const messageExists = conversation.messages.some(m => m.id === message.id);
      if (!messageExists) {
        conversation.messages.push(message);
      }
      
      // Cập nhật lastMessage
      conversation.lastMessage = message;
      
      // Cập nhật unreadCount nếu không phải tin nhắn của mình và không phải conversation đang active
      if (message.senderId !== state.auth.user?.id && 
          (!state.activeConversation || state.activeConversation.id !== conversationId)) {
        conversation.unreadCount = (conversation.unreadCount || 0) + 1;
      }
      
      // Xóa user khỏi trạng thái typing
      if (state.typingUsers[conversationId]) {
        state.typingUsers[conversationId] = state.typingUsers[conversationId].filter(
          id => id !== message.senderId
        );
      }
    },
    updateMessageReadStatus: (state, action) => {
      const { conversationId, messageId, userId } = action.payload;
      
      // Tìm conversation
      const conversation = state.conversations.find(c => c.id === conversationId);
      if (!conversation || !conversation.messages) return;
      
      // Tìm tin nhắn
      const message = conversation.messages.find(m => m.id === messageId);
      if (!message) return;
      
      // Cập nhật trạng thái đọc
      message.readBy = [...(message.readBy || []), userId];
      
      // Cập nhật trạng thái tin nhắn
      message.status = 'read';
    }
  },
  extraReducers: (builder) => {
    builder
      // getConversations reducers
      .addCase(getConversations.pending, (state) => {
        state.loadingConversations = true;
        state.error = null;
      })
      .addCase(getConversations.fulfilled, (state, action) => {
        state.conversations = action.payload;
        state.loadingConversations = false;
      })
      .addCase(getConversations.rejected, (state, action) => {
        state.loadingConversations = false;
        state.error = action.payload || 'Failed to fetch conversations';
      })
        
      // createPersonalConversation reducers
      .addCase(createPersonalConversation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPersonalConversation.fulfilled, (state, action) => {
        state.loading = false;
        
        // Kiểm tra xem cuộc trò chuyện đã tồn tại chưa
        if (!state.conversations.some(conv => conv.id === action.payload.id)) {
          state.conversations.unshift(action.payload);
        }
        
        // Đặt làm cuộc trò chuyện đang hoạt động
        state.activeConversation = action.payload;
        state.lastReadTime[action.payload.id] = new Date().toISOString();
      })
      .addCase(createPersonalConversation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || 'Không thể tạo cuộc trò chuyện';
      })
      
      // createGroupConversation reducers
      .addCase(createGroupConversation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createGroupConversation.fulfilled, (state, action) => {
        state.loading = false;
        state.conversations.unshift(action.payload);
        state.activeConversation = action.payload;
        state.lastReadTime[action.payload.id] = new Date().toISOString();
      })
      .addCase(createGroupConversation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || 'Không thể tạo nhóm chat';
      })
      
      // getMessages reducers
      .addCase(getMessages.pending, (state) => {
        state.loadingMessages = true;
        state.error = null;
      })
      .addCase(getMessages.fulfilled, (state, action) => {
        const { conversationId, messages, hasMore } = action.payload;
        state.loadingMessages = false;
        
        if (!state.messages[conversationId]) {
          state.messages[conversationId] = [];
        }
        
        state.messages[conversationId] = mergeMessages(
          state.messages[conversationId],
          messages,
          false
        );
        
        // Cập nhật cờ có thêm
        state.hasMoreMessages[conversationId] = hasMore;
        
        // Đặt lại số lượng chưa đọc khi tải tin nhắn cho cuộc trò chuyện đang hoạt động
        if (state.activeConversation && state.activeConversation.id === conversationId) {
          state.unreadCounts[conversationId] = 0;
          state.lastReadTime[conversationId] = new Date().toISOString();
        }
      })
      .addCase(getMessages.rejected, (state, action) => {
        state.loadingMessages = false;
        state.error = action.payload || 'Failed to fetch messages';
      })
      
      // sendMessage reducers
      .addCase(sendMessage.pending, (state, action) => {
        const { conversationId, content, attachment } = action.meta.arg;
        const currentUserId = state.auth.user?.id;
        
        // Tìm conversation
        const conversation = state.conversations.find(c => c.id === conversationId);
        if (!conversation) return;
        
        // Tạo tin nhắn tạm thời
        const tempMessage = {
          id: `temp-${Date.now()}`,
          conversationId,
          senderId: currentUserId,
          content,
          attachment,
          createdAt: new Date().toISOString(),
          status: 'sending'
        };
        
        // Thêm tin nhắn vào conversation
        if (!conversation.messages) {
          conversation.messages = [tempMessage];
        } else {
          conversation.messages.push(tempMessage);
        }
        
        // Cập nhật lastMessage
        conversation.lastMessage = tempMessage;
        
        // Set sending status
        state.sendingMessages[conversationId] = true;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        const { conversationId, tempId, message } = action.payload;
        
        // Tìm conversation
        const conversation = state.conversations.find(c => c.id === conversationId);
        if (!conversation || !conversation.messages) return;
        
        // Tìm tin nhắn tạm thời và thay thế bằng tin nhắn thật
        const tempIndex = conversation.messages.findIndex(m => m.id === tempId);
        if (tempIndex !== -1) {
          conversation.messages[tempIndex] = message;
        }
        
        // Cập nhật lastMessage
        conversation.lastMessage = message;
        
        // Clear sending status
        state.sendingMessages[conversationId] = false;
      })
      .addCase(sendMessage.rejected, (state, action) => {
        const { conversationId, error } = action.payload;
        
        // Tìm conversation
        const conversation = state.conversations.find(c => c.id === conversationId);
        if (!conversation || !conversation.messages) return;
        
        // Tìm tin nhắn tạm thời và đánh dấu là failed
        const tempMessage = conversation.messages.find(m => m.id.startsWith('temp-'));
        if (tempMessage) {
          tempMessage.status = 'failed';
          tempMessage.error = error;
        }
        
        // Clear sending status
        state.sendingMessages[conversationId] = false;
      })
      
      // markMessagesAsRead
      .addCase(markMessagesAsRead.fulfilled, (state, action) => {
        const { conversationId, messageIds } = action.payload;
        
        // Tìm conversation
        const conversation = state.conversations.find(c => c.id === conversationId);
        if (!conversation || !conversation.messages) return;
        
        // Cập nhật trạng thái đọc cho tin nhắn
        for (const messageId of messageIds) {
          const message = conversation.messages.find(m => m.id === messageId);
          if (message) {
            message.isRead = true;
          }
        }
        
        // Giảm unreadCount
        conversation.unreadCount = 0;
      });
  },
});

export const { 
  setActiveConversation, 
  addMessage, 
  setOnlineUsers, 
  updateMessageStatus, 
  setTypingStatus,
  resetUnreadCount,
  setConnectionStatus,
  clearError,
  clearConversation,
  clearAllChat,
  markMessageFailed,
  retryMessage,
  selectMessage,
  unselectMessage,
  clearSelectedMessages,
  updateLastReadTime,
  setTyping,
  updateTypingStatus,
  receiveMessage,
  updateMessageReadStatus
} = chatSlice.actions;

// Selectors
export const selectActiveConversation = (state) => state.chat.activeConversation;
export const selectAllConversations = (state) => state.chat.conversations;
export const selectConnectionStatus = (state) => state.chat.connectionStatus;
export const selectChatLoading = (state) => state.chat.loading;
export const selectLoadingMore = (state) => state.chat.loadingMore;
export const selectChatError = (state) => state.chat.error;

export const selectConversationMessages = createSelector(
  [(state) => state.chat.messages, (_, conversationId) => conversationId],
  (messages, conversationId) => messages[conversationId] || []
);

export const selectHasMoreMessages = createSelector(
  [(state) => state.chat.hasMoreMessages, (_, conversationId) => conversationId],
  (hasMoreMessages, conversationId) => !!hasMoreMessages[conversationId]
);

export const selectUnreadCount = createSelector(
  [(state) => state.chat.unreadCounts, (_, conversationId) => conversationId],
  (unreadCounts, conversationId) => unreadCounts[conversationId] || 0
);

export const selectTotalUnreadCount = createSelector(
  [(state) => state.chat.unreadCounts],
  (unreadCounts) => Object.values(unreadCounts).reduce((sum, count) => sum + count, 0)
);

export const selectTypingUsers = createSelector(
  [(state) => state.chat.typingUsers, (_, conversationId) => conversationId],
  (typingUsers, conversationId) => typingUsers[conversationId] || []
);

export const selectIsUserOnline = createSelector(
  [(state) => state.chat.onlineUsers, (_, userId) => userId],
  (onlineUsers, userId) => onlineUsers.includes(userId)
);

export const selectSelectedMessages = (state) => state.chat.selectedMessages;

export const selectLastReadTime = createSelector(
  [(state) => state.chat.lastReadTime, (_, conversationId) => conversationId],
  (lastReadTime, conversationId) => lastReadTime[conversationId] || null
);

export default chatSlice.reducer;