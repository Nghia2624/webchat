/**
 * Sắp xếp tin nhắn theo thời gian tạo
 */
export const sortMessagesByDate = (messages) => {
  return [...messages].sort((a, b) => {
    return new Date(a.createdAt) - new Date(b.createdAt);
  });
};

/**
 * Gộp tin nhắn và loại bỏ trùng lặp
 */
export const mergeMessages = (existingMessages, newMessages, prepend = false) => {
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
  
  // Chuyển Map thành mảng và sắp xếp
  const mergedMessages = Array.from(messagesMap.values());
  return sortMessagesByDate(mergedMessages);
};

/**
 * Kiểm tra xem tin nhắn có phải là tin nhắn tạm thời không
 */
export const isTempMessage = (message) => {
  return message.id.startsWith('temp-');
};

/**
 * Kiểm tra xem tin nhắn có phải là tin nhắn của người dùng hiện tại không
 */
export const isOwnMessage = (message, currentUserId) => {
  return message.senderId === currentUserId;
};

/**
 * Kiểm tra xem tin nhắn có phải là tin nhắn hệ thống không
 */
export const isSystemMessage = (message) => {
  return message.type === 'system';
};

/**
 * Kiểm tra xem tin nhắn có phải là tin nhắn đã đọc không
 */
export const isMessageRead = (message, readBy) => {
  return readBy && readBy.length > 0;
};

/**
 * Lấy thời gian hiển thị của tin nhắn
 */
export const getMessageTime = (message) => {
  const date = new Date(message.createdAt);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

/**
 * Lấy ngày hiển thị của tin nhắn
 */
export const getMessageDate = (message) => {
  const date = new Date(message.createdAt);
  return date.toLocaleDateString([], { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
};

/**
 * Kiểm tra xem tin nhắn có phải là tin nhắn đầu tiên trong ngày không
 */
export const isFirstMessageOfDay = (message, previousMessage) => {
  if (!previousMessage) return true;
  
  const messageDate = new Date(message.createdAt);
  const previousDate = new Date(previousMessage.createdAt);
  
  return messageDate.getDate() !== previousDate.getDate() ||
         messageDate.getMonth() !== previousDate.getMonth() ||
         messageDate.getFullYear() !== previousDate.getFullYear();
}; 