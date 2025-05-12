import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  addMessage, 
  setConnectionStatus,
  updateMessageStatus,
  updateTypingStatus,
  addOnlineUser,
  removeOnlineUser,
  incrementUnreadCount
} from '../store/slices/chatSlice';
import {
  addIncomingFriendRequest,
  updateFriendOnlineStatus
} from '../store/slices/friendSlice';
import { debounce, throttle } from '../utils/apiUtils';

// Constants
const CONNECTION_TIMEOUT = 10000; // 10 seconds
const RECONNECT_INTERVAL = 3000; // 3 seconds
const MAX_RECONNECT_ATTEMPTS = 5;
const PING_INTERVAL = 30000; // 30 seconds
const CONNECT_BACKOFF_FACTOR = 1.5; // Exponential backoff factor

const WebSocketContext = createContext();

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};

const WebSocketProvider = ({ children }) => {
  const dispatch = useDispatch();
  const socketRef = useRef(null);
  const pingIntervalRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const reconnectAttemptsRef = useRef(0);
  
  const { accessToken } = useSelector(state => state.auth);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  
  // Track the last received message timestamp
  const lastActivityRef = useRef(Date.now());
  
  // Optimized message queue with throttling
  const messageQueueRef = useRef([]);
  const [pendingMessages, setPendingMessages] = useState(0);
  
  // Update last activity timestamp
  const updateLastActivity = useCallback(() => {
    lastActivityRef.current = Date.now();
  }, []);
  
  // Create a buffer for typing status to minimize websocket traffic
  const sendTypingStatus = useCallback(
    throttle((conversationId, isTyping) => {
      if (socketRef.current?.readyState === WebSocket.OPEN) {
        socketRef.current.send(JSON.stringify({
          type: 'typing',
          payload: { conversationId, isTyping }
        }));
      }
    }, 1000),
    [socketRef]
  );
  
  // 1. handleMessage
  const handleMessage = useCallback((event) => {
    try {
      const data = JSON.parse(event.data);
      updateLastActivity();
      
      switch (data.type) {
        case 'message':
          dispatch(addMessage(data.payload));
          break;
          
        case 'message_status':
          dispatch(updateMessageStatus({
            id: data.payload.messageId,
            status: data.payload.status
          }));
          break;
          
        case 'friend_request':
          dispatch(addIncomingFriendRequest(data.payload));
          break;
          
        case 'friend_status':
          dispatch(updateFriendOnlineStatus({
            userId: data.payload.userId,
            isOnline: data.payload.isOnline
          }));
          break;
          
        case 'typing':
          dispatch(updateTypingStatus({
            conversationId: data.payload.conversationId,
            userId: data.payload.userId,
            isTyping: data.payload.isTyping
          }));
          break;
          
        case 'pong':
          // Handle pong - connection still active
          break;
          
        default:
          console.log('Unknown message type:', data.type);
      }
    } catch (error) {
      console.error('Error parsing WebSocket message:', error);
    }
  }, [dispatch]);
  
  // 2. attemptReconnect
  const connectRef = useRef();
  const attemptReconnect = useCallback(() => {
    if (reconnectAttemptsRef.current >= MAX_RECONNECT_ATTEMPTS) {
      console.warn('Maximum reconnection attempts reached');
      dispatch(setConnectionStatus('failed'));
      reconnectAttemptsRef.current = 0;
      return;
    }
    dispatch(setConnectionStatus('reconnecting'));
    const delay = RECONNECT_INTERVAL * Math.pow(CONNECT_BACKOFF_FACTOR, reconnectAttemptsRef.current);
    reconnectAttemptsRef.current++;
    reconnectTimeoutRef.current = setTimeout(() => {
      if (connectRef.current) connectRef.current();
    }, delay);
  }, [dispatch]);
  
  // 3. startPingInterval
  const startPingInterval = useCallback(() => {
    clearPingInterval();
    pingIntervalRef.current = setInterval(() => {
      const timeSinceLastActivity = Date.now() - lastActivityRef.current;
      if (timeSinceLastActivity > PING_INTERVAL * 2) {
        if (socketRef.current?.readyState === WebSocket.OPEN) {
          socketRef.current.send(JSON.stringify({ type: 'ping' }));
        } else {
          clearPingInterval();
          setIsConnected(false);
          dispatch(setConnectionStatus('disconnected'));
          attemptReconnect();
        }
      } else if (socketRef.current?.readyState === WebSocket.OPEN) {
        socketRef.current.send(JSON.stringify({ type: 'ping' }));
      }
    }, PING_INTERVAL);
  }, [dispatch, attemptReconnect]);
  
  // 4. clearPingInterval
  const clearPingInterval = useCallback(() => {
    if (pingIntervalRef.current) {
      clearInterval(pingIntervalRef.current);
      pingIntervalRef.current = null;
    }
  }, []);
  
  // 5. disconnect
  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.close();
    }
    clearPingInterval();
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    setIsConnected(false);
    dispatch(setConnectionStatus('disconnected'));
  }, [dispatch, clearPingInterval]);
  
  // 6. processPendingMessages
  const processPendingMessages = useCallback(() => {
    if (!isConnected || messageQueueRef.current.length === 0) return;
    while (messageQueueRef.current.length > 0) {
      const message = messageQueueRef.current.shift();
      try {
        socketRef.current?.send(JSON.stringify(message));
      } catch (error) {
        console.error('Error processing pending message:', error);
        messageQueueRef.current.unshift(message);
        break;
      }
    }
  }, [isConnected]);
  
  // 7. sendMessage
  const sendMessage = useCallback((data) => {
    if (!isConnected) {
      messageQueueRef.current.push(data);
      return;
    }
    try {
      socketRef.current?.send(JSON.stringify(data));
    } catch (error) {
      console.error('Error sending message:', error);
      messageQueueRef.current.push(data);
    }
  }, [isConnected]);
  
  // 8. connect
  const connect = useCallback(() => {
    // Prevent multiple connection attempts 
    if (isConnecting || socketRef.current?.readyState === WebSocket.CONNECTING) {
      return;
    }
    
    // Clear previous connection attempts
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    
    if (!accessToken) {
      dispatch(setConnectionStatus('disconnected'));
      setIsConnected(false);
      setIsConnecting(false);
      return;
    }
    
    setIsConnecting(true);
    dispatch(setConnectionStatus('connecting'));
    
    const wsUrl = `${import.meta.env.VITE_WS_URL || 'ws://localhost:8081/ws'}?token=${accessToken}`;
    
    try {
      // Close existing socket if any
      if (socketRef.current && socketRef.current.readyState !== WebSocket.CLOSED) {
        socketRef.current.close();
      }
      
      socketRef.current = new WebSocket(wsUrl);
      
      // Setup connection timeout
      const connectionTimeout = setTimeout(() => {
        if (socketRef.current?.readyState !== WebSocket.OPEN) {
          socketRef.current?.close();
          setIsConnecting(false);
          attemptReconnect();
        }
      }, CONNECTION_TIMEOUT);
      
      // WebSocket event handlers
      socketRef.current.onopen = () => {
        clearTimeout(connectionTimeout);
        setIsConnected(true);
        setIsConnecting(false);
        dispatch(setConnectionStatus('connected'));
        reconnectAttemptsRef.current = 0;
        
        // Start ping interval
        startPingInterval();
        
        // Send pending messages from queue
        processPendingMessages();
      };
      
      socketRef.current.onmessage = handleMessage;
      
      socketRef.current.onclose = () => {
        clearTimeout(connectionTimeout);
        setIsConnected(false);
        setIsConnecting(false);
        clearPingInterval();
        dispatch(setConnectionStatus('disconnected'));
        attemptReconnect();
      };
      
      socketRef.current.onerror = (error) => {
        clearTimeout(connectionTimeout);
        console.error('WebSocket error:', error);
        dispatch(setConnectionStatus('error'));
        socketRef.current?.close();
      };
    } catch (error) {
      console.error('Error creating WebSocket connection:', error);
      setIsConnecting(false);
      dispatch(setConnectionStatus('error'));
      attemptReconnect();
    }
  }, [accessToken, dispatch, isConnecting, processPendingMessages, handleMessage, startPingInterval, clearPingInterval, attemptReconnect]);
  
  connectRef.current = connect;
  
  // Process pending messages when connection is established
  useEffect(() => {
    if (isConnected) {
      processPendingMessages();
    }
  }, [isConnected, processPendingMessages]);
  
  // Connect when token changes or component mounts
  useEffect(() => {
    if (accessToken) {
      connect();
    } else {
      disconnect();
    }
    
    return () => {
      disconnect();
    };
  }, [accessToken, connect, disconnect]);
  
  // Context value
  const contextValue = {
    isConnected,
    isConnecting,
    sendMessage,
    sendTypingStatus,
    connect,
    disconnect,
    pendingMessages
  };
  
  return (
    <WebSocketContext.Provider value={contextValue}>
      {children}
    </WebSocketContext.Provider>
  );
};

export default WebSocketProvider; 