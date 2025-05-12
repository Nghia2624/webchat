import React, { useRef, useEffect } from 'react';

// Basic emoji array for temporary use
const basicEmojis = ['😀', '😊', '🙂', '😍', '😎', '🤔', '👍', '❤️', '👋', '🎉'];

const EmojiPicker = ({ onSelect, onClose }) => {
  const pickerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        onClose();
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  return (
    <div
      ref={pickerRef}
      className="absolute bottom-full mb-2 bg-white rounded-lg shadow-lg p-2 border border-gray-200"
    >
      <div className="grid grid-cols-5 gap-2">
        {basicEmojis.map((emoji, index) => (
          <button
            key={index}
            onClick={() => onSelect(emoji)}
            className="p-2 hover:bg-gray-100 rounded-lg text-xl"
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
};

export default EmojiPicker; 