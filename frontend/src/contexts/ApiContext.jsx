import React, { createContext, useContext, useMemo, useEffect } from 'react';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { logout, refreshToken } from '../store/slices/authSlice';

// Tạo context cho API
const ApiContext = createContext(null);

// Custom hook để sử dụng api context
export const useApi = () => {
  const context = useContext(ApiContext);
  if (!context) {
    throw new Error('useApi must be used within an ApiProvider');
  }
  return context;
};

// Các hàm utility
const normalizeError = (error) => {
  // Lỗi network hoặc timeout
  if (!error.response) {
    return {
      status: 0,
      message: 'Không thể kết nối đến máy chủ',
      isNetworkError: true,
    };
  }

  // Lỗi xác thực
  if (error.response.status === 401) {
    return {
      status: 401,
      message: 'Phiên đăng nhập hết hạn hoặc không hợp lệ',
      isAuthError: true,
    };
  }

  // Lỗi giới hạn request
  if (error.response.status === 429) {
    return {
      status: 429,
      message: 'Quá nhiều yêu cầu, vui lòng thử lại sau',
      isRateLimitError: true,
    };
  }

  // Lỗi server
  if (error.response.status >= 500) {
    return {
      status: error.response.status,
      message: 'Lỗi máy chủ, vui lòng thử lại sau',
      isServerError: true,
    };
  }

  // Lỗi client với message từ server
  return {
    status: error.response.status,
    message: error.response.data?.message || 'Đã xảy ra lỗi',
    data: error.response.data,
  };
};

// Exponential backoff với jitter
const getBackoffTime = (attempt, initialDelay = 1000, maxDelay = 30000) => {
  // Tính toán thời gian chờ với jitter để tránh thundering herd
  const calculatedDelay = Math.min(
    maxDelay,
    initialDelay * Math.pow(1.5, attempt)
  );
  // Thêm jitter ±10% để các clients không cùng retry một lúc
  return calculatedDelay * (0.9 + Math.random() * 0.2);
};

// Api Provider component
export const ApiProvider = ({ children }) => {
  const dispatch = useDispatch();
  const { accessToken, refreshToken: userRefreshToken } = useSelector(state => state.auth);

  // Tạo và cấu hình Axios instance
  const axiosInstance = useMemo(() => {
    // Tạo instance mới
    const instance = axios.create({
      baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8081/api',
      timeout: 15000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Biến trạng thái refresh
    let isRefreshing = false;
    let failedQueue = [];

    const processQueue = (error, token = null) => {
      failedQueue.forEach(({ resolve, reject }) => {
        if (error) {
          reject(error);
        } else {
          resolve(token);
        }
      });
      failedQueue = [];
    };

    // Request interceptor
    instance.interceptors.request.use(
      (config) => {
        // Không thêm token cho các API không cần xác thực
        if (config.skipAuth) {
          return config;
        }
        
        if (accessToken) {
          config.headers.Authorization = `Bearer ${accessToken}`;
        }
        
        // Thêm CSRF token nếu có
        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
        if (csrfToken && !['GET', 'HEAD', 'OPTIONS'].includes(config.method?.toUpperCase())) {
          config.headers['X-CSRF-Token'] = csrfToken;
        }
        
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
    instance.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        
        // Tránh vòng lặp vô hạn hoặc xử lý request không cần auth
        if (originalRequest._retry || originalRequest.skipAuth) {
          return Promise.reject(error);
        }
        
        // Refresh token khi gặp lỗi 401
        if (error.response?.status === 401 && userRefreshToken) {
          originalRequest._retry = true;
          
          // Nếu đang refresh, thêm request vào hàng đợi
          if (isRefreshing) {
            return new Promise((resolve, reject) => {
              failedQueue.push({ resolve, reject });
            })
              .then((token) => {
                originalRequest.headers.Authorization = `Bearer ${token}`;
                return instance(originalRequest);
              })
              .catch((err) => {
                return Promise.reject(err);
              });
          }
          
          // Đánh dấu đang refresh
          isRefreshing = true;
          
          try {
            // Thực hiện refresh token
            const result = await dispatch(refreshToken(userRefreshToken));
            
            if (result.error) {
              // Refresh token thất bại, đăng xuất
              processQueue(result.error);
              dispatch(logout());
              return Promise.reject(error);
            }
            
            const newToken = result.payload.accessToken;
            
            // Cập nhật token cho request hiện tại và các request trong hàng đợi
            processQueue(null, newToken);
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            
            // Thực hiện lại request ban đầu
            return instance(originalRequest);
          } catch (refreshError) {
            // Xử lý lỗi khi refresh token thất bại
            processQueue(refreshError);
            dispatch(logout());
            return Promise.reject(refreshError);
          } finally {
            isRefreshing = false;
          }
        }
        
        // Các lỗi khác
        return Promise.reject(error);
      }
    );

    return instance;
  }, [accessToken, userRefreshToken, dispatch]);

  // Tạo API repository
  const api = useMemo(() => {
    // Hàm retry request
    const retryRequest = async (config, retries = 3) => {
      let currentRetry = 0;
      
      while (currentRetry < retries) {
        try {
          return await axiosInstance(config);
        } catch (error) {
          const normError = normalizeError(error);
          
          // Không retry với những lỗi này
          if (normError.isAuthError || (error.response && error.response.status < 500)) {
            throw error;
          }
          
          // Tăng số lần retry và chờ
          currentRetry++;
          if (currentRetry >= retries) {
            throw error;
          }
          
          // Exponential backoff với jitter
          const delay = getBackoffTime(currentRetry);
          console.log(`Retry attempt ${currentRetry}/${retries} after ${delay}ms`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    };

    // Auth API Repository
    const authAPI = {
      login: async (credentials) => {
        try {
          const sanitizedCredentials = {
            email: (credentials.email || '').trim(),
            password: credentials.password || ''
          };
          const response = await axiosInstance.post('/auth/login', sanitizedCredentials, { skipAuth: true });
          return response.data;
        } catch (error) {
          throw normalizeError(error);
        }
      },
      
      register: async (userData) => {
        try {
          const response = await axiosInstance.post('/auth/register', userData, { skipAuth: true });
          return response.data;
        } catch (error) {
          throw normalizeError(error);
        }
      },
      
      refreshToken: async (refreshToken) => {
        try {
          const response = await axiosInstance.post('/auth/refresh', { refreshToken }, { skipAuth: true });
          return response.data;
        } catch (error) {
          throw normalizeError(error);
        }
      },
      
      logout: async () => {
        try {
          await axiosInstance.post('/auth/logout');
          return { success: true };
        } catch (error) {
          console.error('Logout error:', error);
          return { success: true };
        }
      },
    };

    // User API Repository
    const userAPI = {
      getCurrentUser: async () => {
        try {
          const response = await retryRequest({ url: '/users/me' });
          return response.data;
        } catch (error) {
          throw normalizeError(error);
        }
      },
      
      updateProfile: async (userData) => {
        try {
          const response = await axiosInstance.put('/users/me', userData);
          return response.data;
        } catch (error) {
          throw normalizeError(error);
        }
      },
      
      searchUsers: async (query) => {
        try {
          const sanitizedQuery = (query || '').trim();
          const response = await axiosInstance.get('/users/search', { 
            params: { q: sanitizedQuery } 
          });
          return response.data;
        } catch (error) {
          throw normalizeError(error);
        }
      },
    };

    // Friends API Repository
    const friendsAPI = {  
      getFriends: async () => {
        try {
          const response = await retryRequest({ url: '/friends' });
          return response.data;
        } catch (error) {
          throw normalizeError(error);
        }
      },

      getFriendRequests: async () => {
        try {
          const response = await retryRequest({ url: '/friends/requests' });
          return response.data;
        } catch (error) {
          throw normalizeError(error);
        }
      },

      sendFriendRequest: async (userId) => {
        try {
          const response = await axiosInstance.post('/friends/requests', { userId });
          return response.data;
        } catch (error) {
          throw normalizeError(error);
        }
      },

      acceptFriendRequest: async (requestId) => {
        try {
          const response = await axiosInstance.put(`/friends/requests/${requestId}/accept`);
          return response.data;
        } catch (error) {
          throw normalizeError(error);
        }
      },

      rejectFriendRequest: async (requestId) => {
        try {
          const response = await axiosInstance.put(`/friends/requests/${requestId}/reject`);
          return response.data;
        } catch (error) {
          throw normalizeError(error);
        }
      },

      removeFriend: async (friendId) => {
        try {
          const response = await axiosInstance.delete(`/friends/${friendId}`);
          return response.data;
        } catch (error) {
          throw normalizeError(error);
        }
      },
      
      // Thêm batch API cho friend requests
      batchProcessFriendRequests: async (requestIds, action) => {
        try {
          const response = await axiosInstance.put('/friends/requests/batch', { 
            requestIds, 
            action // 'accept' or 'reject'
          });
          return response.data;
        } catch (error) {
          throw normalizeError(error);
        }
      },
    };

    // Conversations API Repository
    const conversationsAPI = {
      getConversations: async () => {
        try {
          const response = await retryRequest({ url: '/conversations' });
          return response.data;
        } catch (error) {
          throw normalizeError(error);
        }
      },
      
      getConversation: async (id) => {
        try {
          const response = await retryRequest({ url: `/conversations/${id}` });
          return response.data;
        } catch (error) {
          throw normalizeError(error);
        }
      },
      
      createPersonalConversation: async (recipientId) => {
        try {
          const response = await axiosInstance.post('/conversations/personal', { recipientId });
          return response.data;
        } catch (error) {
          throw normalizeError(error);
        }
      },
      
      createGroupConversation: async (name, participantIds) => {
        try {
          const sanitizedName = (name || '').trim();
          const response = await axiosInstance.post('/conversations/group', { 
            name: sanitizedName, 
            participantIds 
          });
          return response.data;
        } catch (error) {
          throw normalizeError(error);
        }
      },
      
      getMessages: async (conversationId, offset = 0, limit = 20) => {
        try {
          const response = await retryRequest({
            url: `/conversations/${conversationId}/messages`,
            params: { offset, limit }
          });
          return response.data;
        } catch (error) {
          throw normalizeError(error);
        }
      },
      
      markMessagesAsRead: async (conversationId, messageIds) => {
        try {
          const response = await axiosInstance.post(`/conversations/${conversationId}/messages/read`, { messageIds });
          return response.data;
        } catch (error) {
          throw normalizeError(error);
        }
      },
    };

    // Files API Repository
    const filesAPI = {
      uploadFile: async (file, type = 'attachment') => {
        try {
          const formData = new FormData();
          formData.append('file', file);
          formData.append('type', type);
          
          const response = await axiosInstance.post('/files/upload', formData, {
            headers: {
              'Content-Type': 'multipart/form-data'
            },
            timeout: 30000 // Tăng timeout cho upload file
          });
          
          return response.data;
        } catch (error) {
          throw normalizeError(error);
        }
      },
    };

    // System API Repository
    const systemAPI = {
      healthCheck: async () => {
        try {
          const response = await axiosInstance.get('/health', { skipAuth: true, timeout: 5000 });
          return response.data;
        } catch (error) {
          throw normalizeError(error);
        }
      },
    };

    // Kết hợp tất cả các repository
    return {
      auth: authAPI,
      user: userAPI,
      friends: friendsAPI,
      conversations: conversationsAPI,
      files: filesAPI,
      system: systemAPI,
      axios: axiosInstance, // Xuất instance cho các trường hợp đặc biệt
    };
  }, [axiosInstance]);

  // Xuất API context
  return (
    <ApiContext.Provider value={api}>
      {children}
    </ApiContext.Provider>
  );
};

export default ApiProvider; 