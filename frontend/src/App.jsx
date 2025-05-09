import React, { useEffect, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { ToastContainer } from 'react-toastify';
import { setInitialized, refreshToken } from './store/slices/authSlice';
import { useApi } from './contexts/ApiContext';
import { useWebSocket } from './contexts/WebSocketContext';
import ErrorBoundary from './components/ErrorBoundary';
import { useTheme } from './contexts/ThemeContext';

// Import components
import Login from './pages/Login';
import Register from './pages/Register';
import Chat from './pages/Chat';
import ChatPage from './pages/ChatPage';
import Settings from './pages/Settings';
import UserProfile from './pages/UserProfile';
import PageNotFound from './pages/PageNotFound';
import NotFound from './pages/NotFound';
import FriendsPage from './pages/Friends';

// Layouts
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';

// Auth Pages
// Xóa các import không tồn tại
// import LoginPage from './pages/auth/LoginPage';
// import RegisterPage from './pages/auth/RegisterPage';
// import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';

// Protected Pages
// Xóa import HomePage nếu không tồn tại
// import HomePage from './pages/HomePage';
// import ProfilePage from './pages/ProfilePage';
// import SettingsPage from './pages/SettingsPage';

// Guard Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useSelector((state) => state.auth);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useSelector((state) => state.auth);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

// Loading fallback
const LoadingFallback = () => (
  <div className="flex items-center justify-center h-screen dark:bg-gray-900">
    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
  </div>
);

// App component
const App = () => {
  const dispatch = useDispatch();
  const { auth: authApi } = useApi();
  const { reconnect } = useWebSocket();
  const { darkMode } = useTheme();
  
  const { isAuthenticated, initialized, refreshToken: userRefreshToken } = useSelector(state => state.auth);
  
  // Kiểm tra token khi ứng dụng khởi chạy
  useEffect(() => {
    if (!initialized) {
      dispatch(refreshToken());
    }
  }, [dispatch, initialized]);
  
  // Kết nối lại WebSocket khi xác thực
  useEffect(() => {
    if (isAuthenticated && userRefreshToken) {
      reconnect({
        token: userRefreshToken,
        onTokenExpired: () => {
          authApi.refreshToken().then(result => {
            if (result.success) {
              reconnect({ token: result.data.refreshToken });
            }
          });
        }
      });
    }
  }, [isAuthenticated, reconnect, authApi, userRefreshToken]);
  
  // Cập nhật dark mode
  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);
  
  // Hiển thị loading khi chưa kiểm tra xong trạng thái xác thực
  if (!initialized) {
    return <LoadingFallback />;
  }
  
  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      
      <ErrorBoundary>
        <Routes>
          {/* Auth Routes */}
          <Route path="/" element={<AuthLayout />}>
            <Route path="login" element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            } />
            <Route path="register" element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            } />
            <Route path="forgot-password" element={
              <PublicRoute>
                <PageNotFound />
              </PublicRoute>
            } />
          </Route>
          
          {/* Protected Routes */}
          <Route path="/" element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Chat />} />
            <Route path="chat" element={<ChatPage />} />
            <Route path="chat/:conversationId" element={<ChatPage />} />
            <Route path="friends" element={<FriendsPage />} />
            <Route path="profile" element={<UserProfile />} />
            <Route path="settings" element={<Settings />} />
          </Route>
          
          {/* 404 Page */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </ErrorBoundary>
    </>
  );
};

export default App;
