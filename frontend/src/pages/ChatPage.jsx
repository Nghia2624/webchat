import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import ConversationList from '../components/chat/ConversationList';
import MessageList from '../components/chat/MessageList';
import { fetchConversations, setActiveConversation } from '../store/slices/chatSlice';

const ChatPage = () => {
  const dispatch = useDispatch();
  const { conversationId } = useParams();
  const { activeConversationId, conversations, loading } = useSelector((state) => state.chat);
  
  // Fetch conversations when page loads
  useEffect(() => {
    dispatch(fetchConversations());
  }, [dispatch]);
  
  // Set active conversation from URL parameter
  useEffect(() => {
    if (conversationId && conversationId !== activeConversationId) {
      dispatch(setActiveConversation(conversationId));
    }
  }, [conversationId, activeConversationId, dispatch]);
  
  // Find the active conversation
  const activeConversation = conversations.find(
    (conversation) => conversation.id === activeConversationId
  );
  
  return (
    <div className="h-full flex">
      {/* Conversation list */}
      <div className="w-80 border-r dark:border-gray-700 h-full hidden md:block">
        <ConversationList />
      </div>
      
      {/* Chat area */}
      <div className="flex-1 flex flex-col h-full">
        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : !activeConversation ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
              <svg className="w-12 h-12 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <h3 className="text-xl font-medium text-gray-700 dark:text-gray-300 mb-2">
              Chưa có cuộc hội thoại nào được chọn
            </h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-md">
              Chọn một cuộc hội thoại từ danh sách bên trái hoặc tạo một cuộc hội thoại mới.
            </p>
            <button className="mt-6 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-md transition-colors">
              Tạo cuộc hội thoại mới
            </button>
          </div>
        ) : (
          <MessageList conversation={activeConversation} />
        )}
      </div>
    </div>
  );
};

export default ChatPage; 