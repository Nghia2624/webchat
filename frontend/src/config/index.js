// API Configuration
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8081/api';
export const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8081/api/ws';

// Authentication
export const TOKEN_KEY = 'auth_token';
export const REFRESH_TOKEN_KEY = 'refresh_token';

// Chat Configuration
export const MESSAGE_PAGE_SIZE = 20;
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];

// UI Configuration
export const TYPING_DEBOUNCE = 500; // ms
export const NOTIFICATION_DURATION = 3000; // ms
export const MAX_MESSAGE_LENGTH = 1000;

const config = {
  APP_NAME: 'Web Chat',
  VERSION: '1.0.0',
  DEFAULT_AVATAR: '/images/default-avatar.png',
  MESSAGE_LIMIT: 50,
  FRIEND_REQUEST_LIMIT: 20,
  SEARCH_LIMIT: 10,
  TOAST_DURATION: 3000,
  REFRESH_TOKEN_INTERVAL: 14 * 60 * 1000, // 14 minutes
};

export default config; 