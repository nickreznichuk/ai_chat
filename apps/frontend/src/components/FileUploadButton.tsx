import React, { useState, useRef, useCallback } from 'react';
import { FileUploader } from './FileUploader';
import { LoadingSpinner } from './LoadingSpinner';

interface FileUploadButtonProps {
  onFileUpload: (file: File) => void;
  disabled?: boolean;
  className?: string;
}

export const FileUploadButton: React.FC<FileUploadButtonProps> = ({
  onFileUpload,
  disabled = false,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleFileUpload = useCallback(async (file: File) => {
    setIsUploading(true);
    try {
      await onFileUpload(file);
      setIsOpen(false); // Close after successful upload
      setShowSuccess(true);
      // Hide success indicator after 2 seconds
      setTimeout(() => setShowSuccess(false), 2000);
    } catch (error) {
      console.error('Error uploading file:', error);
      // Keep panel open on error so user can try again
    } finally {
      setIsUploading(false);
    }
  }, [onFileUpload]);

  const toggleUpload = useCallback(() => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  }, [isOpen, disabled]);

  // Close when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Upload Button */}
      <button
        onClick={toggleUpload}
        disabled={disabled}
        className={`
          p-2 rounded-lg transition-all duration-200 ease-in-out transform hover:scale-105
          ${isOpen 
            ? 'bg-indigo-600 text-white shadow-lg scale-105' 
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
        title="Upload PDF file"
      >
        {isUploading ? (
          <LoadingSpinner size="sm" color="white" />
        ) : showSuccess ? (
          <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
        )}
      </button>

      {/* Collapsible Upload Panel */}
      <div
        className={`
          absolute bottom-full left-0 mb-2 bg-white border border-gray-200 rounded-lg shadow-lg
          transition-all duration-200 ease-in-out transform origin-bottom-left
          ${isOpen 
            ? 'opacity-100 scale-100 translate-y-0' 
            : 'opacity-0 scale-95 translate-y-2 pointer-events-none'
          }
        `}
        style={{ minWidth: '280px' }}
      >
        {/* Arrow pointing down */}
        <div className="absolute top-full left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-200"></div>
        <div className="absolute top-full left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-white" style={{ marginTop: '-1px' }}></div>

        {/* Upload Content */}
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-900">📄 Upload PDF</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="text-xs text-gray-600 mb-3">
            Upload a PDF document to ask questions about its content using AI-powered search.
          </div>

          <FileUploader
            onFileUpload={handleFileUpload}
            disabled={isUploading}
            className="w-full"
          />

          {isUploading && (
            <div className="mt-3 flex items-center space-x-2 text-sm text-gray-600">
              <LoadingSpinner size="sm" color="gray" />
              <span>Uploading...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 