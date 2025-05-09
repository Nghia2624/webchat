import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { combineReducers } from 'redux';
import authReducer from './slices/authSlice';
import chatReducer from './slices/chatSlice';
import friendReducer from './slices/friendSlice';

// Config cho redux-persist
const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth'], // Chỉ lưu trữ auth reducer
};

// Tạo rootReducer
const rootReducer = combineReducers({
  auth: authReducer,
  chat: chatReducer,
  friends: friendReducer,
});

// Tạo persistedReducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Tạo store
const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
        ignoredPaths: [
          'register.timestamp',
          'chat.onlineUsers',
          'chat.typingUsers'
        ],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

// Tạo persistor
export const persistor = persistStore(store);

// Default export for the store
export default store;