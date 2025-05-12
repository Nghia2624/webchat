import { useCallback, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { markMessageAsRead, batchMarkMessagesAsRead } from '../store/slices/chatSlice';
import { useWebSocket } from '../contexts/WebSocketContext';

/**
 * Hook to efficiently handle marking messages as read
 * Uses batching to minimize websocket traffic and API calls
 */
export const useReadMessages = () => {
  const dispatch = useDispatch();
  const { sendMessage } = useWebSocket();
  const { activeConversation, messages } = useSelector((state) => state.chat);
  const currentUser = useSelector((state) => state.auth.user);
  const pendingReads = useRef(new Set());
  const batchTimeout = useRef(null);

  // Clear the batch timeout on unmount
  useEffect(() => {
    return () => {
      if (batchTimeout.current) {
        clearTimeout(batchTimeout.current);
      }
    };
  }, []);

  // Process all pending message reads
  const processBatchReads = useCallback(() => {
    if (pendingReads.current.size === 0) return;
    
    const messageIds = Array.from(pendingReads.current);
    console.log(`Processing batch read for ${messageIds.length} messages`);
    
    // Dispatch to update local state immediately
    dispatch(batchMarkMessagesAsRead(messageIds));
    
    // Send to server via websocket
    if (messageIds.length === 1) {
      // Single message
      sendMessage({
        type: 'read_status',
        payload: { messageId: messageIds[0] }
      });
    } else {
      // Multiple messages
      sendMessage({
        type: 'batch_read_status',
        payload: { messageIds }
      });
    }
    
    // Clear the set after processing
    pendingReads.current.clear();
  }, [dispatch, sendMessage]);

  // Schedule batch processing
  const scheduleBatchProcess = useCallback(() => {
    if (batchTimeout.current) {
      clearTimeout(batchTimeout.current);
    }
    
    // Process batch after a short delay to collect multiple read events
    batchTimeout.current = setTimeout(() => {
      processBatchReads();
      batchTimeout.current = null;
    }, 500);
  }, [processBatchReads]);

  // Add a message to be marked as read
  const markAsRead = useCallback((messageId) => {
    // Skip if message is already pending
    if (pendingReads.current.has(messageId)) return;
    
    pendingReads.current.add(messageId);
    scheduleBatchProcess();
  }, [scheduleBatchProcess]);

  // Mark all unread messages in the active conversation as read
  const markAllAsRead = useCallback((conversationId) => {
    const convId = conversationId || (activeConversation?.id);
    if (!convId || !currentUser) return;

    const conversationMessages = messages[convId] || [];
    
    // Find messages that aren't from the current user and aren't read yet
    const unreadMessages = conversationMessages.filter(
      msg => msg.senderId !== currentUser.id && msg.status !== 'read'
    );
    
    // Add all to pending reads
    let needsProcessing = false;
    unreadMessages.forEach(msg => {
      if (!pendingReads.current.has(msg.id)) {
        pendingReads.current.add(msg.id);
        needsProcessing = true;
      }
    });
    
    // Process immediately if there are new messages to mark
    if (needsProcessing && pendingReads.current.size > 0) {
      scheduleBatchProcess();
    }
  }, [activeConversation, currentUser, messages, scheduleBatchProcess]);

  // Auto-mark messages as read when the active conversation changes
  useEffect(() => {
    if (activeConversation) {
      // Small delay to ensure we've loaded the messages
      setTimeout(() => markAllAsRead(activeConversation.id), 500);
    }
    
    // Clean up old read operations when conversation changes
    return () => {
      if (batchTimeout.current) {
        clearTimeout(batchTimeout.current);
        
        // Process any pending reads before unmounting
        if (pendingReads.current.size > 0) {
          processBatchReads();
        }
      }
    };
  }, [activeConversation?.id, markAllAsRead, processBatchReads]);

  return { markAsRead, markAllAsRead };
}; 