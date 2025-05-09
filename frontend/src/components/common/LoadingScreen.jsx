import React from 'react';
import PropTypes from 'prop-types';
import Spinner from './Spinner';

const LoadingScreen = ({ message = 'Đang tải...' }) => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center">
        <Spinner size="lg" color="indigo" />
        <p className="mt-4 text-gray-600 font-medium">{message}</p>
      </div>
    </div>
  );
};

LoadingScreen.propTypes = {
  message: PropTypes.string
};

export default LoadingScreen; 