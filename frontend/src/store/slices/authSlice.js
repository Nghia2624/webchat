import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authAPI } from '../../services';

/**
 * Thực hiện đăng nhập
 */
export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await authAPI.login({ email, password });
      const { tokens, user } = response.data;
      return { user, tokens };
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: 'Lỗi kết nối' });
    }
  }
);

/**
 * Thực hiện đăng ký
 */
export const register = createAsyncThunk(
  'auth/register',
  async ({ email, password, name }, { rejectWithValue }) => {
    try {
      const response = await authAPI.register({ email, password, name });
      const { tokens, user } = response.data;
      return { user, tokens };
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: 'Lỗi kết nối' });
    }
  }
);

/**
 * Làm mới token xác thực
 */
export const refreshToken = createAsyncThunk(
  'auth/refreshToken',
  async (refreshTokenValue, { getState, rejectWithValue }) => {
    try {
      if (!refreshTokenValue) {
        const state = getState();
        refreshTokenValue = state.auth.refreshToken;
      }
      
      if (!refreshTokenValue) {
        throw new Error('No refresh token available');
      }
      
      const response = await authAPI.refreshToken(refreshTokenValue);
      const { access_token, refresh_token } = response.data;
      
      return { 
        tokens: { 
          access_token, 
          refresh_token 
        } 
      };
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: 'Lỗi refresh token' });
    }
  }
);

/**
 * Lấy thông tin người dùng
 */
export const getUserData = createAsyncThunk(
  'auth/getUserData',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      
      if (!state.auth.isAuthenticated) {
        throw new Error('Người dùng chưa xác thực');
      }
      
      const response = await authAPI.getProfile();
      return { user: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: 'Không thể lấy thông tin người dùng' });
    }
  }
);

const initialState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  initialized: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
    },
    clearError: (state) => {
      state.error = null;
    },
    setToken: (state, action) => {
      state.accessToken = action.payload.access_token;
      state.refreshToken = action.payload.refresh_token;
      state.isAuthenticated = true;
    },
    setInitialized: (state, action) => {
      state.initialized = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login cases
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.accessToken = action.payload.tokens.access_token;
        state.refreshToken = action.payload.tokens.refresh_token;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || 'Đăng nhập thất bại';
      })
      
      // Register cases
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.accessToken = action.payload.tokens.access_token;
        state.refreshToken = action.payload.tokens.refresh_token;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || 'Đăng ký thất bại';
      })
      
      // Refresh token cases
      .addCase(refreshToken.pending, (state) => {
        state.loading = true;
      })
      .addCase(refreshToken.fulfilled, (state, action) => {
        state.loading = false;
        state.accessToken = action.payload.tokens.access_token;
        state.refreshToken = action.payload.tokens.refresh_token;
        state.isAuthenticated = true;
      })
      .addCase(refreshToken.rejected, (state) => {
        state.loading = false;
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
      })
      
      // Get user data cases
      .addCase(getUserData.pending, (state) => {
        state.loading = true;
      })
      .addCase(getUserData.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
      })
      .addCase(getUserData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || 'Không thể lấy thông tin người dùng';
      });
  },
});

export const { logout, clearError, setToken, setInitialized } = authSlice.actions;

// Selectors
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectCurrentUser = (state) => state.auth.user;
export const selectAuthLoading = (state) => state.auth.loading;
export const selectAuthError = (state) => state.auth.error;
export const selectToken = (state) => state.auth.accessToken;
export const selectInitialized = (state) => state.auth.initialized;

export default authSlice.reducer;