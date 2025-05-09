import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import { selectCurrentUser } from '../../store/slices/authSlice';
import { UserIcon, SettingsIcon, LogoutIcon } from '../chat/ChatIcons';
import PropTypes from 'prop-types';

const Header = ({ onMenuClick, children }) => {
  const dispatch = useDispatch();
  const user = useSelector(selectCurrentUser);
  const [showUserMenu, setShowUserMenu] = useState(false);
  
  const handleLogout = () => {
    dispatch(logout());
  };
  
  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm border-b dark:border-gray-700 transition-colors duration-200">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            {/* Mobile menu button */}
            <button
              type="button"
              className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none"
              onClick={onMenuClick}
            >
              <span className="sr-only">Mở menu</span>
              <svg
                className="h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
            
            {/* Logo */}
            <Link to="/" className="flex items-center flex-shrink-0 ml-4 md:ml-0">
              <img
                className="h-8 w-8"
                src="/logo.svg"
                alt="Logo"
              />
              <span className="ml-2 text-xl font-bold text-primary dark:text-white hidden md:block">
                WebChat
              </span>
            </Link>
          </div>
          
          {/* Right section */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Theme toggle etc. from children */}
            {children}
            
            {/* User dropdown */}
            <div className="relative">
              <button
                className="flex items-center space-x-2 focus:outline-none"
                onClick={() => setShowUserMenu(!showUserMenu)}
              >
                <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center">
                  <span className="text-sm font-semibold">
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </span>
                </div>
                <span className="hidden md:block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {user?.name || 'User'}
                </span>
              </button>
              
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-50 border dark:border-gray-700">
                  <Link
                    to="/profile"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <UserIcon className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" />
                    Hồ sơ
                  </Link>
                  <Link
                    to="/settings"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <SettingsIcon className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" />
                    Cài đặt
                  </Link>
                  <button
                    className="flex w-full items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={() => {
                      handleLogout();
                      setShowUserMenu(false);
                    }}
                  >
                    <LogoutIcon className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" />
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

Header.propTypes = {
  onMenuClick: PropTypes.func.isRequired
};

export default Header; 