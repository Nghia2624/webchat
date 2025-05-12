import React from 'react';
import { SearchIcon, MoreIcon } from '../icons';

const ChatHeader = React.memo(({ conversation }) => {
  return (
    <div className="p-4 border-b dark:border-gray-700 flex items-center">
      <div className="flex-1">
        <h2 className="text-lg font-medium text-gray-800 dark:text-white">
          {conversation.name || conversation.participants?.[0]?.name || 'Cuộc hội thoại'}
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {conversation.isGroup 
            ? `${conversation.participants?.length || 0} thành viên` 
            : conversation.participants?.[0]?.isOnline 
              ? 'Đang hoạt động'
              : 'Không hoạt động'
          }
        </p>
      </div>
      
      <div className="flex items-center space-x-2">
        <button className="p-2 text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
          <SearchIcon className="w-5 h-5" />
        </button>
        <button className="p-2 text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
          <MoreIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
});

ChatHeader.displayName = 'ChatHeader';

export default ChatHeader; 