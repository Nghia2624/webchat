import React from 'react';
import { formatTime } from '../../utils/dateUtils';
import Avatar from '../common/Avatar';
import { CheckIcon, CheckAllIcon, ClockIcon, ReplyIcon } from './ChatIcons';

const MessageStatus = ({ status }) => {
  switch(status) {
    case 'sent':
      return <CheckIcon className="h-3 w-3 text-gray-400" />;
    case 'delivered':
      return <CheckAllIcon className="h-3 w-3 text-gray-400" />;
    case 'read':
      return <CheckAllIcon className="h-3 w-3 text-primary" />;
    case 'pending':
      return <ClockIcon className="h-3 w-3 text-gray-400 animate-pulse" />;
    case 'failed':
      return <span className="text-red-500 text-xs">Gửi lỗi</span>;
    default:
      return null;
  }
};

const MessageItem = ({ message, isOwn, onReply, showSender = true }) => {
  if (!message) return null;
  
  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4 group`}>
      {!isOwn && showSender && (
        <Avatar 
          user={message.sender} 
          className="h-8 w-8 mr-2 mt-1" 
        />
      )}
      
      <div className={`relative max-w-[75%] px-4 py-2 rounded-message shadow-sm
        ${isOwn 
          ? 'bg-primary text-white rounded-tr-none' 
          : 'bg-gray-100 dark:bg-gray-700 dark:text-white rounded-tl-none'
        } transition-all duration-200 hover:shadow-md`}
      >
        {/* Reply Reference */}
        {message.replyTo && (
          <div className="border-l-4 border-gray-300 dark:border-gray-500 pl-2 mb-2 text-xs text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 rounded p-1">
            <div className="font-medium">{message.replyTo.sender.name}</div>
            <div className="truncate">{message.replyTo.content}</div>
          </div>
        )}
        
        {/* Sender Name */}
        {!isOwn && showSender && (
          <div className="text-xs font-medium mb-1 text-gray-700 dark:text-gray-300">
            {message.sender?.name || 'Unknown User'}
          </div>
        )}
        
        {/* Message Content */}
        <div className="message-content break-words">
          {message.content}
        </div>
        
        {/* Attachment Preview */}
        {message.attachment && (
          <div className="mt-2">
            {message.attachment.type?.startsWith('image/') ? (
              <img 
                src={message.attachment.url} 
                alt="Attachment" 
                className="max-w-full rounded-md max-h-60 object-contain cursor-pointer hover:opacity-90"
                onClick={() => window.open(message.attachment.url, '_blank')}
              />
            ) : (
              <div className="flex items-center space-x-2 bg-gray-200 dark:bg-gray-600 p-2 rounded-md">
                <div className="text-3xl">📎</div>
                <div className="overflow-hidden">
                  <div className="truncate text-sm">{message.attachment.name || 'File'}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {(message.attachment.size / 1024).toFixed(2)} KB
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Message Metadata */}
        <div className="flex justify-end items-center space-x-1 text-xs opacity-70 mt-1">
          <span>{formatTime(message.createdAt)}</span>
          {isOwn && <MessageStatus status={message.status || 'sent'} />}
        </div>
        
        {/* Message Actions */}
        <div className="absolute right-0 top-0 -mt-8 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <div className="flex space-x-1 bg-white dark:bg-gray-800 rounded-full shadow-md px-2 py-1">
            <button 
              className="hover:text-primary transition-colors" 
              title="Trả lời" 
              onClick={() => onReply && onReply(message)}
            >
              <ReplyIcon className="w-4 h-4" />
            </button>
            {isOwn && (
              <button className="hover:text-red-500 transition-colors" title="Xóa">
                🗑️
              </button>
            )}
            <button className="hover:text-primary transition-colors" title="Thêm tùy chọn">
              ⋯
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageItem; 