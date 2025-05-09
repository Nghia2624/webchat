import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setActiveConversation } from '../../store/slices/chatSlice';
import { logout } from '../../store/slices/authSlice';
import ConversationList from './ConversationList';
import MessageList from './MessageList';
import MessageInput from './MessageInput';

const ChatLayout = () => {
  const dispatch = useDispatch();
  const { activeConversation } = useSelector((state) => state.chat);
  const { user } = useSelector((state) => state.auth);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Close mobile menu when a conversation is selected
  useEffect(() => {
    if (activeConversation && isMobileMenuOpen) {
      setIsMobileMenuOpen(false);
    }
  }, [activeConversation, isMobileMenuOpen]);

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Main Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center">
            <div className="text-blue-600 font-bold text-xl mr-2">WebChat</div>
          </div>
          
          <div className="relative">
            <button 
              className="flex items-center space-x-2 focus:outline-none"
              onClick={() => setShowUserMenu(!showUserMenu)}
            >
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <span className="hidden md:block text-sm font-medium">{user?.name || 'User'}</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-200">
                <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-200">
                  <div className="font-semibold">{user?.name}</div>
                  <div className="text-gray-500 truncate">{user?.email}</div>
                </div>
                <button 
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Đăng xuất
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Danh sách cuộc trò chuyện */}
        <div
          className={`${
            isMobileMenuOpen ? 'block' : 'hidden'
          } md:block w-full md:w-80 bg-white border-r border-gray-200 flex-shrink-0 z-10 md:relative absolute inset-0`}
        >
          <ConversationList />
        </div>

        {/* Khung chat chính */}
        <div className="flex-1 flex flex-col">
          {/* Chat Header */}
          <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200 bg-white">
            <div className="flex items-center">
              <button
                className="md:hidden p-2 rounded-md hover:bg-gray-100 mr-2"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              
              {activeConversation && (
                <div className="flex items-center">
                  {activeConversation.type === 'group' ? (
                    <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center mr-3">
                      <span className="text-white font-semibold">
                        {activeConversation.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center mr-3">
                      <span className="text-white font-semibold">
                        {activeConversation.participants[0]?.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  
                  <div>
                    <h2 className="text-lg font-semibold">
                      {activeConversation.type === 'group'
                        ? activeConversation.name
                        : activeConversation.participants[0]?.name}
                    </h2>
                    <div className="text-xs text-gray-500">
                      {activeConversation.type === 'group' 
                        ? `${activeConversation.participants.length} thành viên` 
                        : 'Trực tuyến'}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Danh sách tin nhắn */}
          <div className="flex-1 overflow-hidden bg-gray-50">
            {activeConversation ? (
              <MessageList conversationId={activeConversation.id} />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-500 p-4">
                <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h3 className="text-xl font-medium mb-2">Chưa có cuộc trò chuyện nào</h3>
                <p className="text-center max-w-md">
                  Chọn một cuộc trò chuyện từ danh sách bên trái hoặc tạo một cuộc trò chuyện mới để bắt đầu.
                </p>
              </div>
            )}
          </div>

          {/* Khung nhập tin nhắn */}
          {activeConversation && (
            <div className="p-4 border-t border-gray-200 bg-white">
              <MessageInput conversationId={activeConversation.id} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatLayout;