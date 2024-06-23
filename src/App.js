// src/App.js
import React, { useState, useEffect, useRef } from 'react';

const App = () => {
  const [recording, setRecording] = useState(false);
  const [audioChunks, setAudioChunks] = useState([]);
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);

  const startRecording = async () => {
    setRecording(true);
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    streamRef.current = stream;
    const mediaRecorder = new MediaRecorder(stream);
    mediaRecorderRef.current = mediaRecorder;
    mediaRecorder.start();

    mediaRecorder.ondataavailable = (event) => {
      setAudioChunks((prev) => [...prev, event.data]);
    };

    mediaRecorder.onstop = async () => {
      const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
      const formData = new FormData();
      formData.append('file', audioBlob);

      await fetch('http://localhost:8000/upload-audio', {
        method: 'POST',
        body: formData,
      });

      // Reset audioChunks after upload
      setAudioChunks([]);
    };
  };

  const stopRecording = () => {
    setRecording(false);
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
  };

  useEffect(() => {
    // Cleanup on component unmount
    return () => {
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <div>
      <button onClick={recording ? stopRecording : startRecording}>
        {recording ? 'Stop' : 'Start'} Recording
      </button>
    </div>
  );
};

export default App;
