import React, { useRef, useCallback } from 'react';
import { LoadingSpinner } from './LoadingSpinner';

interface FileUploaderProps {
  onFileUpload: (file: File) => void;
  onFileProcess?: (fileId: string) => void;
  disabled?: boolean;
  className?: string;
  acceptTypes?: string[];
  maxSize?: number; // in bytes
}

export const FileUploader: React.FC<FileUploaderProps> = ({
  onFileUpload,
  onFileProcess,
  disabled = false,
  className = '',
  acceptTypes = ['.pdf'],
  maxSize = 10 * 1024 * 1024
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback(async (file: File) => {
    if (!file || disabled) return;

    // Check if file type is supported
    const isSupported = acceptTypes.some(type => {
      if (type === 'image/*') {
        return file.type.startsWith('image/');
      }
      return file.type === type;
    });

    if (!isSupported) {
      alert('Only PDF files and images are supported');
      return;
    }

    // Check file size
    const maxSizeMB = maxSize / (1024 * 1024);
    if (file.size > maxSize) {
      alert(`File size must be less than ${maxSizeMB}MB`);
      return;
    }

    try {
      onFileUpload(file);
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Failed to upload file');
    }
  }, [onFileUpload, disabled, acceptTypes, maxSize]);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  const handleClick = useCallback(() => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  }, [disabled]);

  return (
    <div className={className}>
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptTypes.join(',')}
        onChange={handleFileInputChange}
        className="hidden"
        disabled={disabled}
      />
      
                        <button
                    onClick={handleClick}
                    disabled={disabled}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    <span>📁</span>
                    <span>Upload File</span>
                  </button>
    </div>
  );
}; 