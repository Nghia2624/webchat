import React, { useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Sidebar from '../components/layout/Sidebar';
import Header from '../components/layout/Header';
import { selectConnectionStatus } from '../store/slices/chatSlice';
import ToggleDarkMode from '../components/common/ToggleDarkMode';

const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const connectionStatus = useSelector(selectConnectionStatus);
  const { user } = useSelector(state => state.auth);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
      {/* Sidebar for navigation */}
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      
      {/* Main content area */}
      <div className="md:pl-64 flex flex-col flex-1">
        {/* Top header with user info and actions */}
        <Header onMenuClick={() => setSidebarOpen(true)}>
          <div className="flex items-center">
            <ToggleDarkMode className="mr-4" />
            <div className="relative">
              <Link to="/profile" className="flex items-center space-x-2">
                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white">
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <span className="font-medium text-gray-800 dark:text-white hidden sm:block">
                  {user?.name || 'Người dùng'}
                </span>
              </Link>
            </div>
          </div>
        </Header>
        
        {/* Connection status indicator */}
        {connectionStatus !== 'connected' && (
          <div 
            className={`py-2 px-4 text-center text-sm font-medium ${
              connectionStatus === 'connecting' || connectionStatus === 'reconnecting'
                ? 'bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                : 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400'
            }`}
          >
            {connectionStatus === 'connecting' && 'Đang kết nối đến máy chủ...'}
            {connectionStatus === 'reconnecting' && 'Đang khôi phục kết nối...'}
            {connectionStatus === 'disconnected' && 'Mất kết nối đến máy chủ. Đang thử kết nối lại...'}
            {connectionStatus === 'failed' && 'Không thể kết nối đến máy chủ. Vui lòng làm mới trang.'}
          </div>
        )}
        
        {/* Main content from child routes */}
        <main className="flex-1 p-4">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
        
        <footer className="py-4 px-8 bg-white dark:bg-gray-800 border-t dark:border-gray-700 shadow-sm">
          <div className="max-w-7xl mx-auto text-center text-sm text-gray-500 dark:text-gray-400">
            © {new Date().getFullYear()} WebChat - Phiên bản {import.meta.env.VITE_APP_VERSION || '1.0.0'}
          </div>
        </footer>
      </div>
    </div>
  );
};

export default MainLayout; 