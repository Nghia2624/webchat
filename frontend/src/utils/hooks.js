/**
 * Custom React hooks
 */

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { debounce, throttle } from './apiUtils';
import { logError } from './error';
import { debug, info, warn, error } from './logger';

/**
 * Use previous value
 * @param {any} value - Value to track
 * @returns {any} Previous value
 */
export const usePrevious = (value) => {
  const ref = useRef();
  
  useEffect(() => {
    ref.current = value;
  }, [value]);
  
  return ref.current;
};

/**
 * Use mounted state
 * @returns {boolean} Is mounted
 */
export const useMounted = () => {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);
  
  return mounted;
};

/**
 * Use mounted ref
 * @returns {Object} Mounted ref
 */
export const useMountedRef = () => {
  const mounted = useRef(true);
  
  useEffect(() => {
    return () => {
      mounted.current = false;
    };
  }, []);
  
  return mounted;
};

/**
 * Use debounce
 * @param {any} value - Value to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {any} Debounced value
 */
export const useDebounce = (value, delay = 500) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    
    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);
  
  return debouncedValue;
};

/**
 * Use throttle
 * @param {Function} callback - Callback function
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} Throttled callback
 */
export const useThrottle = (callback, delay = 500) => {
  const lastRun = useRef(Date.now());
  const timeout = useRef();
  
  return useCallback((...args) => {
    const now = Date.now();
    
    if (now - lastRun.current >= delay) {
      callback(...args);
      lastRun.current = now;
    } else {
      clearTimeout(timeout.current);
      timeout.current = setTimeout(() => {
        callback(...args);
        lastRun.current = Date.now();
      }, delay - (now - lastRun.current));
    }
  }, [callback, delay]);
};

/**
 * Use local storage
 * @param {string} key - Storage key
 * @param {any} initialValue - Initial value
 * @returns {[any, Function]} Value and setter
 */
export const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      logError(error);
      return initialValue;
    }
  });
  
  const setValue = useCallback((value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      logError(error);
    }
  }, [key, storedValue]);
  
  return [storedValue, setValue];
};

/**
 * Use session storage
 * @param {string} key - Storage key
 * @param {any} initialValue - Initial value
 * @returns {[any, Function]} Value and setter
 */
export const useSessionStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.sessionStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      logError(error);
      return initialValue;
    }
  });
  
  const setValue = useCallback((value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.sessionStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      logError(error);
    }
  }, [key, storedValue]);
  
  return [storedValue, setValue];
};

/**
 * Use media query
 * @param {string} query - Media query
 * @returns {boolean} Matches media query
 */
export const useMediaQuery = (query) => {
  const [matches, setMatches] = useState(false);
  
  useEffect(() => {
    const media = window.matchMedia(query);
    
    if (media.matches !== matches) {
      setMatches(media.matches);
    }
    
    const listener = () => setMatches(media.matches);
    media.addEventListener('change', listener);
    
    return () => media.removeEventListener('change', listener);
  }, [matches, query]);
  
  return matches;
};

/**
 * Use window size
 * @returns {Object} Window size
 */
export const useWindowSize = () => {
  const [size, setSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });
  
  useEffect(() => {
    const handleResize = () => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  return size;
};

/**
 * Use scroll position
 * @returns {Object} Scroll position
 */
export const useScrollPosition = () => {
  const [position, setPosition] = useState({
    x: window.pageXOffset,
    y: window.pageYOffset
  });
  
  useEffect(() => {
    const handleScroll = () => {
      setPosition({
        x: window.pageXOffset,
        y: window.pageYOffset
      });
    };
    
    window.addEventListener('scroll', handleScroll);
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  return position;
};

/**
 * Use click outside
 * @param {Function} callback - Callback function
 * @returns {Object} Ref
 */
export const useClickOutside = (callback) => {
  const ref = useRef();
  
  useEffect(() => {
    const handleClick = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        callback();
      }
    };
    
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('touchstart', handleClick);
    
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('touchstart', handleClick);
    };
  }, [callback]);
  
  return ref;
};

/**
 * Use keyboard
 * @param {string} key - Key to listen for
 * @param {Function} callback - Callback function
 */
export const useKeyboard = (key, callback) => {
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === key) {
        callback();
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [key, callback]);
};

/**
 * Use keyboard combination
 * @param {string[]} keys - Keys to listen for
 * @param {Function} callback - Callback function
 */
export const useKeyboardCombination = (keys, callback) => {
  const [pressed, setPressed] = useState(new Set());
  
  useEffect(() => {
    const handleKeyDown = (event) => {
      setPressed(prev => new Set([...prev, event.key]));
    };
    
    const handleKeyUp = (event) => {
      setPressed(prev => {
        const next = new Set(prev);
        next.delete(event.key);
        return next;
      });
    };
    
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, []);
  
  useEffect(() => {
    const allPressed = keys.every(key => pressed.has(key));
    if (allPressed) {
      callback();
    }
  }, [keys, pressed, callback]);
};

/**
 * Use clipboard
 * @param {string} text - Text to copy
 * @returns {[boolean, Function]} Success and copy function
 */
export const useClipboard = (text) => {
  const [success, setSuccess] = useState(false);
  
  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    } catch (error) {
      logError(error);
      setSuccess(false);
    }
  }, [text]);
  
  return [success, copy];
};

/**
 * Use geolocation
 * @returns {Object} Geolocation data
 */
export const useGeolocation = () => {
  const [data, setData] = useState({
    loading: true,
    error: null,
    latitude: null,
    longitude: null
  });
  
  useEffect(() => {
    if (!navigator.geolocation) {
      setData(prev => ({
        ...prev,
        loading: false,
        error: 'Geolocation is not supported'
      }));
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      position => {
        setData({
          loading: false,
          error: null,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
      },
      error => {
        setData(prev => ({
          ...prev,
          loading: false,
          error: error.message
        }));
      }
    );
  }, []);
  
  return data;
};

/**
 * Use network status
 * @returns {boolean} Is online
 */
export const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  return isOnline;
};

/**
 * Use document title
 * @param {string} title - Document title
 */
export const useDocumentTitle = (title) => {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = title;
    
    return () => {
      document.title = previousTitle;
    };
  }, [title]);
};

/**
 * Use document visibility
 * @returns {boolean} Is visible
 */
export const useDocumentVisibility = () => {
  const [isVisible, setIsVisible] = useState(!document.hidden);
  
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsVisible(!document.hidden);
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);
  
  return isVisible;
};

/**
 * Use document fullscreen
 * @returns {[boolean, Function, Function]} Is fullscreen and toggle function
 */
export const useDocumentFullscreen = () => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const enterFullscreen = useCallback(() => {
    const element = document.documentElement;
    
    if (element.requestFullscreen) {
      element.requestFullscreen();
    } else if (element.webkitRequestFullscreen) {
      element.webkitRequestFullscreen();
    } else if (element.msRequestFullscreen) {
      element.msRequestFullscreen();
    }
  }, []);
  
  const exitFullscreen = useCallback(() => {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen();
    }
  }, []);
  
  const toggleFullscreen = useCallback(() => {
    if (isFullscreen) {
      exitFullscreen();
    } else {
      enterFullscreen();
    }
  }, [isFullscreen, enterFullscreen, exitFullscreen]);
  
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.msFullscreenElement
      );
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('msfullscreenchange', handleFullscreenChange);
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('msfullscreenchange', handleFullscreenChange);
    };
  }, []);
  
  return [isFullscreen, toggleFullscreen];
};

/**
 * Use document scroll lock
 * @param {boolean} lock - Lock scroll
 */
export const useDocumentScrollLock = (lock) => {
  useEffect(() => {
    if (lock) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [lock]);
};

/**
 * Use document scroll to top
 * @param {boolean} smooth - Smooth scroll
 */
export const useDocumentScrollToTop = (smooth = false) => {
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: smooth ? 'smooth' : 'auto'
    });
  }, [smooth]);
};

/**
 * Use document scroll to bottom
 * @param {boolean} smooth - Smooth scroll
 */
export const useDocumentScrollToBottom = (smooth = false) => {
  useEffect(() => {
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: smooth ? 'smooth' : 'auto'
    });
  }, [smooth]);
};

/**
 * Use document scroll to element
 * @param {string} selector - Element selector
 * @param {boolean} smooth - Smooth scroll
 */
export const useDocumentScrollToElement = (selector, smooth = false) => {
  useEffect(() => {
    const element = document.querySelector(selector);
    
    if (element) {
      element.scrollIntoView({
        behavior: smooth ? 'smooth' : 'auto'
      });
    }
  }, [selector, smooth]);
};

/**
 * Use document scroll to position
 * @param {number} x - X position
 * @param {number} y - Y position
 * @param {boolean} smooth - Smooth scroll
 */
export const useDocumentScrollToPosition = (x, y, smooth = false) => {
  useEffect(() => {
    window.scrollTo({
      left: x,
      top: y,
      behavior: smooth ? 'smooth' : 'auto'
    });
  }, [x, y, smooth]);
};

/**
 * Use document scroll to hash
 * @param {string} hash - Hash
 * @param {boolean} smooth - Smooth scroll
 */
export const useDocumentScrollToHash = (hash, smooth = false) => {
  useEffect(() => {
    if (hash) {
      const element = document.querySelector(hash);
      
      if (element) {
        element.scrollIntoView({
          behavior: smooth ? 'smooth' : 'auto'
        });
      }
    }
  }, [hash, smooth]);
};

/**
 * Use document scroll to anchor
 * @param {string} anchor - Anchor
 * @param {boolean} smooth - Smooth scroll
 */
export const useDocumentScrollToAnchor = (anchor, smooth = false) => {
  useEffect(() => {
    if (anchor) {
      const element = document.querySelector(`#${anchor}`);
      
      if (element) {
        element.scrollIntoView({
          behavior: smooth ? 'smooth' : 'auto'
        });
      }
    }
  }, [anchor, smooth]);
};

/**
 * Use document scroll to class
 * @param {string} className - Class name
 * @param {boolean} smooth - Smooth scroll
 */
export const useDocumentScrollToClass = (className, smooth = false) => {
  useEffect(() => {
    if (className) {
      const element = document.querySelector(`.${className}`);
      
      if (element) {
        element.scrollIntoView({
          behavior: smooth ? 'smooth' : 'auto'
        });
      }
    }
  }, [className, smooth]);
};

/**
 * Use document scroll to id
 * @param {string} id - ID
 * @param {boolean} smooth - Smooth scroll
 */
export const useDocumentScrollToId = (id, smooth = false) => {
  useEffect(() => {
    if (id) {
      const element = document.getElementById(id);
      
      if (element) {
        element.scrollIntoView({
          behavior: smooth ? 'smooth' : 'auto'
        });
      }
    }
  }, [id, smooth]);
};

/**
 * Use document scroll to name
 * @param {string} name - Name
 * @param {boolean} smooth - Smooth scroll
 */
export const useDocumentScrollToName = (name, smooth = false) => {
  useEffect(() => {
    if (name) {
      const element = document.getElementsByName(name)[0];
      
      if (element) {
        element.scrollIntoView({
          behavior: smooth ? 'smooth' : 'auto'
        });
      }
    }
  }, [name, smooth]);
};

/**
 * Use document scroll to tag
 * @param {string} tag - Tag
 * @param {boolean} smooth - Smooth scroll
 */
export const useDocumentScrollToTag = (tag, smooth = false) => {
  useEffect(() => {
    if (tag) {
      const element = document.getElementsByTagName(tag)[0];
      
      if (element) {
        element.scrollIntoView({
          behavior: smooth ? 'smooth' : 'auto'
        });
      }
    }
  }, [tag, smooth]);
};

/**
 * Use document scroll to query
 * @param {string} query - Query
 * @param {boolean} smooth - Smooth scroll
 */
export const useDocumentScrollToQuery = (query, smooth = false) => {
  useEffect(() => {
    if (query) {
      const element = document.querySelector(query);
      
      if (element) {
        element.scrollIntoView({
          behavior: smooth ? 'smooth' : 'auto'
        });
      }
    }
  }, [query, smooth]);
};

/**
 * Use document scroll to query all
 * @param {string} query - Query
 * @param {boolean} smooth - Smooth scroll
 */
export const useDocumentScrollToQueryAll = (query, smooth = false) => {
  useEffect(() => {
    if (query) {
      const elements = document.querySelectorAll(query);
      
      if (elements.length > 0) {
        elements[0].scrollIntoView({
          behavior: smooth ? 'smooth' : 'auto'
        });
      }
    }
  }, [query, smooth]);
};

/**
 * Use document scroll to query selector
 * @param {string} selector - Selector
 * @param {boolean} smooth - Smooth scroll
 */
export const useDocumentScrollToQuerySelector = (selector, smooth = false) => {
  useEffect(() => {
    if (selector) {
      const element = document.querySelector(selector);
      
      if (element) {
        element.scrollIntoView({
          behavior: smooth ? 'smooth' : 'auto'
        });
      }
    }
  }, [selector, smooth]);
};

/**
 * Use document scroll to query selector all
 * @param {string} selector - Selector
 * @param {boolean} smooth - Smooth scroll
 */
export const useDocumentScrollToQuerySelectorAll = (selector, smooth = false) => {
  useEffect(() => {
    if (selector) {
      const elements = document.querySelectorAll(selector);
      
      if (elements.length > 0) {
        elements[0].scrollIntoView({
          behavior: smooth ? 'smooth' : 'auto'
        });
      }
    }
  }, [selector, smooth]);
}; 