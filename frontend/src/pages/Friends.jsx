import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  getFriends, 
  getFriendRequests, 
  sendFriendRequest, 
  acceptFriendRequest, 
  rejectFriendRequest, 
  removeFriend, 
  selectFriends, 
  selectFriendRequests, 
  selectFriendsLoading 
} from '../store/slices/friendSlice';
import { userAPI } from '../services';
import { toast } from 'react-toastify';
import { CheckBadgeIcon, UserPlusIcon, UserMinusIcon, XMarkIcon, CheckIcon } from '@heroicons/react/24/solid';
import Spinner from '../components/common/Spinner';

const Friends = () => {
  const dispatch = useDispatch();
  const friends = useSelector(selectFriends);
  const friendRequests = useSelector(selectFriendRequests);
  const loading = useSelector(selectFriendsLoading);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [activeTab, setActiveTab] = useState('friends'); // 'friends', 'requests', 'search'

  // Load friends and friend requests on mount
  useEffect(() => {
    dispatch(getFriends());
    dispatch(getFriendRequests());
  }, [dispatch]);

  // Handle search
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    try {
      setIsSearching(true);
      const response = await userAPI.searchUsers(searchQuery);
      setSearchResults(response.users || []);
    } catch (error) {
      toast.error('Failed to search users');
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  // Handle key press in search input
  const handleSearchKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Send friend request
  const handleSendRequest = (userId) => {
    dispatch(sendFriendRequest(userId));
  };

  // Accept friend request
  const handleAcceptRequest = (requestId) => {
    dispatch(acceptFriendRequest(requestId));
  };

  // Reject friend request
  const handleRejectRequest = (requestId) => {
    dispatch(rejectFriendRequest(requestId));
  };

  // Remove friend
  const handleRemoveFriend = (friendId) => {
    if (window.confirm('Are you sure you want to remove this friend?')) {
      dispatch(removeFriend(friendId));
    }
  };

  // Start a conversation with a friend
  const handleMessageFriend = (friendId) => {
    // This will be implemented later when we create the conversation functionality
    console.log('Start conversation with friend:', friendId);
    // TODO: Create conversation if not exists and navigate to chat
  };

  // Render tabs
  const renderTabs = () => (
    <div className="flex border-b border-gray-200 mb-6">
      <button
        className={`py-3 px-4 font-medium ${
          activeTab === 'friends'
            ? 'text-indigo-600 border-b-2 border-indigo-600'
            : 'text-gray-500 hover:text-gray-700'
        }`}
        onClick={() => setActiveTab('friends')}
      >
        Friends ({friends.length})
      </button>
      <button
        className={`py-3 px-4 font-medium ${
          activeTab === 'requests'
            ? 'text-indigo-600 border-b-2 border-indigo-600'
            : 'text-gray-500 hover:text-gray-700'
        }`}
        onClick={() => setActiveTab('requests')}
      >
        Requests ({friendRequests.received.length})
      </button>
      <button
        className={`py-3 px-4 font-medium ${
          activeTab === 'search'
            ? 'text-indigo-600 border-b-2 border-indigo-600'
            : 'text-gray-500 hover:text-gray-700'
        }`}
        onClick={() => setActiveTab('search')}
      >
        Find Friends
      </button>
    </div>
  );

  // Render friends list
  const renderFriendsList = () => {
    if (loading.friends) {
      return <div className="flex justify-center py-10"><Spinner size="lg" /></div>;
    }

    if (friends.length === 0) {
      return (
        <div className="text-center py-10 text-gray-500">
          <p>You haven't added any friends yet.</p>
          <button 
            className="mt-3 inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
            onClick={() => setActiveTab('search')}
          >
            <UserPlusIcon className="w-5 h-5 mr-2" />
            Find Friends
          </button>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {friends.map((friend) => (
          <div key={friend.id} className="bg-white rounded-lg shadow-md p-4 flex items-start">
            <div className="relative flex-shrink-0">
              <img
                src={friend.avatar || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(friend.name)}
                alt={friend.name}
                className="w-12 h-12 rounded-full object-cover"
              />
              <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full ${friend.isOnline ? 'bg-green-500' : 'bg-gray-400'}`}></span>
            </div>
            <div className="ml-4 flex-grow">
              <div className="flex items-center">
                <h3 className="font-medium text-gray-900">{friend.name}</h3>
                {friend.status === 'verified' && (
                  <CheckBadgeIcon className="w-5 h-5 text-blue-500 ml-1" />
                )}
              </div>
              <p className="text-sm text-gray-500">
                {friend.isOnline ? 'Online' : 'Offline'}
              </p>
              <div className="mt-2 flex space-x-2">
                <button
                  className="inline-flex items-center rounded-md bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-700 hover:bg-indigo-100"
                  onClick={() => handleMessageFriend(friend.id)}
                >
                  Message
                </button>
                <button
                  className="inline-flex items-center rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-100"
                  onClick={() => handleRemoveFriend(friend.id)}
                >
                  <UserMinusIcon className="w-4 h-4 mr-1" />
                  Remove
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Render friend requests
  const renderFriendRequests = () => {
    if (loading.requests) {
      return <div className="flex justify-center py-10"><Spinner size="lg" /></div>;
    }

    if (friendRequests.received.length === 0) {
      return (
        <div className="text-center py-10 text-gray-500">
          <p>You don't have any friend requests at the moment.</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Received Requests</h3>
        {friendRequests.received.map((request) => (
          <div key={request.id} className="bg-white rounded-lg shadow-md p-4 flex items-center">
            <img
              src={request.sender.avatar || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(request.sender.name)}
              alt={request.sender.name}
              className="w-12 h-12 rounded-full object-cover"
            />
            <div className="ml-4 flex-grow">
              <h3 className="font-medium text-gray-900">{request.sender.name}</h3>
              <p className="text-sm text-gray-500">Sent you a friend request</p>
            </div>
            <div className="flex space-x-2">
              <button
                className="inline-flex items-center rounded-md bg-green-50 px-3 py-1 text-sm font-medium text-green-700 hover:bg-green-100"
                onClick={() => handleAcceptRequest(request.id)}
                disabled={loading.operations}
              >
                <CheckIcon className="w-4 h-4 mr-1" />
                Accept
              </button>
              <button
                className="inline-flex items-center rounded-md bg-red-50 px-3 py-1 text-sm font-medium text-red-700 hover:bg-red-100"
                onClick={() => handleRejectRequest(request.id)}
                disabled={loading.operations}
              >
                <XMarkIcon className="w-4 h-4 mr-1" />
                Reject
              </button>
            </div>
          </div>
        ))}

        {friendRequests.sent.length > 0 && (
          <>
            <h3 className="text-lg font-medium text-gray-900 mt-8 mb-4">Sent Requests</h3>
            {friendRequests.sent.map((request) => (
              <div key={request.id} className="bg-white rounded-lg shadow-md p-4 flex items-center">
                <img
                  src={request.recipient.avatar || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(request.recipient.name)}
                  alt={request.recipient.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div className="ml-4 flex-grow">
                  <h3 className="font-medium text-gray-900">{request.recipient.name}</h3>
                  <p className="text-sm text-gray-500">
                    {request.status === 'pending'
                      ? 'Request pending'
                      : request.status === 'accepted'
                      ? 'Request accepted'
                      : 'Request rejected'}
                  </p>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    );
  };

  // Render search
  const renderSearch = () => {
    return (
      <div>
        <div className="mb-6">
          <label htmlFor="search" className="sr-only">
            Search users
          </label>
          <div className="relative">
            <input
              type="text"
              id="search"
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 pl-4 pr-12 py-2"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleSearchKeyPress}
            />
            <button
              className="absolute inset-y-0 right-0 flex items-center px-4 text-gray-500 hover:text-gray-700"
              onClick={handleSearch}
              disabled={isSearching}
            >
              {isSearching ? (
                <Spinner size="sm" />
              ) : (
                <svg
                  className="h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>

        {isSearching ? (
          <div className="text-center py-10">
            <Spinner size="lg" />
          </div>
        ) : searchResults.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {searchResults.map((user) => {
              // Check if user is already a friend
              const isFriend = friends.some((friend) => friend.id === user.id);
              
              // Check if we already sent a request
              const sentRequest = friendRequests.sent.find(
                (req) => req.recipient.id === user.id
              );
              
              // Check if we have received a request from this user
              const receivedRequest = friendRequests.received.find(
                (req) => req.sender.id === user.id
              );

              return (
                <div key={user.id} className="bg-white rounded-lg shadow-md p-4 flex items-start">
                  <img
                    src={user.avatar || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user.name)}
                    alt={user.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div className="ml-4 flex-grow">
                    <h3 className="font-medium text-gray-900">{user.name}</h3>
                    <p className="text-sm text-gray-500">{user.email}</p>
                    <div className="mt-2">
                      {isFriend ? (
                        <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700">
                          <CheckBadgeIcon className="w-4 h-4 mr-1" />
                          Already Friends
                        </span>
                      ) : sentRequest ? (
                        <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">
                          Request Sent
                        </span>
                      ) : receivedRequest ? (
                        <button
                          className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 hover:bg-green-100"
                          onClick={() => handleAcceptRequest(receivedRequest.id)}
                        >
                          <CheckIcon className="w-4 h-4 mr-1" />
                          Accept Request
                        </button>
                      ) : (
                        <button
                          className="inline-flex items-center rounded-md bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-700 hover:bg-indigo-100"
                          onClick={() => handleSendRequest(user.id)}
                          disabled={loading.operations}
                        >
                          <UserPlusIcon className="w-4 h-4 mr-1" />
                          Add Friend
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : searchQuery && !isSearching ? (
          <div className="text-center py-10 text-gray-500">
            <p>No users found matching "{searchQuery}"</p>
          </div>
        ) : null}
      </div>
    );
  };

  return (
    <div className="container max-w-6xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Friends</h1>
      
      {renderTabs()}
      
      <div className="bg-gray-50 rounded-lg p-6">
        {activeTab === 'friends' && renderFriendsList()}
        {activeTab === 'requests' && renderFriendRequests()}
        {activeTab === 'search' && renderSearch()}
      </div>
    </div>
  );
};

export default Friends; 