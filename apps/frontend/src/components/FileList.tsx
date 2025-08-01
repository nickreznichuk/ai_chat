import React from 'react';
import { LoadingSpinner } from './LoadingSpinner';

interface FileItem {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  created_at: string;
  hasChunks?: boolean;
}

interface FileListProps {
  files: FileItem[];
  onProcessFile?: (fileId: string) => void;
  onDeleteFile?: (fileId: string) => void;
  onSearchInFile?: (fileId: string, query: string) => void;
  processingFileId?: string;
  deletingFileId?: string;
  className?: string;
}

export const FileList: React.FC<FileListProps> = ({
  files,
  onProcessFile,
  onDeleteFile,
  onSearchInFile,
  processingFileId,
  deletingFileId,
  className = ''
}) => {
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleSearch = (fileId: string) => {
    const query = prompt('Enter your question about this document:');
    if (query && onSearchInFile) {
      onSearchInFile(fileId, query);
    }
  };

  if (files.length === 0) {
    return (
      <div className={`text-center py-8 text-gray-500 ${className}`}>
        <div className="text-4xl mb-2">📁</div>
        <p>No files uploaded yet</p>
        <p className="text-sm">Upload a PDF to start asking questions about it</p>
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {files.map((file) => (
        <div
          key={file.id}
          className={`
            bg-white border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors
            ${processingFileId === file.id || deletingFileId === file.id ? 'opacity-50' : ''}
          `}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <div className="text-2xl">📄</div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-gray-900 truncate">
                    {file.originalName}
                  </h3>
                  <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                    <span>{formatFileSize(file.size)}</span>
                    <span>{formatDate(file.created_at)}</span>
                    {file.hasChunks && (
                      <span className="text-green-600 font-medium">✓ Processed</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 ml-4">
              {!file.hasChunks && onProcessFile && (
                <button
                  onClick={() => onProcessFile(file.id)}
                  disabled={processingFileId === file.id || deletingFileId === file.id}
                  className="px-3 py-1 text-xs bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center space-x-1"
                >
                  {processingFileId === file.id ? (
                    <>
                      <LoadingSpinner size="xs" color="white" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <span>Process</span>
                  )}
                </button>
              )}
              
              {file.hasChunks && onSearchInFile && (
                <button
                  onClick={() => handleSearch(file.id)}
                  disabled={processingFileId === file.id || deletingFileId === file.id}
                  className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  Ask Question
                </button>
              )}
              
              {onDeleteFile && (
                <button
                  onClick={() => {
                    console.log('Delete button clicked for file:', file.id);
                    onDeleteFile(file.id);
                  }}
                  disabled={processingFileId === file.id || deletingFileId === file.id}
                  className="p-1 text-gray-400 hover:text-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {deletingFileId === file.id ? (
                    <LoadingSpinner size="xs" color="red" />
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}; 