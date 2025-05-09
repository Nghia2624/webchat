/**
 * Utility functions for date and time formatting
 */

/**
 * Định dạng thời gian hiển thị cho tin nhắn
 * @param {Date|string|number} date - Đối tượng Date, chuỗi ISO hoặc timestamp
 * @returns {string} - Thời gian được định dạng
 */
export const formatTime = (date) => {
  if (!date) return '';
  
  const messageDate = new Date(date);
  if (isNaN(messageDate.getTime())) return '';
  
  const now = new Date();
  const isToday = now.toDateString() === messageDate.toDateString();
  const isYesterday = new Date(now - 86400000).toDateString() === messageDate.toDateString();
  const isThisYear = now.getFullYear() === messageDate.getFullYear();
  
  const hours = messageDate.getHours().toString().padStart(2, '0');
  const minutes = messageDate.getMinutes().toString().padStart(2, '0');
  const timeStr = `${hours}:${minutes}`;

  if (isToday) {
    return timeStr;
  } else if (isYesterday) {
    return `Hôm qua, ${timeStr}`;
  } else if (isThisYear) {
    return `${messageDate.getDate()}/${messageDate.getMonth() + 1}, ${timeStr}`;
  } else {
    return `${messageDate.getDate()}/${messageDate.getMonth() + 1}/${messageDate.getFullYear()}, ${timeStr}`;
  }
};

/**
 * Format a date string to display date in a readable format
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date string
 */
export const formatDate = (dateString) => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  // Check if date is today
  if (date.toDateString() === today.toDateString()) {
    return 'Hôm nay';
  }
  
  // Check if date is yesterday
  if (date.toDateString() === yesterday.toDateString()) {
    return 'Hôm qua';
  }
  
  // For dates in the current year, show only day and month
  if (date.getFullYear() === today.getFullYear()) {
    return date.toLocaleDateString([], { day: '2-digit', month: '2-digit' });
  }
  
  // For older dates, include the year
  return date.toLocaleDateString([], { day: '2-digit', month: '2-digit', year: 'numeric' });
};

/**
 * Tính toán "thời gian trước đây" (ví dụ: "5 phút trước")
 * @param {Date|string|number} date - Đối tượng Date, chuỗi ISO hoặc timestamp
 * @returns {string} - Chuỗi thời gian tương đối
 */
export const timeAgo = (date) => {
  if (!date) return '';
  
  const messageDate = new Date(date);
  if (isNaN(messageDate.getTime())) return '';
  
  const now = new Date();
  const secondsAgo = Math.floor((now - messageDate) / 1000);
  
  if (secondsAgo < 60) {
    return 'Vừa xong';
  } else if (secondsAgo < 3600) {
    const minutes = Math.floor(secondsAgo / 60);
    return `${minutes} phút trước`;
  } else if (secondsAgo < 86400) {
    const hours = Math.floor(secondsAgo / 3600);
    return `${hours} giờ trước`;
  } else if (secondsAgo < 604800) {
    const days = Math.floor(secondsAgo / 86400);
    return `${days} ngày trước`;
  } else {
    return formatTime(date);
  }
};

/**
 * Format ngày tháng đầy đủ
 * @param {Date|string|number} date - Đối tượng Date, chuỗi ISO hoặc timestamp
 * @returns {string} - Ngày tháng đầy đủ
 */
export const formatFullDate = (date) => {
  if (!date) return '';
  
  const messageDate = new Date(date);
  if (isNaN(messageDate.getTime())) return '';
  
  const options = { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };
  
  return messageDate.toLocaleDateString('vi-VN', options);
};

/**
 * Calculate time elapsed since a date in a human-readable format
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted time elapsed
 */
export const getTimeElapsed = (dateString) => {
  if (!dateString) return '';
  
  const startDate = new Date(dateString);
  const endDate = new Date();
  
  // Calculate the time difference in milliseconds
  const timeDiff = endDate - startDate;
  
  // Calculate days, hours, minutes, and seconds
  const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);
  
  if (days > 0) {
    return `${days}d ${hours}h`;
  } else if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  } else {
    return `${seconds}s`;
  }
};

/**
 * Check if a date is today
 * @param {string} dateString - ISO date string
 * @returns {boolean} True if the date is today
 */
export const isToday = (dateString) => {
  if (!dateString) return false;
  
  const date = new Date(dateString);
  const today = new Date();
  
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
};

/**
 * Format a date to a simple date string (e.g., "2023-08-15")
 * @param {Date} date - Date object
 * @returns {string} Formatted date string
 */
export const toSimpleDateString = (date) => {
  if (!date) return '';
  
  return date.toISOString().split('T')[0];
}; 