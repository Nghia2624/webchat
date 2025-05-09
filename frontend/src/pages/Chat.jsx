import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getConversations, setActiveConversation } from '../store/slices/chatSlice';
import MessageList from '../components/chat/MessageList';
import MessageInput from '../components/chat/MessageInput';
import Spinner from '../components/common/Spinner';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

const Chat = () => {
  const dispatch = useDispatch();
  const { conversations, activeConversation, loading, loadingConversations } = useSelector((state) => state.chat);
  const currentUser = useSelector((state) => state.auth.user);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    dispatch(getConversations());
  }, [dispatch]);

  // Sắp xếp hội thoại theo thời gian gần nhất
  const sortedConversations = [...conversations].sort((a, b) => {
    const timeA = a.lastMessage?.createdAt || a.updatedAt || a.createdAt;
    const timeB = b.lastMessage?.createdAt || b.updatedAt || b.createdAt;
    return new Date(timeB) - new Date(timeA);
  });

  // Lọc hội thoại theo từ khóa tìm kiếm
  const filteredConversations = sortedConversations.filter(conv => {
    // Nếu là hội thoại nhóm, tìm trong tên nhóm
    if (conv.type === 'group') {
      return conv.name.toLowerCase().includes(searchTerm.toLowerCase());
    }
    
    // Nếu là hội thoại 1-1, tìm trong tên người dùng khác
    const otherUser = conv.participants?.find(p => p.id !== currentUser?.id);
    return otherUser?.name?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Hàm lấy tên hiển thị cho hội thoại
  const getConversationName = (conversation) => {
    if (conversation.type === 'group') {
      return conversation.name;
    }
    
    // Tìm người dùng khác trong hội thoại 1-1
    const otherUser = conversation.participants?.find(p => p.id !== currentUser?.id);
    return otherUser?.name || 'Người dùng không xác định';
  };

  // Hàm lấy avatar cho hội thoại
  const getConversationAvatar = (conversation) => {
    if (conversation.type === 'group') {
      return conversation.image;
    }
    
    const otherUser = conversation.participants?.find(p => p.id !== currentUser?.id);
    return otherUser?.avatar;
  };

  // Hàm lấy nội dung tin nhắn cuối cùng
  const getLastMessagePreview = (conversation) => {
    if (!conversation.lastMessage) {
      return 'Chưa có tin nhắn';
    }
    
    if (conversation.lastMessage.senderId === currentUser?.id) {
      return `Bạn: ${conversation.lastMessage.content}`;
    }
    
    return conversation.lastMessage.content;
  };

  return (
    <div className="h-[calc(100vh-9rem)] flex rounded-lg overflow-hidden shadow-lg bg-white">
      {/* Sidebar - Danh sách hội thoại */}
      <div className="w-80 border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <input
              type="text"
              placeholder="Tìm kiếm hội thoại..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <svg 
              className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {loadingConversations ? (
            <div className="flex justify-center items-center h-full">
              <Spinner size="lg" />
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              {searchTerm ? 'Không tìm thấy hội thoại' : 'Chưa có hội thoại nào'}
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {filteredConversations.map((conversation) => (
                <li 
                  key={conversation.id}
                  onClick={() => dispatch(setActiveConversation(conversation))}
                  className={`p-4 flex items-start space-x-3 hover:bg-gray-50 cursor-pointer transition-colors ${
                    activeConversation?.id === conversation.id ? 'bg-indigo-50' : ''
                  }`}
                >
                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    {getConversationAvatar(conversation) ? (
                      <img 
                        src={getConversationAvatar(conversation)} 
                        alt={getConversationName(conversation)}
                        className="h-12 w-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center">
                        <span className="text-indigo-800 font-medium text-lg">
                          {getConversationName(conversation).charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    
                    {/* Online status indicator */}
                    {conversation.type !== 'group' && conversation.participants?.find(p => p.id !== currentUser?.id)?.status === 'online' && (
                      <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-white"></span>
                    )}
                  </div>
                  
                  {/* Conversation details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between">
                      <h3 className="text-sm font-medium text-gray-900 truncate">
                        {getConversationName(conversation)}
                      </h3>
                      <span className="text-xs text-gray-500">
                        {conversation.lastMessage?.createdAt && 
                          formatDistanceToNow(new Date(conversation.lastMessage.createdAt), { 
                            addSuffix: false,
                            locale: vi
                          })
                        }
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-gray-500 truncate">
                      {getLastMessagePreview(conversation)}
                    </p>
                    
                    {/* Unread badge */}
                    {conversation.unreadCount > 0 && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 mt-1">
                        {conversation.unreadCount}
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        
        {/* New conversation button */}
        <div className="p-4 border-t border-gray-200">
          <button 
            className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Tạo hội thoại mới
          </button>
        </div>
      </div>
      
      {/* Main chat area */}
      <div className="flex-1 flex flex-col">
        {activeConversation ? (
          <>
            {/* Chat header */}
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center">
                {getConversationAvatar(activeConversation) ? (
                  <img 
                    src={getConversationAvatar(activeConversation)} 
                    alt={getConversationName(activeConversation)}
                    className="h-10 w-10 rounded-full object-cover mr-3"
                  />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center mr-3">
                    <span className="text-indigo-800 font-medium">
                      {getConversationName(activeConversation).charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <div>
                  <h2 className="text-lg font-medium text-gray-900">
                    {getConversationName(activeConversation)}
                  </h2>
                  {activeConversation.type !== 'group' && (
                    <p className="text-sm text-gray-500">
                      {activeConversation.participants?.find(p => p.id !== currentUser?.id)?.status === 'online' 
                        ? 'Đang hoạt động' 
                        : 'Không hoạt động'}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="flex space-x-2">
                <button className="p-2 rounded-full hover:bg-gray-100">
                  <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </button>
                <button className="p-2 rounded-full hover:bg-gray-100">
                  <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
                <button className="p-2 rounded-full hover:bg-gray-100">
                  <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                  </svg>
                </button>
              </div>
            </div>
            
            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <MessageList conversationId={activeConversation.id} />
            </div>
            
            {/* Message input */}
            <div className="px-6 py-4 border-t border-gray-200">
              <MessageInput conversationId={activeConversation.id} />
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
            <img 
              src="/assets/welcome.svg" 
              alt="Welcome" 
              className="w-64 h-64 mb-6"
            />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Chào mừng đến với WebChat
            </h2>
            <p className="text-gray-600 max-w-md mb-8">
              Chọn một cuộc trò chuyện từ danh sách bên trái hoặc tạo cuộc trò chuyện mới để bắt đầu
            </p>
            <button className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors">
              Tạo cuộc trò chuyện mới
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat; 