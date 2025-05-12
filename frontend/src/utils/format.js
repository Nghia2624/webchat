/**
 * Utility functions for formatting data
 */

/**
 * Format date to relative time
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted date
 */
export const formatRelativeTime = (date) => {
  const now = new Date();
  const messageDate = new Date(date);
  const diffInSeconds = Math.floor((now - messageDate) / 1000);
  
  if (diffInSeconds < 60) {
    return 'just now';
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`;
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  }
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays}d ago`;
  }
  
  return messageDate.toLocaleDateString();
};

/**
 * Format date to readable format
 * @param {string|Date} date - Date to format
 * @param {Object} options - Format options
 * @returns {string} Formatted date
 */
export const formatDate = (date, options = {}) => {
  const {
    includeTime = true,
    short = false
  } = options;
  
  const messageDate = new Date(date);
  const now = new Date();
  const isToday = messageDate.toDateString() === now.toDateString();
  const isThisYear = messageDate.getFullYear() === now.getFullYear();
  
  let formatOptions = {
    month: short ? 'short' : 'long',
    day: 'numeric'
  };
  
  if (!isThisYear) {
    formatOptions.year = 'numeric';
  }
  
  if (includeTime) {
    formatOptions.hour = '2-digit';
    formatOptions.minute = '2-digit';
  }
  
  const formattedDate = messageDate.toLocaleDateString(undefined, formatOptions);
  
  if (isToday && includeTime) {
    return `Today at ${messageDate.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}`;
  }
  
  return formattedDate;
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
 * Format message content
 * @param {string} content - Message content
 * @returns {string} Formatted content
 */
export const formatMessageContent = (content) => {
  if (!content) return '';
  
  // Convert URLs to links
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const withLinks = content.replace(urlRegex, url => `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`);
  
  // Convert newlines to <br>
  const withBreaks = withLinks.replace(/\n/g, '<br>');
  
  return withBreaks;
};

/**
 * Format username
 * @param {string} username - Username to format
 * @returns {string} Formatted username
 */
export const formatUsername = (username) => {
  if (!username) return '';
  return '@' + username.toLowerCase();
};

/**
 * Format group name
 * @param {string} name - Group name to format
 * @param {number} memberCount - Number of members
 * @returns {string} Formatted group name
 */
export const formatGroupName = (name, memberCount) => {
  if (!name) return '';
  return `${name} (${memberCount} members)`;
};

/**
 * Format message status
 * @param {string} status - Message status
 * @returns {string} Formatted status
 */
export const formatMessageStatus = (status) => {
  switch (status) {
    case 'sent':
      return 'Sent';
    case 'delivered':
      return 'Delivered';
    case 'read':
      return 'Read';
    default:
      return 'Sending...';
  }
};

/**
 * Format typing status
 * @param {Array<string>} users - Array of typing users
 * @returns {string} Formatted typing status
 */
export const formatTypingStatus = (users) => {
  if (!users || users.length === 0) return '';
  
  if (users.length === 1) {
    return `${users[0]} is typing...`;
  }
  
  if (users.length === 2) {
    return `${users[0]} and ${users[1]} are typing...`;
  }
  
  return 'Several people are typing...';
};

/**
 * Format search results
 * @param {Array<Object>} results - Search results
 * @param {string} type - Result type
 * @returns {string} Formatted results
 */
export const formatSearchResults = (results, type) => {
  if (!results || results.length === 0) {
    return `No ${type} found`;
  }
  
  if (results.length === 1) {
    return `1 ${type} found`;
  }
  
  return `${results.length} ${type}s found`;
};

/**
 * Format error message
 * @param {Error|string} error - Error to format
 * @returns {string} Formatted error message
 */
export const formatErrorMessage = (error) => {
  if (!error) return 'An unknown error occurred';
  
  if (typeof error === 'string') {
    return error;
  }
  
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  
  if (error.message) {
    return error.message;
  }
  
  return 'An unknown error occurred';
};

/**
 * Format notification count
 * @param {number} count - Notification count
 * @returns {string} Formatted count
 */
export const formatNotificationCount = (count) => {
  if (!count) return '';
  
  if (count > 99) {
    return '99+';
  }
  
  return count.toString();
};

/**
 * Format phone number
 * @param {string} phone - Phone number to format
 * @returns {string} Formatted phone number
 */
export const formatPhoneNumber = (phone) => {
  if (!phone) return '';
  
  const cleaned = phone.replace(/\D/g, '');
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
  
  if (match) {
    return '(' + match[1] + ') ' + match[2] + '-' + match[3];
  }
  
  return phone;
};

/**
 * Format currency
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code
 * @returns {string} Formatted amount
 */
export const formatCurrency = (amount, currency = 'USD') => {
  if (typeof amount !== 'number') return '';
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(amount);
};

/**
 * Format number with commas
 * @param {number} number - Number to format
 * @returns {string} Formatted number
 */
export const formatNumber = (number) => {
  if (typeof number !== 'number') return '';
  
  return new Intl.NumberFormat('en-US').format(number);
};

/**
 * Format percentage
 * @param {number} value - Value to format
 * @param {number} total - Total value
 * @returns {string} Formatted percentage
 */
export const formatPercentage = (value, total) => {
  if (typeof value !== 'number' || typeof total !== 'number' || total === 0) {
    return '0%';
  }
  
  const percentage = (value / total) * 100;
  return `${percentage.toFixed(1)}%`;
}; 