import React from 'react';
import { Link } from 'react-router-dom';

const PageNotFound = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="text-center p-8 bg-white rounded-lg shadow-md max-w-md">
        <div className="mb-6">
          <h1 className="text-9xl font-bold text-blue-500">404</h1>
          <h2 className="text-2xl font-semibold text-gray-800 mt-4">Trang không tìm thấy</h2>
          <p className="text-gray-600 mt-2">
            Trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển.
          </p>
        </div>
        
        <div className="mt-6">
          <Link
            to="/"
            className="inline-block px-6 py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            Trở về trang chủ
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PageNotFound; 