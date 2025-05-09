import React from 'react';
import PropTypes from 'prop-types';

const colorMap = {
  A: '#4f46e5', // indigo-600
  B: '#0891b2', // cyan-600
  C: '#2563eb', // blue-600
  D: '#7c3aed', // violet-600
  E: '#c026d3', // fuchsia-600
  F: '#db2777', // pink-600
  G: '#059669', // emerald-600
  H: '#d97706', // amber-600
  I: '#dc2626', // red-600
  J: '#7c3aed', // violet-600
  K: '#2563eb', // blue-600
  L: '#0891b2', // cyan-600
  M: '#4f46e5', // indigo-600
  N: '#c026d3', // fuchsia-600
  O: '#db2777', // pink-600
  P: '#f59e0b', // amber-500
  Q: '#10b981', // emerald-500
  R: '#4f46e5', // indigo-600
  S: '#06b6d4', // cyan-500
  T: '#3b82f6', // blue-500
  U: '#8b5cf6', // violet-500
  V: '#ec4899', // pink-500
  W: '#a855f7', // purple-500
  X: '#f43f5e', // rose-500
  Y: '#14b8a6', // teal-500
  Z: '#ef4444', // red-500
};

/**
 * Avatar component for displaying user or group avatars
 * @param {Object} props - Component props
 * @param {Object} props.user - User object with name and avatar properties
 * @param {string} props.className - Additional CSS classes
 * @param {boolean} props.isGroup - Whether this avatar represents a group
 * @param {number} props.size - Size of the avatar in pixels
 * @returns {JSX.Element} Avatar component
 */
const Avatar = ({ 
  user,
  className = '',
  isGroup = false,
  size = 40
}) => {
  // Extract initial for avatar
  const getInitial = () => {
    if (!user || !user.name) return '?';
    return user.name.charAt(0).toUpperCase();
  };
  
  // Get background color based on initial
  const getBackgroundColor = () => {
    const initial = getInitial();
    return isGroup 
      ? 'bg-gradient-to-br from-primary to-primary-dark'
      : colorMap[initial] || '#4f46e5'; // Default to indigo if no match
  };
  
  // Render avatar image if available
  if (user?.avatar) {
    return (
      <div 
        className={`relative overflow-hidden rounded-full ${className}`}
        style={{ width: size, height: size }}
      >
        <img
          src={user.avatar}
          alt={user.name || 'Avatar'}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.parentNode.classList.add('fallback-avatar');
            e.target.parentNode.setAttribute(
              'data-initial',
              getInitial()
            );
          }}
        />
      </div>
    );
  }
  
  // Render initial-based avatar
  return (
    <div
      className={`flex items-center justify-center rounded-full text-white font-medium ${className}`}
      style={{
        backgroundColor: getBackgroundColor(),
        width: size,
        height: size,
        fontSize: size * 0.4
      }}
    >
      {isGroup ? (
        <svg 
          className="w-1/2 h-1/2" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" 
          />
        </svg>
      ) : (
        getInitial()
      )}
    </div>
  );
};

Avatar.propTypes = {
  user: PropTypes.object,
  className: PropTypes.string,
  isGroup: PropTypes.bool,
  size: PropTypes.number
};

export default Avatar; 