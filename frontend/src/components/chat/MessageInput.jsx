import React, { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { sendMessage, setTyping } from '../../store/slices/chatSlice';
// Temporarily removed import for emoji-mart
// import data from '@emoji-mart/data';
// import Picker from '@emoji-mart/react';
import Spinner from '../common/Spinner';
import { SendIcon, AttachmentIcon, EmojiIcon } from './ChatIcons';

// Basic emoji array for temporary use
const basicEmojis = ['😀', '😊', '🙂', '😍', '😎', '🤔', '👍', '❤️', '👋', '🎉'];

const MessageInput = ({ 
  onSendMessage, 
  conversationId, 
  placeholder = "Nhập tin nhắn...",
  replyingTo = null,
  onCancelReply = () => {},
  disabled = false
}) => {
  const dispatch = useDispatch();
  const [message, setMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [attachment, setAttachment] = useState(null);
  const [recordingAudio, setRecordingAudio] = useState(false);
  const [audioRecorder, setAudioRecorder] = useState(null);
  const [audioChunks, setAudioChunks] = useState([]);
  const [recordingTime, setRecordingTime] = useState(0);
  
  const timerRef = useRef(null);
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);
  const emojiPickerRef = useRef(null);
  
  const sending = useSelector((state) => state.chat.sendingMessages[conversationId]);
  const connectionStatus = useSelector((state) => state.chat.connectionStatus);
  
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [conversationId, replyingTo]);

  // Tự động mở rộng textarea khi nhập nhiều dòng
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = '40px';
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${Math.min(scrollHeight, 120)}px`;
    }
  }, [message]);
  
  // Close emoji picker when clicking outside
  useEffect(() => {
    if (!showEmojiPicker) return;
    
    const handleClickOutside = (event) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
        setShowEmojiPicker(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showEmojiPicker]);
  
  // Cleanup timer when component unmounts
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);
  
  // Start recording audio
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks = [];
      
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
          setAudioChunks([...chunks]);
        }
      };
      
      recorder.start(1000);
      setAudioRecorder(recorder);
      setRecordingAudio(true);
      setRecordingTime(0);
      
      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime((prevTime) => prevTime + 1);
      }, 1000);
    } catch (error) {
      console.error('Error starting audio recording:', error);
      alert('Không thể truy cập microphone. Hãy kiểm tra quyền truy cập và thử lại.');
    }
  };
  
  // Stop recording audio
  const stopRecording = () => {
    if (audioRecorder) {
      audioRecorder.stop();
      audioRecorder.stream.getTracks().forEach(track => track.stop());
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      
      // Convert audio chunks to file
      setTimeout(() => {
        if (audioChunks.length > 0) {
          const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
          const audioFile = new File([audioBlob], `audio_message_${Date.now()}.webm`, { 
            type: 'audio/webm' 
          });
          
          setAttachment({
            file: audioFile,
            preview: URL.createObjectURL(audioBlob),
            type: 'audio',
            name: 'Tin nhắn thoại'
          });
        }
        
        setAudioRecorder(null);
        setRecordingAudio(false);
      }, 500);
    }
  };
  
  // Cancel recording audio
  const cancelRecording = () => {
    if (audioRecorder) {
      audioRecorder.stop();
      audioRecorder.stream.getTracks().forEach(track => track.stop());
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      
      setAudioRecorder(null);
      setRecordingAudio(false);
      setAudioChunks([]);
    }
  };
  
  // Format recording time
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSendMessage = () => {
    if ((!message.trim() && !attachment) || disabled) return;
    
    onSendMessage({
      content: message.trim(),
      attachment: attachment,
      replyTo: replyingTo ? replyingTo.id : null
    });
    
    setMessage('');
    setAttachment(null);
    if (replyingTo) {
      onCancelReply();
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Chỉ cho phép file dưới 10MB
    if (file.size > 10 * 1024 * 1024) {
      alert('File quá lớn. Vui lòng chọn file dưới 10MB.');
      return;
    }
    
    setAttachment({
      file,
      type: file.type,
      name: file.name,
      size: file.size,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null
    });
  };

  const removeAttachment = () => {
    if (attachment?.preview) {
      URL.revokeObjectURL(attachment.preview);
    }
    setAttachment(null);
  };

  const handleEmojiSelect = (emoji) => {
    setMessage(prev => prev + emoji.native);
    setShowEmojiPicker(false);
  };

  // Check if send button should be disabled
  const isSendDisabled = 
    (message.trim() === '' && !attachment) || 
    sending || 
    isUploading || 
    connectionStatus !== 'connected';
  
  return (
    <div className="bg-white dark:bg-gray-800 border-t dark:border-gray-700 p-3">
      {/* Reply Preview */}
      {replyingTo && (
        <div className="flex items-start mb-2 bg-gray-50 dark:bg-gray-700 p-2 rounded-lg">
          <div className="flex-1">
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Trả lời {replyingTo.sender.name}
            </div>
            <div className="text-sm truncate">
              {replyingTo.content}
            </div>
          </div>
          <button 
            onClick={onCancelReply}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            ✕
          </button>
        </div>
      )}
      
      {/* Attachment Preview */}
      {attachment && (
        <div className="mb-2 flex items-center bg-gray-50 dark:bg-gray-700 p-2 rounded-lg">
          {attachment.preview ? (
            <img src={attachment.preview} alt="Preview" className="h-16 w-16 object-cover rounded" />
          ) : (
            <div className="text-2xl mr-2">📎</div>
          )}
          <div className="flex-1 mx-2 overflow-hidden">
            <div className="truncate font-medium">{attachment.name}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {(attachment.size / 1024).toFixed(2)} KB
            </div>
          </div>
          <button 
            onClick={removeAttachment}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            ✕
          </button>
        </div>
      )}
      
      {/* Input Area */}
      <div className="flex items-end space-x-2">
        <div className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-full flex items-end overflow-hidden pr-2">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={e => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent border-none outline-none py-2 px-4 text-gray-700 dark:text-white resize-none min-h-[40px]"
            placeholder={placeholder}
            disabled={disabled}
            rows={1}
          />
          
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-gray-500 hover:text-primary dark:text-gray-400 dark:hover:text-primary transition-colors"
            disabled={disabled}
            title="Đính kèm file"
          >
            <AttachmentIcon className="w-5 h-5" />
          </button>
          
          <button
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="p-2 text-gray-500 hover:text-primary dark:text-gray-400 dark:hover:text-primary transition-colors"
            disabled={disabled}
            title="Chọn emoji"
          >
            <EmojiIcon className="w-5 h-5" />
          </button>
          
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept="image/*,application/pdf,text/plain,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          />
        </div>
        
        <button
          onClick={handleSendMessage}
          disabled={(!message.trim() && !attachment) || disabled}
          className={`rounded-full p-2.5 ${
            (!message.trim() && !attachment) || disabled
              ? 'bg-gray-300 text-gray-500 dark:bg-gray-700 dark:text-gray-400 cursor-not-allowed'
              : 'bg-primary text-white shadow-sm hover:bg-primary-dark transition-colors'
          }`}
          title="Gửi tin nhắn"
        >
          <SendIcon className="w-5 h-5" />
        </button>
      </div>
      
      {/* Emoji Picker (placeholder) */}
      {showEmojiPicker && (
        <div className="absolute bottom-16 right-4 bg-white dark:bg-gray-800 shadow-lg rounded-lg p-3 border dark:border-gray-700">
          <div className="grid grid-cols-8 gap-2">
            {['😀', '😂', '😍', '🥰', '😘', '🤔', '😎', '😢', 
              '😡', '👍', '👎', '❤️', '🔥', '🎉', '👋', '🙏'].map(emoji => (
              <button 
                key={emoji}
                className="text-xl hover:bg-gray-100 dark:hover:bg-gray-700 p-1 rounded"
                onClick={() => handleEmojiSelect({ native: emoji })}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MessageInput;