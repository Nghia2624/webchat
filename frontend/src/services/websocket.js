/**
 * @deprecated This file is deprecated. Please use WebSocketContext instead.
 * This provides compatibility for existing code but should be migrated to 
 * WebSocketContext (../contexts/WebSocketContext.jsx)
 */

import { addMessage, setOnlineUsers, setTypingStatus, setConnectionStatus } from '../store/slices/chatSlice';

// Basic state
let socket = null;
let store = null;

console.warn('websocket.js is deprecated - migrate to WebSocketContext component');

// Set store reference
export const setStore = (storeRef) => {
  store = storeRef;
};

// Get store reference
export const getStore = () => {
  if (!store) {
    console.error('Store not set in websocket service');
  }
  return store;
};

// Connect websocket - compatibility stub
export const connectWebSocket = () => {
  return null;
};

// Disconnect websocket - compatibility stub
export const disconnectWebSocket = () => {
  return null;
};

// Send typing status - compatibility stub
export const sendTypingStatus = (conversationId, isTyping) => {
  return null;
};

// Send message - compatibility stub
export const sendMessage = (conversationId, content, attachment = null) => {
  return Promise.resolve({ id: 'deprecated' });
};

// Initialize - compatibility stub
export const initializeWebSocket = () => {
  return null;
};

// Get connection status - compatibility stub
export const getConnectionStatus = () => {
  return 'disconnected';
};

export default {
  setStore,
  getStore,
  connectWebSocket,
  disconnectWebSocket,
  sendTypingStatus,
  sendMessage,
  initializeWebSocket,
  getConnectionStatus
};