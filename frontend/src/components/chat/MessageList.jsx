import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getMessages, sendMessage } from '../../store/slices/chatSlice';
import MessageItem from './MessageItem';
import MessageInput from './MessageInput';
import { formatFullDate } from '../../utils/dateUtils';

const MessageList = ({ conversation }) => {
  const dispatch = useDispatch();
  const { currentUser } = useSelector((state) => state.auth);
  const { messages, loadingMessages } = useSelector((state) => state.chat);
  
  const [replyingTo, setReplyingTo] = useState(null);
  const messagesEndRef = useRef(null);
  
  // Fetch messages when conversation changes
  useEffect(() => {
    if (conversation?.id) {
      dispatch(getMessages(conversation.id));
    }
  }, [conversation?.id, dispatch]);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);
  
  // Group messages by date for display
  const groupMessagesByDate = () => {
    const groups = {};
    
    messages.forEach(message => {
      const date = new Date(message.createdAt).toDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
    });
    
    return Object.entries(groups).map(([date, msgs]) => ({
      date: new Date(date),
      messages: msgs
    }));
  };
  
  const handleSendMessage = (data) => {
    if (!conversation) return;
    
    dispatch(sendMessage({
      conversationId: conversation.id,
      content: data.content,
      attachment: data.attachment,
      replyToId: data.replyTo
    }));
  };
  
  const handleReply = (message) => {
    setReplyingTo(message);
  };
  
  if (!conversation) return null;
  
  const groupedMessages = groupMessagesByDate();
  
  return (
    <div className="flex flex-col h-full">
      {/* Chat header */}
      <div className="p-4 border-b dark:border-gray-700 flex items-center">
        <div className="flex-1">
          <h2 className="text-lg font-medium text-gray-800 dark:text-white">
            {conversation.name || conversation.participants?.[0]?.name || 'Cuộc hội thoại'}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {conversation.isGroup 
              ? `${conversation.participants?.length || 0} thành viên` 
              : conversation.participants?.[0]?.isOnline 
                ? 'Đang hoạt động'
                : 'Không hoạt động'
            }
          </p>
        </div>
        
        {/* Chat actions */}
        <div className="flex items-center space-x-2">
          <button className="p-2 text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
          <button className="p-2 text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
            </svg>
          </button>
        </div>
      </div>
      
      {/* Messages list */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loadingMessages ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <p className="text-gray-500 dark:text-gray-400">
              Chưa có tin nhắn nào. Hãy bắt đầu cuộc trò chuyện!
            </p>
          </div>
        ) : (
          <>
            {groupedMessages.map((group) => (
              <div key={group.date.toISOString()} className="space-y-4">
                <div className="flex items-center justify-center">
                  <div className="border-t dark:border-gray-700 flex-1"></div>
                  <span className="px-3 text-xs text-gray-500 dark:text-gray-400">
                    {formatFullDate(group.date)}
                  </span>
                  <div className="border-t dark:border-gray-700 flex-1"></div>
                </div>
                
                {group.messages.map((message) => (
                  <MessageItem
                    key={message.id}
                    message={message}
                    isOwn={message.sender?.id === currentUser?.id}
                    onReply={handleReply}
                    showSender={conversation.isGroup}
                  />
                ))}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>
      
      {/* Message input */}
      <MessageInput
        conversationId={conversation.id}
        onSendMessage={handleSendMessage}
        replyingTo={replyingTo}
        onCancelReply={() => setReplyingTo(null)}
      />
    </div>
  );
};

export default MessageList;