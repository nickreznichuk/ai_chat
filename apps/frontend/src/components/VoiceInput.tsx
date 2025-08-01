import React, { useState, useRef, useCallback, useEffect } from 'react';
import { LoadingSpinner } from './LoadingSpinner';
import { voiceApi } from '../services/api';
import type { VoiceInputStatus } from 'shared/src/types';

interface VoiceInputProps {
  onTranscription: (text: string) => void;
  onAutoSend?: (text: string) => void;
  disabled?: boolean;
  className?: string;
}

export const VoiceInput: React.FC<VoiceInputProps> = ({
  onTranscription,
  onAutoSend,
  disabled = false,
  className = ''
}) => {
  const [status, setStatus] = useState<VoiceInputStatus>({
    isRecording: false,
    isProcessing: false
  });
  const [recordingDuration, setRecordingDuration] = useState(0);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const recordingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const startRecording = useCallback(async () => {
    try {
      setStatus({ isRecording: true, isProcessing: false });
      setRecordingDuration(0);
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      
      streamRef.current = stream;
      audioChunksRef.current = [];
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = async () => {
        setStatus({ isRecording: false, isProcessing: true });
        
        try {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          const base64Audio = await blobToBase64(audioBlob);
          
          const result = await voiceApi.transcribe({
            audioData: base64Audio,
            format: 'webm',
            language: 'en'
          });
          
          if (result.text && result.text.trim()) {
            const transcribedText = result.text.trim();
            onTranscription(transcribedText);
            
            // Auto-send the message if onAutoSend is provided
            if (onAutoSend) {
              onAutoSend(transcribedText);
            }
          }
          
          setStatus({ isRecording: false, isProcessing: false });
        } catch (error) {
          console.error('Error transcribing audio:', error);
          setStatus({ 
            isRecording: false, 
            isProcessing: false, 
            error: 'Failed to transcribe audio' 
          });
        }
      };
      
      mediaRecorder.start();
      
      // Auto-stop recording after 30 seconds to prevent large files
      recordingTimeoutRef.current = setTimeout(() => {
        if (status.isRecording) {
          stopRecording();
        }
      }, 30000);
      
      // Update recording duration every second
      const durationInterval = setInterval(() => {
        setRecordingDuration(prev => {
          if (prev >= 30) {
            clearInterval(durationInterval);
            return 30;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (error) {
      console.error('Error starting recording:', error);
      setStatus({ 
        isRecording: false, 
        isProcessing: false, 
        error: 'Failed to access microphone' 
      });
    }
  }, [onTranscription]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && status.isRecording) {
      mediaRecorderRef.current.stop();
      
      // Clear the timeout
      if (recordingTimeoutRef.current) {
        clearTimeout(recordingTimeoutRef.current);
        recordingTimeoutRef.current = null;
      }
      
      // Stop all tracks in the stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    }
  }, [status.isRecording]);

  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // Remove the data URL prefix to get just the base64 string
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const handleClick = () => {
    if (status.isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const isDisabled = disabled || status.isProcessing;

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (recordingTimeoutRef.current) {
        clearTimeout(recordingTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={handleClick}
        disabled={isDisabled}
        className={`
          w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200
          ${status.isRecording 
            ? 'bg-red-500 hover:bg-red-600 text-white shadow-lg scale-110' 
            : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-md hover:shadow-lg hover:-translate-y-0.5'
          }
          ${isDisabled ? 'opacity-50 cursor-not-allowed transform-none shadow-none' : ''}
        `}
        title={status.isRecording ? 'Stop recording' : 'Start voice input'}
      >
        {status.isProcessing ? (
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-white rounded-full voice-bounce" />
            <div className="w-3 h-3 bg-white rounded-full voice-bounce" style={{ animationDelay: '0.1s' }} />
            <div className="w-3 h-3 bg-white rounded-full voice-bounce" style={{ animationDelay: '0.2s' }} />
          </div>
        ) : status.isRecording ? (
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 bg-white rounded-full voice-pulse" />
            <span className="text-xs font-medium">{recordingDuration}s</span>
          </div>
        ) : (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
        )}
      </button>
      
      {/* Recording indicator */}
      {status.isRecording && (
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-ping" />
      )}
      
      {/* Processing indicator */}
      {status.isProcessing && (
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full animate-pulse" />
      )}
      
      {/* Error message */}
      {status.error && (
        <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-red-500 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
          {status.error}
        </div>
      )}
      
      {/* Processing tooltip */}
      {status.isProcessing && (
        <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
          Transcribing...
        </div>
      )}
    </div>
  );
};

export default VoiceInput; 