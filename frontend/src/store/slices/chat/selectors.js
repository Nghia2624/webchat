import { createSelector } from '@reduxjs/toolkit';

// Basic selectors
export const selectActiveConversation = (state) => state.chat.activeConversation;
export const selectAllConversations = (state) => state.chat.conversations;
export const selectConnectionStatus = (state) => state.chat.connectionStatus;
export const selectChatLoading = (state) => state.chat.loading;
export const selectLoadingMore = (state) => state.chat.loadingMore;
export const selectChatError = (state) => state.chat.error;
export const selectChatMessage = (state) => state.chat.message;
export const selectOnlineUsers = (state) => state.chat.onlineUsers;
export const selectTypingUsers = (state) => state.chat.typingUsers;
export const selectSelectedMessages = (state) => state.chat.selectedMessages;
export const selectUnreadCounts = (state) => state.chat.unreadCounts;
export const selectLoadingConversations = (state) => state.chat.loadingConversations;
export const selectLoadingMessages = (state) => state.chat.loadingMessages;
export const selectSendingMessages = (state) => state.chat.sendingMessages;

// Derived selectors
export const selectConversationById = createSelector(
  [selectAllConversations, (_, conversationId) => conversationId],
  (conversations, conversationId) => conversations.find(conv => conv.id === conversationId)
);

export const selectMessagesByConversationId = createSelector(
  [(state) => state.chat.messages, (_, conversationId) => conversationId],
  (messages, conversationId) => messages[conversationId] || []
);

export const selectUnreadCountByConversationId = createSelector(
  [selectUnreadCounts, (_, conversationId) => conversationId],
  (unreadCounts, conversationId) => unreadCounts[conversationId] || 0
);

export const selectIsTyping = createSelector(
  [selectTypingUsers, (_, conversationId) => conversationId],
  (typingUsers, conversationId) => typingUsers[conversationId] || []
);

export const selectIsOnline = createSelector(
  [selectOnlineUsers, (_, userId) => userId],
  (onlineUsers, userId) => onlineUsers.includes(userId)
);

export const selectIsSendingMessage = createSelector(
  [selectSendingMessages, (_, messageId) => messageId],
  (sendingMessages, messageId) => sendingMessages.includes(messageId)
); 