import React, { useState, useRef, useEffect } from 'react';

const AudioRecorder = ({ onRecordingComplete, onCancel }) => {
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioChunks, setAudioChunks] = useState([]);
  const [audioRecorder, setAudioRecorder] = useState(null);
  const timerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (audioRecorder) {
        audioRecorder.stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [audioRecorder]);

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
      setRecordingTime(0);
      
      timerRef.current = setInterval(() => {
        setRecordingTime((prevTime) => prevTime + 1);
      }, 1000);
    } catch (error) {
      console.error('Error starting audio recording:', error);
      alert('Không thể truy cập microphone. Hãy kiểm tra quyền truy cập và thử lại.');
    }
  };

  const stopRecording = () => {
    if (audioRecorder) {
      audioRecorder.stop();
      audioRecorder.stream.getTracks().forEach(track => track.stop());
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      
      setTimeout(() => {
        if (audioChunks.length > 0) {
          const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
          const audioFile = new File([audioBlob], `audio_message_${Date.now()}.webm`, { 
            type: 'audio/webm' 
          });
          
          onRecordingComplete({
            file: audioFile,
            preview: URL.createObjectURL(audioBlob),
            type: 'audio',
            name: 'Tin nhắn thoại'
          });
        }
        
        setAudioRecorder(null);
      }, 500);
    }
  };

  const cancelRecording = () => {
    if (audioRecorder) {
      audioRecorder.stop();
      audioRecorder.stream.getTracks().forEach(track => track.stop());
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      
      setAudioRecorder(null);
      setAudioChunks([]);
      onCancel();
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center space-x-2">
      <button
        onClick={startRecording}
        disabled={!!audioRecorder}
        className="p-2 text-red-500 hover:bg-red-50 rounded-full"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
        </svg>
      </button>
      
      {audioRecorder && (
        <>
          <span className="text-sm text-gray-500">{formatTime(recordingTime)}</span>
          <button
            onClick={stopRecording}
            className="p-2 text-green-500 hover:bg-green-50 rounded-full"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </button>
          <button
            onClick={cancelRecording}
            className="p-2 text-gray-500 hover:bg-gray-50 rounded-full"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </>
      )}
    </div>
  );
};

export default AudioRecorder; 