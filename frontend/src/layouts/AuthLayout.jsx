import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectAuthLoading } from '../store/slices/authSlice';
import Spinner from '../components/common/Spinner';

const AuthLayout = () => {
  const loading = useSelector(selectAuthLoading);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-2xl overflow-hidden">
        {/* Logo and branding */}
        <div className="p-5 text-center">
          <Link to="/" className="inline-block">
            <h1 className="text-3xl font-bold text-indigo-600">WebChat</h1>
            <p className="text-gray-500 mt-1">Kết nối mọi lúc, mọi nơi</p>
          </Link>
        </div>
        
        {/* Loading overlay */}
        {loading && (
          <div className="absolute inset-0 bg-white bg-opacity-70 flex items-center justify-center z-10">
            <Spinner size="lg" color="indigo" />
          </div>
        )}
        
        {/* Auth form from child routes */}
        <div className="px-6 py-8 relative">
          <Outlet />
        </div>
        
        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} WebChat. Tất cả quyền được bảo lưu.
        </div>
      </div>
    </div>
  );
};

export default AuthLayout; 