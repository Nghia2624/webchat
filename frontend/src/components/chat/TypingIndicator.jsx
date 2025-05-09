import React, { memo } from 'react';
import PropTypes from 'prop-types';

/**
 * TypingIndicator component that shows users who are currently typing
 * 
 * @param {Object} props - The component props
 * @param {Array} props.typingUsers - Array of user IDs who are typing
 * @param {Array} props.usernames - Array of user objects with id and username
 */
const TypingIndicator = memo(({ typingUsers = [], usernames = [] }) => {
  // If no one is typing, don't render anything
  if (!typingUsers.length) return null;
  
  // Get usernames of typing users
  const typingUsernames = typingUsers.map(userId => {
    const user = usernames.find(u => u.id === userId);
    return user ? user.username : 'Someone';
  });
  
  // Generate appropriate text based on number of typing users
  const getTypingText = () => {
    if (typingUsernames.length === 1) {
      return `${typingUsernames[0]} đang nhập...`;
    } else if (typingUsernames.length === 2) {
      return `${typingUsernames[0]} và ${typingUsernames[1]} đang nhập...`;
    } else {
      return `${typingUsernames[0]} và ${typingUsernames.length - 1} người khác đang nhập...`;
    }
  };
  
  return (
    <div className="typing-indicator-container">
      <div className="typing-dots">
        <div className="typing-dot"></div>
        <div className="typing-dot"></div>
        <div className="typing-dot"></div>
      </div>
      <div className="typing-text">{getTypingText()}</div>
    </div>
  );
});

TypingIndicator.propTypes = {
  typingUsers: PropTypes.array,
  usernames: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      username: PropTypes.string.isRequired
    })
  )
};

TypingIndicator.displayName = 'TypingIndicator';

export default TypingIndicator; 