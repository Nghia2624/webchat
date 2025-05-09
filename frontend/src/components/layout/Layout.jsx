import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../../store/slices/authSlice';
import websocketService from '../../services/websocket';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Layout = ({ children }) => {
  const { user, accessToken } = useSelector((state) => state.auth);
  const { connectionStatus } = useSelector((state) => state.chat);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  // Kết nối WebSocket khi component mount
  useEffect(() => {
    if (user && accessToken) {
      websocketService.connect(accessToken);
    }

    return () => {
      websocketService.disconnect();
    };
  }, [accessToken, user]);

  // Hiển thị thông báo khi trạng thái kết nối thay đổi
  useEffect(() => {
    if (connectionStatus === 'connected') {
      toast.success('Đã kết nối đến máy chủ', {
        autoClose: 2000,
        position: 'top-right',
      });
    } else if (connectionStatus === 'disconnected') {
      toast.warning('Mất kết nối đến máy chủ, đang thử kết nối lại...', {
        autoClose: 5000,
        position: 'top-right',
      });
    } else if (connectionStatus === 'failed') {
      toast.error('Không thể kết nối đến máy chủ', {
        autoClose: false,
        position: 'top-right',
      });
    }
  }, [connectionStatus]);

  // Xử lý đăng xuất
  const handleLogout = () => {
    websocketService.disconnect();
    dispatch(logout());
    navigate('/login');
    toast.info('Đã đăng xuất khỏi hệ thống', {
      autoClose: 3000,
      position: 'top-right',
    });
  };

  // Xử lý đi đến trang cá nhân
  const handleGoToProfile = () => {
    navigate('/profile');
    setShowProfileDropdown(false);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <ToastContainer />
      
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-xl font-bold text-indigo-600">WebChat</h1>
              </div>
              
              {/* Hiển thị trạng thái kết nối */}
              <div className="ml-4 flex items-center">
                <div className={`w-2 h-2 rounded-full mr-2 ${
                  connectionStatus === 'connected' ? 'bg-green-500' :
                  connectionStatus === 'connecting' ? 'bg-yellow-500' :
                  'bg-red-500'
                }`}></div>
                <span className="text-sm text-gray-500">
                  {connectionStatus === 'connected' ? 'Đã kết nối' :
                   connectionStatus === 'connecting' ? 'Đang kết nối...' :
                   connectionStatus === 'disconnected' ? 'Mất kết nối' :
                   'Lỗi kết nối'}
                </span>
              </div>
            </div>
            
            {user && (
              <div className="flex items-center relative">
                <div 
                  className="flex items-center cursor-pointer"
                  onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                >
                  {user.avatar ? (
                    <img 
                      src={user.avatar} 
                      alt={user.name} 
                      className="w-8 h-8 rounded-full object-cover mr-2"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center mr-2">
                      <span className="text-indigo-800 font-medium">
                        {user.name?.charAt(0).toUpperCase() || 'U'}
                      </span>
                    </div>
                  )}
                  <span className="text-gray-700 mr-1">{user.name}</span>
                  <svg 
                    className={`w-4 h-4 text-gray-400 transform transition-transform ${showProfileDropdown ? 'rotate-180' : ''}`}
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
                
                {/* Dropdown menu */}
                {showProfileDropdown && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-md shadow-lg z-10">
                    <div className="py-1">
                      <button 
                        onClick={handleGoToProfile}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Thông tin cá nhân
                      </button>
                      <button 
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                      >
                        Đăng xuất
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
      
      <footer className="bg-white border-t border-gray-200 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500">
            WebChat &copy; {new Date().getFullYear()} - Phiên bản 1.0.0
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Layout; 