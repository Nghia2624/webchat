import React, { useRef } from 'react';
import { MAX_FILE_SIZE, ALLOWED_FILE_TYPES } from '../../config';

const FileUploader = ({ onFileSelect, onCancel }) => {
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (file.size > MAX_FILE_SIZE) {
      alert(`File quá lớn. Vui lòng chọn file dưới ${MAX_FILE_SIZE / 1024 / 1024}MB.`);
      return;
    }
    
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      alert('Loại file không được hỗ trợ. Vui lòng chọn file khác.');
      return;
    }
    
    onFileSelect({
      file,
      type: file.type,
      name: file.name,
      size: file.size,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null
    });
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileChange}
        className="hidden"
        accept={ALLOWED_FILE_TYPES.join(',')}
      />
      <button
        onClick={handleClick}
        className="p-2 text-gray-500 hover:bg-gray-50 rounded-full"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
        </svg>
      </button>
    </>
  );
};

export default FileUploader; 