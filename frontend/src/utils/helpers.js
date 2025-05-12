/**
 * Utility helper functions
 */

/**
 * Check if value is empty
 * @param {any} value - Value to check
 * @returns {boolean} Is empty
 */
export const isEmpty = (value) => {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim().length === 0;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
};

/**
 * Check if value is not empty
 * @param {any} value - Value to check
 * @returns {boolean} Is not empty
 */
export const isNotEmpty = (value) => !isEmpty(value);

/**
 * Check if value is null or undefined
 * @param {any} value - Value to check
 * @returns {boolean} Is null or undefined
 */
export const isNullOrUndefined = (value) => {
  return value === null || value === undefined;
};

/**
 * Check if value is a function
 * @param {any} value - Value to check
 * @returns {boolean} Is function
 */
export const isFunction = (value) => {
  return typeof value === 'function';
};

/**
 * Check if value is a string
 * @param {any} value - Value to check
 * @returns {boolean} Is string
 */
export const isString = (value) => {
  return typeof value === 'string';
};

/**
 * Check if value is a number
 * @param {any} value - Value to check
 * @returns {boolean} Is number
 */
export const isNumber = (value) => {
  return typeof value === 'number' && !isNaN(value);
};

/**
 * Check if value is an object
 * @param {any} value - Value to check
 * @returns {boolean} Is object
 */
export const isObject = (value) => {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
};

/**
 * Check if value is an array
 * @param {any} value - Value to check
 * @returns {boolean} Is array
 */
export const isArray = (value) => {
  return Array.isArray(value);
};

/**
 * Check if value is a date
 * @param {any} value - Value to check
 * @returns {boolean} Is date
 */
export const isDate = (value) => {
  return value instanceof Date && !isNaN(value);
};

/**
 * Check if value is a boolean
 * @param {any} value - Value to check
 * @returns {boolean} Is boolean
 */
export const isBoolean = (value) => {
  return typeof value === 'boolean';
};

/**
 * Check if value is a promise
 * @param {any} value - Value to check
 * @returns {boolean} Is promise
 */
export const isPromise = (value) => {
  return value && typeof value.then === 'function';
};

/**
 * Check if value is a valid email
 * @param {string} email - Email to check
 * @returns {boolean} Is valid email
 */
export const isValidEmail = (email) => {
  const pattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return pattern.test(email);
};

/**
 * Check if value is a valid URL
 * @param {string} url - URL to check
 * @returns {boolean} Is valid URL
 */
export const isValidUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Check if value is a valid phone number
 * @param {string} phone - Phone number to check
 * @returns {boolean} Is valid phone number
 */
export const isValidPhone = (phone) => {
  const pattern = /^\+?[1-9]\d{1,14}$/;
  return pattern.test(phone);
};

/**
 * Check if value is a valid password
 * @param {string} password - Password to check
 * @returns {boolean} Is valid password
 */
export const isValidPassword = (password) => {
  const pattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return pattern.test(password);
};

/**
 * Check if value is a valid username
 * @param {string} username - Username to check
 * @returns {boolean} Is valid username
 */
export const isValidUsername = (username) => {
  const pattern = /^[a-zA-Z0-9_]{3,30}$/;
  return pattern.test(username);
};

/**
 * Check if value is a valid file type
 * @param {File} file - File to check
 * @param {string[]} types - Allowed file types
 * @returns {boolean} Is valid file type
 */
export const isValidFileType = (file, types) => {
  return types.includes(file.type);
};

/**
 * Check if value is a valid file size
 * @param {File} file - File to check
 * @param {number} maxSize - Maximum file size in bytes
 * @returns {boolean} Is valid file size
 */
export const isValidFileSize = (file, maxSize) => {
  return file.size <= maxSize;
};

/**
 * Format file size
 * @param {number} bytes - Size in bytes
 * @returns {string} Formatted size
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Format date
 * @param {Date|string} date - Date to format
 * @param {string} format - Date format
 * @returns {string} Formatted date
 */
export const formatDate = (date, format = 'YYYY-MM-DD') => {
  const d = new Date(date);
  
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');
  
  return format
    .replace('YYYY', year)
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds);
};

/**
 * Format relative time
 * @param {Date|string} date - Date to format
 * @returns {string} Formatted relative time
 */
export const formatRelativeTime = (date) => {
  const now = new Date();
  const d = new Date(date);
  const diff = now - d;
  
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const months = Math.floor(days / 30);
  const years = Math.floor(months / 12);
  
  if (years > 0) return `${years} year${years > 1 ? 's' : ''} ago`;
  if (months > 0) return `${months} month${months > 1 ? 's' : ''} ago`;
  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  if (seconds > 0) return `${seconds} second${seconds > 1 ? 's' : ''} ago`;
  
  return 'just now';
};

/**
 * Format currency
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code
 * @returns {string} Formatted currency
 */
export const formatCurrency = (amount, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency
  }).format(amount);
};

/**
 * Format number
 * @param {number} number - Number to format
 * @returns {string} Formatted number
 */
export const formatNumber = (number) => {
  return new Intl.NumberFormat('en-US').format(number);
};

/**
 * Format percentage
 * @param {number} value - Value to format
 * @param {number} total - Total value
 * @returns {string} Formatted percentage
 */
export const formatPercentage = (value, total) => {
  const percentage = (value / total) * 100;
  return `${percentage.toFixed(2)}%`;
};

/**
 * Truncate text
 * @param {string} text - Text to truncate
 * @param {number} length - Maximum length
 * @returns {string} Truncated text
 */
export const truncateText = (text, length = 100) => {
  if (text.length <= length) return text;
  return text.slice(0, length) + '...';
};

/**
 * Generate random string
 * @param {number} length - String length
 * @returns {string} Random string
 */
export const generateRandomString = (length = 10) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return result;
};

/**
 * Generate random number
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} Random number
 */
export const generateRandomNumber = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

/**
 * Generate random color
 * @returns {string} Random color
 */
export const generateRandomColor = () => {
  return '#' + Math.floor(Math.random() * 16777215).toString(16);
};

/**
 * Generate random date
 * @param {Date} start - Start date
 * @param {Date} end - End date
 * @returns {Date} Random date
 */
export const generateRandomDate = (start, end) => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

/**
 * Generate random boolean
 * @returns {boolean} Random boolean
 */
export const generateRandomBoolean = () => {
  return Math.random() >= 0.5;
};

/**
 * Generate random array
 * @param {number} length - Array length
 * @param {Function} generator - Item generator function
 * @returns {Array} Random array
 */
export const generateRandomArray = (length, generator) => {
  return Array.from({ length }, generator);
};

/**
 * Generate random object
 * @param {Object} schema - Object schema
 * @returns {Object} Random object
 */
export const generateRandomObject = (schema) => {
  const result = {};
  
  for (const [key, value] of Object.entries(schema)) {
    if (typeof value === 'function') {
      result[key] = value();
    } else {
      result[key] = value;
    }
  }
  
  return result;
};

/**
 * Generate random user
 * @returns {Object} Random user
 */
export const generateRandomUser = () => {
  return {
    id: generateRandomString(),
    username: generateRandomString(8),
    email: `${generateRandomString(8)}@example.com`,
    firstName: generateRandomString(6),
    lastName: generateRandomString(6),
    avatar: `https://i.pravatar.cc/150?u=${generateRandomString()}`,
    status: generateRandomBoolean() ? 'online' : 'offline',
    lastSeen: generateRandomDate(new Date(2020, 0, 1), new Date())
  };
};

/**
 * Generate random message
 * @returns {Object} Random message
 */
export const generateRandomMessage = () => {
  return {
    id: generateRandomString(),
    content: generateRandomString(50),
    type: 'text',
    sender: generateRandomUser(),
    timestamp: generateRandomDate(new Date(2020, 0, 1), new Date()),
    status: 'sent'
  };
};

/**
 * Generate random conversation
 * @returns {Object} Random conversation
 */
export const generateRandomConversation = () => {
  return {
    id: generateRandomString(),
    type: generateRandomBoolean() ? 'personal' : 'group',
    name: generateRandomString(10),
    avatar: `https://i.pravatar.cc/150?u=${generateRandomString()}`,
    participants: generateRandomArray(3, generateRandomUser),
    lastMessage: generateRandomMessage(),
    unreadCount: generateRandomNumber(0, 10),
    updatedAt: generateRandomDate(new Date(2020, 0, 1), new Date())
  };
};

/**
 * Generate random friend request
 * @returns {Object} Random friend request
 */
export const generateRandomFriendRequest = () => {
  return {
    id: generateRandomString(),
    sender: generateRandomUser(),
    receiver: generateRandomUser(),
    status: 'pending',
    createdAt: generateRandomDate(new Date(2020, 0, 1), new Date())
  };
};

/**
 * Generate random notification
 * @returns {Object} Random notification
 */
export const generateRandomNotification = () => {
  return {
    id: generateRandomString(),
    type: generateRandomBoolean() ? 'message' : 'friend_request',
    content: generateRandomString(50),
    sender: generateRandomUser(),
    read: generateRandomBoolean(),
    createdAt: generateRandomDate(new Date(2020, 0, 1), new Date())
  };
};

/**
 * Generate random settings
 * @returns {Object} Random settings
 */
export const generateRandomSettings = () => {
  return {
    theme: generateRandomBoolean() ? 'light' : 'dark',
    language: generateRandomBoolean() ? 'en' : 'vi',
    notifications: generateRandomBoolean(),
    sound: generateRandomBoolean(),
    autoPlay: generateRandomBoolean(),
    readReceipts: generateRandomBoolean(),
    typingIndicator: generateRandomBoolean(),
    onlineStatus: generateRandomBoolean()
  };
};

/**
 * Generate random data
 * @param {string} type - Data type
 * @returns {any} Random data
 */
export const generateRandomData = (type) => {
  switch (type) {
    case 'user':
      return generateRandomUser();
    case 'message':
      return generateRandomMessage();
    case 'conversation':
      return generateRandomConversation();
    case 'friendRequest':
      return generateRandomFriendRequest();
    case 'notification':
      return generateRandomNotification();
    case 'settings':
      return generateRandomSettings();
    default:
      return null;
  }
};

/**
 * Generate random data array
 * @param {string} type - Data type
 * @param {number} length - Array length
 * @returns {Array} Random data array
 */
export const generateRandomDataArray = (type, length) => {
  return generateRandomArray(length, () => generateRandomData(type));
};

/**
 * Generate random data object
 * @param {Object} schema - Object schema
 * @returns {Object} Random data object
 */
export const generateRandomDataObject = (schema) => {
  const result = {};
  
  for (const [key, value] of Object.entries(schema)) {
    if (typeof value === 'string') {
      result[key] = generateRandomData(value);
    } else if (Array.isArray(value)) {
      result[key] = generateRandomDataArray(value[0], value[1]);
    } else if (typeof value === 'object') {
      result[key] = generateRandomDataObject(value);
    } else {
      result[key] = value;
    }
  }
  
  return result;
}; 