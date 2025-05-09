import React from 'react';
import { timeAgo } from '../../utils/dateUtils';
import Avatar from '../common/Avatar';

const ConversationItem = ({ conversation, isActive, onClick }) => {
  if (!conversation) return null;
  
  // Xác định tên hiển thị
  const displayName = conversation.isGroup 
    ? conversation.name 
    : conversation.participants?.[0]?.name || 'Người dùng';
  
  // Xác định người gửi tin nhắn cuối cùng
  const lastMessageSender = conversation.lastMessage?.sender?.name 
    ? (conversation.lastMessage.sender.id === conversation.currentUser?.id 
        ? 'Bạn' 
        : conversation.lastMessage.sender.name)
    : '';
  
  // Hiển thị nội dung tin nhắn cuối
  const lastMessageContent = () => {
    if (!conversation.lastMessage) return 'Chưa có tin nhắn';
    
    if (conversation.lastMessage.attachment) {
      const isImage = conversation.lastMessage.attachment.type?.startsWith('image/');
      return isImage ? '🖼️ Hình ảnh' : '📎 Tệp đính kèm';
    }
    
    return conversation.lastMessage.content || '';
  };
  
  // Hiển thị nội dung bị cắt ngắn
  const truncate = (text, maxLength = 30) => {
    if (!text) return '';
    return text.length > maxLength
      ? text.substring(0, maxLength) + '...'
      : text;
  };
  
  // Trạng thái người dùng (online/offline)
  const isOnline = conversation.participants?.[0]?.isOnline || false;
  
  // Số tin nhắn chưa đọc
  const unreadCount = conversation.unreadCount || 0;
  
  return (
    <div
      className={`p-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors duration-200 
      ${isActive ? 'bg-gray-100 dark:bg-gray-700 border-l-4 border-primary' : 'border-l-4 border-transparent'}`}
      onClick={onClick}
    >
      <div className="flex items-start space-x-3">
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          <Avatar 
            user={conversation.isGroup ? { name: conversation.name } : conversation.participants?.[0]}
            className="w-12 h-12"
            isGroup={conversation.isGroup}
          />
          
          {!conversation.isGroup && (
            <span 
              className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-gray-800 
              ${isOnline ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-500'}`}
            />
          )}
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-baseline">
            <h3 className={`font-medium truncate 
              ${isActive ? 'text-primary' : 'text-gray-800 dark:text-white'}`}>
              {displayName}
            </h3>
            <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap ml-2">
              {conversation.lastMessage?.createdAt ? timeAgo(conversation.lastMessage.createdAt) : ''}
            </span>
          </div>
          
          <div className="flex justify-between items-center mt-1">
            <p className={`text-sm truncate 
              ${unreadCount > 0 
                ? 'text-gray-800 dark:text-white font-medium' 
                : 'text-gray-500 dark:text-gray-400'}`}>
              {conversation.isGroup && lastMessageSender && `${lastMessageSender}: `}
              {truncate(lastMessageContent())}
            </p>
            
            {unreadCount > 0 && (
              <span className="ml-2 flex-shrink-0 bg-primary text-white text-xs font-medium px-2 py-0.5 rounded-full">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConversationItem; 