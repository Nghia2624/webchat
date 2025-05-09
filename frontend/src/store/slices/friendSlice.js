import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { userAPI } from '../../services';
import { toast } from 'react-toastify';

// Initial state
const initialState = {
  friends: [],
  friendRequests: {
    received: [],
    sent: []
  },
  loading: {
    friends: false,
    requests: false,
    operations: false
  },
  error: null
};

// Async thunks
export const getFriends = createAsyncThunk(
  'friends/getFriends',
  async (_, { rejectWithValue }) => {
    try {
      return await userAPI.getFriends();
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch friends');
    }
  }
);

export const getFriendRequests = createAsyncThunk(
  'friends/getFriendRequests',
  async (_, { rejectWithValue }) => {
    try {
      return await userAPI.getFriendRequests();
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch friend requests');
    }
  }
);

export const sendFriendRequest = createAsyncThunk(
  'friends/sendFriendRequest',
  async (userId, { rejectWithValue }) => {
    try {
      return await userAPI.sendFriendRequest(userId);
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to send friend request');
    }
  }
);

export const acceptFriendRequest = createAsyncThunk(
  'friends/acceptFriendRequest',
  async (requestId, { rejectWithValue }) => {
    try {
      return await userAPI.acceptFriendRequest(requestId);
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to accept friend request');
    }
  }
);

export const rejectFriendRequest = createAsyncThunk(
  'friends/rejectFriendRequest',
  async (requestId, { rejectWithValue }) => {
    try {
      return await userAPI.rejectFriendRequest(requestId);
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to reject friend request');
    }
  }
);

export const removeFriend = createAsyncThunk(
  'friends/removeFriend',
  async (friendId, { rejectWithValue }) => {
    try {
      return await userAPI.removeFriend(friendId);
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to remove friend');
    }
  }
);

// Create the slice
const friendSlice = createSlice({
  name: 'friends',
  initialState,
  reducers: {
    clearFriendError: (state) => {
      state.error = null;
    },
    addIncomingFriendRequest: (state, action) => {
      // Add a new incoming friend request (received via WebSocket)
      const request = action.payload;
      if (!state.friendRequests.received.some(req => req.id === request.id)) {
        state.friendRequests.received.push(request);
      }
    },
    updateFriendRequestStatus: (state, action) => {
      // Update a friend request status (received via WebSocket)
      const { requestId, status } = action.payload;
      
      // Update sent requests
      const sentIndex = state.friendRequests.sent.findIndex(req => req.id === requestId);
      if (sentIndex !== -1) {
        state.friendRequests.sent[sentIndex].status = status;
        
        // If accepted, add to friends list
        if (status === 'accepted') {
          const newFriend = {
            id: state.friendRequests.sent[sentIndex].recipient.id,
            name: state.friendRequests.sent[sentIndex].recipient.name,
            avatar: state.friendRequests.sent[sentIndex].recipient.avatar,
            isOnline: false,
            status: 'active'
          };
          state.friends.push(newFriend);
        }
      }
    },
    addNewFriend: (state, action) => {
      // Add a new friend (after accepting a request)
      const newFriend = action.payload;
      if (!state.friends.some(friend => friend.id === newFriend.id)) {
        state.friends.push(newFriend);
      }
    },
    updateFriendOnlineStatus: (state, action) => {
      // Update a friend's online status
      const { userId, isOnline } = action.payload;
      const friendIndex = state.friends.findIndex(friend => friend.id === userId);
      if (friendIndex !== -1) {
        state.friends[friendIndex].isOnline = isOnline;
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Get friends
      .addCase(getFriends.pending, (state) => {
        state.loading.friends = true;
        state.error = null;
      })
      .addCase(getFriends.fulfilled, (state, action) => {
        state.loading.friends = false;
        state.friends = action.payload.friends;
      })
      .addCase(getFriends.rejected, (state, action) => {
        state.loading.friends = false;
        state.error = action.payload;
        toast.error('Failed to load friends list');
      })
      
      // Get friend requests
      .addCase(getFriendRequests.pending, (state) => {
        state.loading.requests = true;
        state.error = null;
      })
      .addCase(getFriendRequests.fulfilled, (state, action) => {
        state.loading.requests = false;
        state.friendRequests = action.payload;
      })
      .addCase(getFriendRequests.rejected, (state, action) => {
        state.loading.requests = false;
        state.error = action.payload;
        toast.error('Failed to load friend requests');
      })
      
      // Send friend request
      .addCase(sendFriendRequest.pending, (state) => {
        state.loading.operations = true;
        state.error = null;
      })
      .addCase(sendFriendRequest.fulfilled, (state, action) => {
        state.loading.operations = false;
        state.friendRequests.sent.push(action.payload.request);
        toast.success('Friend request sent successfully');
      })
      .addCase(sendFriendRequest.rejected, (state, action) => {
        state.loading.operations = false;
        state.error = action.payload;
        toast.error('Failed to send friend request');
      })
      
      // Accept friend request
      .addCase(acceptFriendRequest.pending, (state) => {
        state.loading.operations = true;
        state.error = null;
      })
      .addCase(acceptFriendRequest.fulfilled, (state, action) => {
        state.loading.operations = false;
        
        // Remove from received requests
        state.friendRequests.received = state.friendRequests.received.filter(
          req => req.id !== action.payload.requestId
        );
        
        // Add to friends list
        state.friends.push(action.payload.friend);
        toast.success('Friend request accepted');
      })
      .addCase(acceptFriendRequest.rejected, (state, action) => {
        state.loading.operations = false;
        state.error = action.payload;
        toast.error('Failed to accept friend request');
      })
      
      // Reject friend request
      .addCase(rejectFriendRequest.pending, (state) => {
        state.loading.operations = true;
        state.error = null;
      })
      .addCase(rejectFriendRequest.fulfilled, (state, action) => {
        state.loading.operations = false;
        
        // Remove from received requests
        state.friendRequests.received = state.friendRequests.received.filter(
          req => req.id !== action.payload.requestId
        );
        
        toast.success('Friend request rejected');
      })
      .addCase(rejectFriendRequest.rejected, (state, action) => {
        state.loading.operations = false;
        state.error = action.payload;
        toast.error('Failed to reject friend request');
      })
      
      // Remove friend
      .addCase(removeFriend.pending, (state) => {
        state.loading.operations = true;
        state.error = null;
      })
      .addCase(removeFriend.fulfilled, (state, action) => {
        state.loading.operations = false;
        
        // Remove from friends list
        state.friends = state.friends.filter(
          friend => friend.id !== action.payload.friendId
        );
        
        toast.success('Friend removed successfully');
      })
      .addCase(removeFriend.rejected, (state, action) => {
        state.loading.operations = false;
        state.error = action.payload;
        toast.error('Failed to remove friend');
      });
  }
});

// Export actions
export const {
  clearFriendError,
  addIncomingFriendRequest,
  updateFriendRequestStatus,
  addNewFriend,
  updateFriendOnlineStatus
} = friendSlice.actions;

// Export selectors
export const selectFriends = (state) => state.friends.friends;
export const selectFriendRequests = (state) => state.friends.friendRequests;
export const selectFriendsLoading = (state) => state.friends.loading;

export default friendSlice.reducer; 