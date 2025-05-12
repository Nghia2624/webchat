/**
 * Utility functions for API handling & optimization
 */

/**
 * Hàm debounce để giảm thiểu số lượng request liên tục
 * @param {Function} func - Hàm cần debounce
 * @param {number} wait - Thời gian chờ (ms)
 * @param {boolean} immediate - Có thực thi ngay lập tức hay không
 * @returns {Function} Hàm đã được debounce
 */
export const debounce = (func, wait = 300, immediate = false) => {
  let timeout;
  
  return function executedFunction(...args) {
    const context = this;
    
    const later = function() {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    
    const callNow = immediate && !timeout;
    
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    
    if (callNow) func.apply(context, args);
  };
};

/**
 * Hàm throttle để giới hạn tần suất gọi API
 * @param {Function} func - Hàm cần throttle
 * @param {number} limit - Thời gian giới hạn (ms)
 * @returns {Function} Hàm đã được throttle
 */
export const throttle = (func, limit = 300) => {
  let inThrottle;
  
  return function executedFunction(...args) {
    const context = this;
    
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
};

/**
 * Cache API response locally
 */
const apiCache = new Map();

/**
 * Hàm gọi API với cache
 * @param {string} key - Khóa cache
 * @param {Function} apiCall - Hàm gọi API
 * @param {number} expireTime - Thời gian hết hạn cache (ms)
 * @returns {Promise<any>} Kết quả API
 */
export const cachedApiCall = async (key, apiCall, expireTime = 60000) => {
  // Kiểm tra cache
  const cached = apiCache.get(key);
  const now = Date.now();
  
  if (cached && cached.timestamp + expireTime > now) {
    return cached.data;
  }
  
  // Thực hiện API call
  const data = await apiCall();
  
  // Lưu vào cache
  apiCache.set(key, {
    data,
    timestamp: now
  });
  
  return data;
};

/**
 * Xóa cache cho một khóa cụ thể
 * @param {string} key - Khóa cache cần xóa
 */
export const invalidateCache = (key) => {
  apiCache.delete(key);
};

/**
 * Xóa toàn bộ cache
 */
export const clearCache = () => {
  apiCache.clear();
};

/**
 * Batch nhiều API requests để tối ưu hiệu suất
 * @param {Array<Function>} requests - Mảng các hàm promise
 * @returns {Promise<Array<any>>} Kết quả của tất cả requests
 */
export const batchRequests = async (requests) => {
  return Promise.all(requests.map(req => req()));
};

/**
 * Retry API call nếu thất bại
 * @param {Function} apiCall - Hàm API call
 * @param {number} maxRetries - Số lần retry tối đa
 * @param {number} delay - Thời gian delay giữa các lần retry (ms)
 * @returns {Promise<any>} Kết quả API
 */
export const retryApiCall = async (apiCall, maxRetries = 3, delay = 1000) => {
  let retries = 0;
  
  while (retries < maxRetries) {
    try {
      return await apiCall();
    } catch (error) {
      retries++;
      
      if (retries >= maxRetries) {
        throw error;
      }
      
      // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, retries - 1)));
    }
  }
};

/**
 * Phân tích độ phức tạp của query để tối ưu caching
 * @param {string} query - Query string
 * @returns {number} Điểm độ phức tạp
 */
export const getQueryComplexity = (query) => {
  // Đếm số tham số
  const paramCount = (query.match(/=/g) || []).length;
  
  // Đếm số filters
  const filterCount = (query.match(/filter/gi) || []).length;
  
  // Đếm độ dài query
  const queryLength = query.length;
  
  return paramCount * 5 + filterCount * 10 + queryLength * 0.1;
};

/**
 * Tối ưu hóa query dựa trên độ phức tạp
 * @param {string} query - Query string
 * @param {number} complexity - Độ phức tạp của query
 * @returns {Object} Chiến lược tối ưu hóa
 */
export const optimizeQuery = (query, complexity = null) => {
  const calculatedComplexity = complexity || getQueryComplexity(query);
  
  // Default optimization strategy
  const strategy = {
    shouldCache: false,
    cacheDuration: 60000, // 1 minute
    shouldRetry: false,
    maxRetries: 2,
    useThrottle: false,
    throttleLimit: 1000
  };
  
  // Adjust strategy based on complexity
  if (calculatedComplexity > 50) {
    strategy.shouldCache = true;
    strategy.cacheDuration = 300000; // 5 minutes
    strategy.shouldRetry = true;
  }
  
  if (calculatedComplexity > 100) {
    strategy.useThrottle = true;
  }
  
  return strategy;
};

/**
 * Tạo request queue để xử lý tuần tự các requests
 * @returns {Object} Queue handler
 */
export const createRequestQueue = () => {
  const queue = [];
  let processing = false;
  
  const processQueue = async () => {
    if (processing || queue.length === 0) return;
    
    processing = true;
    const { request, resolve, reject } = queue.shift();
    
    try {
      const result = await request();
      resolve(result);
    } catch (error) {
      reject(error);
    } finally {
      processing = false;
      processQueue();
    }
  };
  
  return {
    add: (request) => {
      return new Promise((resolve, reject) => {
        queue.push({ request, resolve, reject });
        processQueue();
      });
    },
    clear: () => {
      queue.length = 0;
    },
    getLength: () => queue.length
  };
};

/**
 * Tạo rate limiter để giới hạn số lượng requests trong một khoảng thời gian
 * @param {number} maxRequests - Số lượng requests tối đa
 * @param {number} timeWindow - Khoảng thời gian (ms)
 * @returns {Function} Rate limiter function
 */
export const createRateLimiter = (maxRequests, timeWindow) => {
  const requests = [];
  
  return () => {
    const now = Date.now();
    requests.push(now);
    
    // Remove old requests
    while (requests.length > 0 && requests[0] < now - timeWindow) {
      requests.shift();
    }
    
    return requests.length <= maxRequests;
  };
};

/**
 * Tạo circuit breaker để ngăn chặn requests khi service gặp vấn đề
 * @param {Object} options - Cấu hình circuit breaker
 * @returns {Function} Circuit breaker function
 */
export const createCircuitBreaker = (options = {}) => {
  const {
    failureThreshold = 5,
    resetTimeout = 30000,
    monitorInterval = 1000
  } = options;
  
  let failures = 0;
  let lastFailureTime = 0;
  let state = 'CLOSED';
  
  const monitor = setInterval(() => {
    if (state === 'OPEN' && Date.now() - lastFailureTime > resetTimeout) {
      state = 'HALF-OPEN';
    }
  }, monitorInterval);
  
  return {
    execute: async (fn) => {
      if (state === 'OPEN') {
        throw new Error('Circuit breaker is OPEN');
      }
      
      try {
        const result = await fn();
        if (state === 'HALF-OPEN') {
          state = 'CLOSED';
          failures = 0;
        }
        return result;
      } catch (error) {
        failures++;
        lastFailureTime = Date.now();
        
        if (failures >= failureThreshold) {
          state = 'OPEN';
        }
        
        throw error;
      }
    },
    getState: () => state,
    reset: () => {
      state = 'CLOSED';
      failures = 0;
    },
    destroy: () => {
      clearInterval(monitor);
    }
  };
};

/**
 * Tạo request interceptor để xử lý các requests trước khi gửi
 * @param {Array<Function>} interceptors - Mảng các interceptor functions
 * @returns {Function} Request handler
 */
export const createRequestInterceptor = (interceptors = []) => {
  return async (request) => {
    let modifiedRequest = request;
    
    for (const interceptor of interceptors) {
      modifiedRequest = await interceptor(modifiedRequest);
    }
    
    return modifiedRequest;
  };
};

/**
 * Tạo response interceptor để xử lý các responses sau khi nhận
 * @param {Array<Function>} interceptors - Mảng các interceptor functions
 * @returns {Function} Response handler
 */
export const createResponseInterceptor = (interceptors = []) => {
  return async (response) => {
    let modifiedResponse = response;
    
    for (const interceptor of interceptors) {
      modifiedResponse = await interceptor(modifiedResponse);
    }
    
    return modifiedResponse;
  };
}; 