/**
 * Utility functions for handling browser storage
 */

/**
 * Storage keys
 */
export const STORAGE_KEYS = {
  TOKEN: 'token',
  REFRESH_TOKEN: 'refreshToken',
  USER: 'user',
  THEME: 'theme',
  LANGUAGE: 'language',
  SETTINGS: 'settings',
  RECENT_CONVERSATIONS: 'recentConversations',
  MESSAGE_DRAFT: 'messageDraft',
  LAST_ACTIVE: 'lastActive',
  NOTIFICATIONS: 'notifications',
  FRIEND_REQUESTS: 'friendRequests',
  UNREAD_COUNTS: 'unreadCounts',
  TYPING_STATUS: 'typingStatus',
  ONLINE_STATUS: 'onlineStatus',
  MESSAGE_CACHE: 'messageCache',
  CONVERSATION_CACHE: 'conversationCache',
  USER_CACHE: 'userCache',
  SEARCH_HISTORY: 'searchHistory',
  FAVORITES: 'favorites',
  CUSTOM_EMOJIS: 'customEmojis',
  FILE_CACHE: 'fileCache',
  AUDIO_SETTINGS: 'audioSettings',
  VIDEO_SETTINGS: 'videoSettings',
  CHAT_SETTINGS: 'chatSettings',
  PRIVACY_SETTINGS: 'privacySettings',
  NOTIFICATION_SETTINGS: 'notificationSettings',
  APPEARANCE_SETTINGS: 'appearanceSettings',
  ACCESSIBILITY_SETTINGS: 'accessibilitySettings',
  SHORTCUTS: 'shortcuts',
  RECENT_FILES: 'recentFiles',
  DOWNLOAD_HISTORY: 'downloadHistory',
  UPLOAD_HISTORY: 'uploadHistory',
  ERROR_LOGS: 'errorLogs',
  PERFORMANCE_METRICS: 'performanceMetrics',
  SESSION_DATA: 'sessionData',
  CACHE_VERSION: 'cacheVersion',
  LAST_SYNC: 'lastSync',
  OFFLINE_QUEUE: 'offlineQueue',
  PENDING_REQUESTS: 'pendingRequests',
  SYNC_STATUS: 'syncStatus',
  BACKUP_DATA: 'backupData',
  RESTORE_POINT: 'restorePoint',
  MIGRATION_VERSION: 'migrationVersion',
  FEATURE_FLAGS: 'featureFlags',
  EXPERIMENT_DATA: 'experimentData',
  ANALYTICS_DATA: 'analyticsData',
  DEBUG_DATA: 'debugData',
  TEST_DATA: 'testData'
};

/**
 * Storage types
 */
export const STORAGE_TYPES = {
  LOCAL: 'localStorage',
  SESSION: 'sessionStorage',
  MEMORY: 'memoryStorage'
};

/**
 * Memory storage fallback
 */
const memoryStorage = new Map();

/**
 * Get storage instance
 * @param {string} type - Storage type
 * @returns {Storage} Storage instance
 */
const getStorage = (type = STORAGE_TYPES.LOCAL) => {
  try {
    switch (type) {
      case STORAGE_TYPES.LOCAL:
        return window.localStorage;
      case STORAGE_TYPES.SESSION:
        return window.sessionStorage;
      case STORAGE_TYPES.MEMORY:
        return {
          getItem: (key) => memoryStorage.get(key),
          setItem: (key, value) => memoryStorage.set(key, value),
          removeItem: (key) => memoryStorage.delete(key),
          clear: () => memoryStorage.clear(),
          key: (index) => Array.from(memoryStorage.keys())[index],
          length: memoryStorage.size
        };
      default:
        throw new Error(`Invalid storage type: ${type}`);
    }
  } catch (error) {
    console.error('Storage error:', error);
    return getStorage(STORAGE_TYPES.MEMORY);
  }
};

/**
 * Set item in storage
 * @param {string} key - Storage key
 * @param {any} value - Value to store
 * @param {string} type - Storage type
 */
export const setItem = (key, value, type = STORAGE_TYPES.LOCAL) => {
  try {
    const storage = getStorage(type);
    const serializedValue = JSON.stringify(value);
    storage.setItem(key, serializedValue);
  } catch (error) {
    console.error('Error setting storage item:', error);
  }
};

/**
 * Get item from storage
 * @param {string} key - Storage key
 * @param {any} defaultValue - Default value if not found
 * @param {string} type - Storage type
 * @returns {any} Stored value
 */
export const getItem = (key, defaultValue = null, type = STORAGE_TYPES.LOCAL) => {
  try {
    const storage = getStorage(type);
    const value = storage.getItem(key);
    return value ? JSON.parse(value) : defaultValue;
  } catch (error) {
    console.error('Error getting storage item:', error);
    return defaultValue;
  }
};

/**
 * Remove item from storage
 * @param {string} key - Storage key
 * @param {string} type - Storage type
 */
export const removeItem = (key, type = STORAGE_TYPES.LOCAL) => {
  try {
    const storage = getStorage(type);
    storage.removeItem(key);
  } catch (error) {
    console.error('Error removing storage item:', error);
  }
};

/**
 * Clear all items from storage
 * @param {string} type - Storage type
 */
export const clearStorage = (type = STORAGE_TYPES.LOCAL) => {
  try {
    const storage = getStorage(type);
    storage.clear();
  } catch (error) {
    console.error('Error clearing storage:', error);
  }
};

/**
 * Get all items from storage
 * @param {string} type - Storage type
 * @returns {Object} All stored items
 */
export const getAllItems = (type = STORAGE_TYPES.LOCAL) => {
  try {
    const storage = getStorage(type);
    const items = {};
    
    for (let i = 0; i < storage.length; i++) {
      const key = storage.key(i);
      items[key] = getItem(key, null, type);
    }
    
    return items;
  } catch (error) {
    console.error('Error getting all storage items:', error);
    return {};
  }
};

/**
 * Check if storage is available
 * @param {string} type - Storage type
 * @returns {boolean} Is storage available
 */
export const isStorageAvailable = (type = STORAGE_TYPES.LOCAL) => {
  try {
    const storage = getStorage(type);
    const testKey = '__storage_test__';
    storage.setItem(testKey, testKey);
    storage.removeItem(testKey);
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Get storage size
 * @param {string} type - Storage type
 * @returns {number} Storage size in bytes
 */
export const getStorageSize = (type = STORAGE_TYPES.LOCAL) => {
  try {
    const storage = getStorage(type);
    let size = 0;
    
    for (let i = 0; i < storage.length; i++) {
      const key = storage.key(i);
      const value = storage.getItem(key);
      size += key.length + value.length;
    }
    
    return size;
  } catch (error) {
    console.error('Error getting storage size:', error);
    return 0;
  }
};

/**
 * Get storage quota
 * @returns {Promise<Object>} Storage quota info
 */
export const getStorageQuota = async () => {
  try {
    if (navigator.storage && navigator.storage.estimate) {
      const estimate = await navigator.storage.estimate();
      return {
        quota: estimate.quota,
        usage: estimate.usage,
        percentage: (estimate.usage / estimate.quota) * 100
      };
    }
    return null;
  } catch (error) {
    console.error('Error getting storage quota:', error);
    return null;
  }
};

/**
 * Migrate storage data
 * @param {string} fromType - Source storage type
 * @param {string} toType - Target storage type
 * @returns {boolean} Migration success
 */
export const migrateStorage = (fromType, toType) => {
  try {
    const items = getAllItems(fromType);
    clearStorage(toType);
    
    Object.entries(items).forEach(([key, value]) => {
      setItem(key, value, toType);
    });
    
    return true;
  } catch (error) {
    console.error('Error migrating storage:', error);
    return false;
  }
};

/**
 * Backup storage data
 * @param {string} type - Storage type
 * @returns {string} Backup data
 */
export const backupStorage = (type = STORAGE_TYPES.LOCAL) => {
  try {
    const items = getAllItems(type);
    return JSON.stringify(items);
  } catch (error) {
    console.error('Error backing up storage:', error);
    return null;
  }
};

/**
 * Restore storage data
 * @param {string} backup - Backup data
 * @param {string} type - Storage type
 * @returns {boolean} Restore success
 */
export const restoreStorage = (backup, type = STORAGE_TYPES.LOCAL) => {
  try {
    const items = JSON.parse(backup);
    clearStorage(type);
    
    Object.entries(items).forEach(([key, value]) => {
      setItem(key, value, type);
    });
    
    return true;
  } catch (error) {
    console.error('Error restoring storage:', error);
    return false;
  }
};

/**
 * Subscribe to storage changes
 * @param {Function} callback - Change callback
 * @param {string} type - Storage type
 * @returns {Function} Unsubscribe function
 */
export const subscribeToStorage = (callback, type = STORAGE_TYPES.LOCAL) => {
  const handler = (event) => {
    if (event.storageArea === getStorage(type)) {
      callback(event);
    }
  };
  
  window.addEventListener('storage', handler);
  
  return () => {
    window.removeEventListener('storage', handler);
  };
};

/**
 * Create storage namespace
 * @param {string} namespace - Namespace prefix
 * @param {string} type - Storage type
 * @returns {Object} Namespace methods
 */
export const createStorageNamespace = (namespace, type = STORAGE_TYPES.LOCAL) => {
  const prefix = `${namespace}:`;
  
  return {
    set: (key, value) => setItem(prefix + key, value, type),
    get: (key, defaultValue) => getItem(prefix + key, defaultValue, type),
    remove: (key) => removeItem(prefix + key, type),
    clear: () => {
      const items = getAllItems(type);
      Object.keys(items)
        .filter(key => key.startsWith(prefix))
        .forEach(key => removeItem(key, type));
    },
    getAll: () => {
      const items = getAllItems(type);
      const namespaceItems = {};
      
      Object.entries(items)
        .filter(([key]) => key.startsWith(prefix))
        .forEach(([key, value]) => {
          namespaceItems[key.slice(prefix.length)] = value;
        });
      
      return namespaceItems;
    }
  };
}; 