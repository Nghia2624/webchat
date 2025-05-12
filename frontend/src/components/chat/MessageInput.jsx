import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { sendMessage } from '../../store/slices/chatSlice';
import { useWebSocket } from '../../contexts/WebSocketContext';
import AudioRecorder from './AudioRecorder';
import EmojiPicker from './EmojiPicker';
import FileUploader from './FileUploader';
import { SendIcon, EmojiIcon, AttachmentIcon } from '../icons';

const MessageInput = React.memo(({ chatId, onTyping }) => {
  const dispatch = useDispatch();
  const { sendMessage: sendWebSocketMessage } = useWebSocket();
  const currentUser = useSelector(state => state.auth.user);
  
  const [message, setMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [attachment, setAttachment] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  
  const typingTimeoutRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  const handleTyping = useCallback(() => {
    if (!isTyping) {
      setIsTyping(true);
      onTyping(true);
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      onTyping(false);
    }, 1000);
  }, [isTyping, onTyping]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (!message.trim() && !attachment) return;

    const messageData = {
      chatId,
      content: message.trim(),
      type: attachment ? 'file' : 'text',
      file: attachment
    };

    try {
      setIsUploading(true);
      await dispatch(sendMessage(messageData)).unwrap();
      sendWebSocketMessage({
        type: 'message',
        data: {
          ...messageData,
          sender: currentUser.id,
          timestamp: new Date().toISOString()
        }
      });
      setMessage('');
      setAttachment(null);
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsUploading(false);
    }
  }, [chatId, message, attachment, dispatch, sendWebSocketMessage, currentUser.id]);

  const handleEmojiSelect = useCallback((emoji) => {
    setMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
    inputRef.current?.focus();
  }, []);

  const handleFileSelect = useCallback((file) => {
    setAttachment(file);
  }, []);

  const handleCancelFile = useCallback(() => {
    setAttachment(null);
  }, []);

  return (
    <form onSubmit={handleSubmit} className="border-t p-4">
      {attachment && (
        <div className="mb-2 p-2 bg-gray-50 rounded-lg flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {attachment.preview ? (
              <img src={attachment.preview} alt="Preview" className="w-10 h-10 object-cover rounded" />
            ) : (
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            )}
            <span className="text-sm text-gray-600 truncate max-w-xs">{attachment.name}</span>
          </div>
          <button
            type="button"
            onClick={handleCancelFile}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
      
      <div className="flex items-center space-x-2">
        <button
          type="button"
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          className="p-2 text-gray-500 hover:bg-gray-50 rounded-full"
        >
          <EmojiIcon className="w-5 h-5" />
        </button>

        <FileUploader onFileSelect={handleFileSelect} onCancel={handleCancelFile} />

        <input
          ref={inputRef}
          type="text"
          value={message}
          onChange={(e) => {
            setMessage(e.target.value);
            handleTyping();
          }}
          placeholder="Nhập tin nhắn..."
          className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <button
          type="submit"
          disabled={(!message.trim() && !attachment) || isUploading}
          className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
        >
          <SendIcon className="w-5 h-5" />
        </button>
      </div>

      {showEmojiPicker && (
        <div className="absolute bottom-20 left-4">
          <EmojiPicker onSelect={handleEmojiSelect} onClose={() => setShowEmojiPicker(false)} />
        </div>
      )}
    </form>
  );
});

MessageInput.displayName = 'MessageInput';

export default MessageInput;