import React, { useRef, useCallback } from 'react';
import { LoadingSpinner } from './LoadingSpinner';

interface FileUploaderProps {
  onFileUpload: (file: File) => void;
  onFileProcess?: (fileId: string) => void;
  disabled?: boolean;
  className?: string;
}

export const FileUploader: React.FC<FileUploaderProps> = ({
  onFileUpload,
  onFileProcess,
  disabled = false,
  className = ''
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback(async (file: File) => {
    if (!file || disabled) return;

    // Check if file is PDF
    if (file.type !== 'application/pdf') {
      alert('Only PDF files are supported');
      return;
    }

    // Check file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB');
      return;
    }

    try {
      onFileUpload(file);
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Failed to upload file');
    }
  }, [onFileUpload, disabled]);

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
        accept=".pdf"
        onChange={handleFileInputChange}
        className="hidden"
        disabled={disabled}
      />
      
      <button
        onClick={handleClick}
        disabled={disabled}
        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center space-x-2"
      >
        <span>📄</span>
        <span>Upload PDF</span>
      </button>
    </div>
  );
}; 