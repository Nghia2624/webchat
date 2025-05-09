import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getConversations, setActiveConversation } from '../../store/slices/chatSlice';
import ConversationItem from './ConversationItem';
import { SearchIcon } from './ChatIcons';

const ConversationList = () => {
  const dispatch = useDispatch();
  const { 
    conversations, 
    activeConversationId, 
    loading, 
    error 
  } = useSelector((state) => state.chat);
  
  const [searchTerm, setSearchTerm] = useState('');
  
  useEffect(() => {
    // Fetch conversations when component mounts
    dispatch(getConversations());
  }, [dispatch]);
  
  const handleConversationSelect = (conversationId) => {
    dispatch(setActiveConversation(conversationId));
  };
  
  const filteredConversations = conversations.filter(conversation => {
    // Tìm kiếm theo tên cuộc hội thoại hoặc tên thành viên
    const searchLower = searchTerm.toLowerCase();
    if (!searchTerm) return true;
    
    // Tìm trong tên nhóm (nếu là nhóm)
    if (conversation.isGroup && conversation.name?.toLowerCase().includes(searchLower)) {
      return true;
    }
    
    // Tìm trong tên thành viên
    return conversation.participants?.some(participant => 
      participant.name?.toLowerCase().includes(searchLower)
    );
  });
  
  // Sắp xếp theo tin nhắn mới nhất
  const sortedConversations = [...filteredConversations].sort((a, b) => {
    const timeA = a.lastMessage?.createdAt ? new Date(a.lastMessage.createdAt) : new Date(0);
    const timeB = b.lastMessage?.createdAt ? new Date(b.lastMessage.createdAt) : new Date(0);
    return timeB - timeA;
  });
  
  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-800 border-r dark:border-gray-700">
      {/* Header */}
      <div className="p-4 border-b dark:border-gray-700">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-3">Tin nhắn</h2>
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm kiếm..."
            className="w-full py-2 pl-10 pr-4 rounded-full border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <SearchIcon className="absolute left-3 top-2.5 w-5 h-5 text-gray-500 dark:text-gray-400" />
        </div>
      </div>
      
      {/* List */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {loading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <div className="p-4 text-center text-red-500">
            Không thể tải danh sách hội thoại.
            <button 
              className="block mx-auto mt-2 text-sm text-primary hover:underline"
              onClick={() => dispatch(getConversations())}
            >
              Thử lại
            </button>
          </div>
        ) : sortedConversations.length === 0 ? (
          <div className="p-4 text-center text-gray-500 dark:text-gray-400">
            {searchTerm 
              ? "Không tìm thấy kết quả nào." 
              : "Chưa có cuộc hội thoại nào."}
          </div>
        ) : (
          <div className="divide-y dark:divide-gray-700">
            {sortedConversations.map((conversation) => (
              <ConversationItem
                key={conversation.id}
                conversation={conversation}
                isActive={conversation.id === activeConversationId}
                onClick={() => handleConversationSelect(conversation.id)}
              />
            ))}
          </div>
        )}
      </div>
      
      {/* Create New Button */}
      <div className="p-4 border-t dark:border-gray-700">
        <button className="w-full py-2 bg-primary hover:bg-primary-dark text-white rounded-lg transition-colors flex items-center justify-center">
          <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Cuộc hội thoại mới
        </button>
      </div>
    </div>
  );
};

export default ConversationList;