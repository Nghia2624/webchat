/**
 * Application constants
 */

/**
 * API endpoints
 */
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    REFRESH_TOKEN: '/auth/refresh-token',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    VERIFY_EMAIL: '/auth/verify-email',
    LOGOUT: '/auth/logout'
  },
  USER: {
    PROFILE: '/users/profile',
    UPDATE_PROFILE: '/users/profile',
    CHANGE_PASSWORD: '/users/change-password',
    UPLOAD_AVATAR: '/users/avatar',
    SEARCH: '/users/search'
  },
  CHAT: {
    CONVERSATIONS: '/conversations',
    MESSAGES: '/messages',
    MARK_READ: '/messages/read',
    TYPING: '/messages/typing'
  },
  FRIENDS: {
    LIST: '/friends',
    REQUESTS: '/friends/requests',
    SEND_REQUEST: '/friends/requests',
    ACCEPT_REQUEST: '/friends/requests/accept',
    REJECT_REQUEST: '/friends/requests/reject',
    REMOVE: '/friends/remove'
  }
};

/**
 * WebSocket events
 */
export const WS_EVENTS = {
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  ERROR: 'error',
  MESSAGE: 'message',
  TYPING: 'typing',
  READ: 'read',
  ONLINE: 'online',
  OFFLINE: 'offline',
  FRIEND_REQUEST: 'friend_request',
  FRIEND_ACCEPT: 'friend_accept',
  FRIEND_REJECT: 'friend_reject',
  FRIEND_REMOVE: 'friend_remove'
};

/**
 * Message types
 */
export const MESSAGE_TYPES = {
  TEXT: 'text',
  IMAGE: 'image',
  FILE: 'file',
  AUDIO: 'audio',
  VIDEO: 'video',
  LOCATION: 'location',
  SYSTEM: 'system'
};

/**
 * Message status
 */
export const MESSAGE_STATUS = {
  SENDING: 'sending',
  SENT: 'sent',
  DELIVERED: 'delivered',
  READ: 'read',
  ERROR: 'error'
};

/**
 * Conversation types
 */
export const CONVERSATION_TYPES = {
  PERSONAL: 'personal',
  GROUP: 'group'
};

/**
 * User status
 */
export const USER_STATUS = {
  ONLINE: 'online',
  OFFLINE: 'offline',
  AWAY: 'away',
  BUSY: 'busy'
};

/**
 * Friend request status
 */
export const FRIEND_REQUEST_STATUS = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected'
};

/**
 * File types
 */
export const FILE_TYPES = {
  IMAGE: ['image/jpeg', 'image/png', 'image/gif'],
  AUDIO: ['audio/mpeg', 'audio/wav', 'audio/ogg'],
  VIDEO: ['video/mp4', 'video/webm', 'video/ogg'],
  DOCUMENT: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
};

/**
 * File size limits (in bytes)
 */
export const FILE_SIZE_LIMITS = {
  IMAGE: 5 * 1024 * 1024, // 5MB
  AUDIO: 10 * 1024 * 1024, // 10MB
  VIDEO: 50 * 1024 * 1024, // 50MB
  DOCUMENT: 20 * 1024 * 1024 // 20MB
};

/**
 * Pagination
 */
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100
};

/**
 * Cache keys
 */
export const CACHE_KEYS = {
  USER: 'user',
  TOKEN: 'token',
  CONVERSATIONS: 'conversations',
  MESSAGES: 'messages',
  FRIENDS: 'friends',
  SETTINGS: 'settings'
};

/**
 * Cache expiration (in milliseconds)
 */
export const CACHE_EXPIRATION = {
  USER: 24 * 60 * 60 * 1000, // 24 hours
  TOKEN: 7 * 24 * 60 * 60 * 1000, // 7 days
  CONVERSATIONS: 5 * 60 * 1000, // 5 minutes
  MESSAGES: 5 * 60 * 1000, // 5 minutes
  FRIENDS: 30 * 60 * 1000, // 30 minutes
  SETTINGS: 24 * 60 * 60 * 1000 // 24 hours
};

/**
 * Validation rules
 */
export const VALIDATION_RULES = {
  USERNAME: {
    MIN_LENGTH: 3,
    MAX_LENGTH: 30,
    PATTERN: /^[a-zA-Z0-9_]+$/
  },
  PASSWORD: {
    MIN_LENGTH: 8,
    MAX_LENGTH: 50,
    PATTERN: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/
  },
  EMAIL: {
    PATTERN: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  },
  MESSAGE: {
    MAX_LENGTH: 1000
  },
  CONVERSATION_NAME: {
    MIN_LENGTH: 3,
    MAX_LENGTH: 50
  }
};

/**
 * Error messages
 */
export const ERROR_MESSAGES = {
  REQUIRED: 'This field is required',
  INVALID_EMAIL: 'Invalid email address',
  INVALID_PASSWORD: 'Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number and one special character',
  INVALID_USERNAME: 'Username must contain only letters, numbers and underscores',
  PASSWORD_MISMATCH: 'Passwords do not match',
  INVALID_FILE_TYPE: 'Invalid file type',
  FILE_TOO_LARGE: 'File is too large',
  NETWORK_ERROR: 'Network error occurred',
  SERVER_ERROR: 'Server error occurred',
  UNAUTHORIZED: 'Unauthorized access',
  FORBIDDEN: 'Access forbidden',
  NOT_FOUND: 'Resource not found',
  VALIDATION_ERROR: 'Validation failed'
};

/**
 * Success messages
 */
export const SUCCESS_MESSAGES = {
  LOGIN: 'Login successful',
  REGISTER: 'Registration successful',
  LOGOUT: 'Logout successful',
  PASSWORD_RESET: 'Password reset successful',
  EMAIL_VERIFIED: 'Email verified successfully',
  PROFILE_UPDATED: 'Profile updated successfully',
  PASSWORD_CHANGED: 'Password changed successfully',
  AVATAR_UPDATED: 'Avatar updated successfully',
  MESSAGE_SENT: 'Message sent successfully',
  MESSAGE_DELETED: 'Message deleted successfully',
  CONVERSATION_CREATED: 'Conversation created successfully',
  CONVERSATION_UPDATED: 'Conversation updated successfully',
  CONVERSATION_DELETED: 'Conversation deleted successfully',
  FRIEND_REQUEST_SENT: 'Friend request sent successfully',
  FRIEND_REQUEST_ACCEPTED: 'Friend request accepted successfully',
  FRIEND_REQUEST_REJECTED: 'Friend request rejected successfully',
  FRIEND_REMOVED: 'Friend removed successfully'
};

/**
 * Routes
 */
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  VERIFY_EMAIL: '/verify-email',
  PROFILE: '/profile',
  CHAT: '/chat',
  FRIENDS: '/friends',
  SETTINGS: '/settings',
  NOT_FOUND: '/404'
};

/**
 * Theme
 */
export const THEME = {
  LIGHT: 'light',
  DARK: 'dark'
};

/**
 * Language
 */
export const LANGUAGE = {
  EN: 'en',
  VI: 'vi'
};

/**
 * Date format
 */
export const DATE_FORMAT = {
  FULL: 'MMMM DD, YYYY HH:mm:ss',
  DATE: 'MMMM DD, YYYY',
  TIME: 'HH:mm:ss',
  RELATIVE: 'relative'
};

/**
 * Currency
 */
export const CURRENCY = {
  USD: 'USD',
  VND: 'VND'
};

/**
 * Time zone
 */
export const TIME_ZONE = {
  UTC: 'UTC',
  GMT: 'GMT',
  LOCAL: 'local'
};

/**
 * Notification types
 */
export const NOTIFICATION_TYPES = {
  MESSAGE: 'message',
  FRIEND_REQUEST: 'friend_request',
  SYSTEM: 'system'
};

/**
 * Notification priority
 */
export const NOTIFICATION_PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high'
};

/**
 * Settings
 */
export const SETTINGS = {
  THEME: 'theme',
  LANGUAGE: 'language',
  NOTIFICATIONS: 'notifications',
  SOUND: 'sound',
  AUTO_PLAY: 'auto_play',
  READ_RECEIPTS: 'read_receipts',
  TYPING_INDICATOR: 'typing_indicator',
  ONLINE_STATUS: 'online_status',
  BLOCKED_USERS: 'blocked_users'
}; 