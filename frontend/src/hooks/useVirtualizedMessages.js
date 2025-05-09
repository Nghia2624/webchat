import { useMemo, useRef, useCallback } from 'react';

// Hook để tối ưu hiệu suất tin nhắn trong một conversation
const useVirtualizedMessages = (
  messages = [],
  options = {
    itemHeight: 72, // Chiều cao trung bình của mỗi tin nhắn (px)
    overscan: 5, // Số lượng messages hiển thị thêm ở trên và dưới viewport
    groupThreshold: 60000 // Thời gian cách nhau giữa các tin nhắn để nhóm (ms) = 1 phút
  }
) => {
  const containerRef = useRef(null);
  const { itemHeight, overscan, groupThreshold } = options;
  
  // Phân nhóm tin nhắn theo thời gian
  const groupedMessages = useMemo(() => {
    if (!messages.length) return [];
    
    // Clone mảng để không ảnh hưởng dữ liệu gốc
    const sortedMessages = [...messages].sort((a, b) => 
      new Date(a.createdAt) - new Date(b.createdAt)
    );
    
    const groups = [];
    let currentGroup = [sortedMessages[0]];
    
    for (let i = 1; i < sortedMessages.length; i++) {
      const currentMessage = sortedMessages[i];
      const prevMessage = sortedMessages[i - 1];
      
      const timeDiff = new Date(currentMessage.createdAt) - new Date(prevMessage.createdAt);
      const sameAuthor = currentMessage.senderId === prevMessage.senderId;
      
      // Nhóm tin nhắn nếu cùng người gửi và thời gian gần nhau
      if (sameAuthor && timeDiff < groupThreshold) {
        currentGroup.push(currentMessage);
      } else {
        // Tạo nhóm mới
        groups.push([...currentGroup]);
        currentGroup = [currentMessage];
      }
    }
    
    // Thêm nhóm cuối cùng
    if (currentGroup.length) {
      groups.push(currentGroup);
    }
    
    return groups;
  }, [messages, groupThreshold]);
  
  // Tính tổng kích thước của danh sách tin nhắn
  const totalHeight = useMemo(() => {
    return groupedMessages.length * itemHeight;
  }, [groupedMessages, itemHeight]);
  
  // Tính toán các tin nhắn cần hiển thị dựa trên scroll position
  const getVisibleMessages = useCallback(() => {
    if (!containerRef.current) return { items: groupedMessages, startIndex: 0, endIndex: groupedMessages.length - 1 };
    
    const { scrollTop, clientHeight } = containerRef.current;
    
    // Tính toán các index cần hiển thị
    let startIndex = Math.floor(scrollTop / itemHeight) - overscan;
    startIndex = Math.max(0, startIndex);
    
    let endIndex = Math.ceil((scrollTop + clientHeight) / itemHeight) + overscan;
    endIndex = Math.min(groupedMessages.length - 1, endIndex);
    
    // Lấy các tin nhắn cần hiển thị
    const items = groupedMessages.slice(startIndex, endIndex + 1).map((group, index) => ({
      group,
      index: startIndex + index,
      offsetTop: (startIndex + index) * itemHeight
    }));
    
    return { items, startIndex, endIndex, scrollTop };
  }, [groupedMessages, itemHeight, overscan]);
  
  // Hàm scroll đến tin nhắn theo index
  const scrollToIndex = useCallback((index, behavior = 'auto') => {
    if (!containerRef.current) return;
    
    const top = index * itemHeight;
    containerRef.current.scrollTo({
      top,
      behavior
    });
  }, [itemHeight]);
  
  // Hàm scroll đến tin nhắn mới nhất
  const scrollToBottom = useCallback((behavior = 'auto') => {
    if (!containerRef.current) return;
    
    containerRef.current.scrollTo({
      top: containerRef.current.scrollHeight,
      behavior
    });
  }, []);
  
  // Kiểm tra xem người dùng có đang ở dưới cùng không
  const isAtBottom = useCallback(() => {
    if (!containerRef.current) return false;
    
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    // Coi như đang ở dưới cùng nếu nằm trong khoảng 20px
    return scrollHeight - scrollTop - clientHeight < 20;
  }, []);
  
  return {
    containerRef,
    totalHeight,
    getVisibleMessages,
    scrollToIndex,
    scrollToBottom,
    isAtBottom,
    groupedMessages
  };
};

export default useVirtualizedMessages; 