import React, { useState, useRef, useCallback } from 'react';
import { LoadingSpinner } from './LoadingSpinner';

interface RagQueryButtonProps {
  onQuerySubmit: (query: string) => void;
  disabled?: boolean;
  className?: string;
}

export const RagQueryButton: React.FC<RagQueryButtonProps> = ({
  onQuerySubmit,
  disabled = false,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleSubmit = useCallback(async () => {
    if (!query.trim() || isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      await onQuerySubmit(query.trim());
      setQuery('');
      setIsOpen(false);
    } catch (error) {
      console.error('Error submitting RAG query:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [query, onQuerySubmit, isSubmitting]);

  const togglePanel = useCallback(() => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  }, [isOpen, disabled]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }, [handleSubmit]);

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
      {/* RAG Query Button */}
      <button
        onClick={togglePanel}
        disabled={disabled}
        className={`
          p-2 rounded-lg transition-all duration-200 ease-in-out transform hover:scale-105
          ${isOpen 
            ? 'bg-green-600 text-white shadow-lg scale-105' 
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
        title="Ask questions about uploaded documents"
      >
        {isSubmitting ? (
          <LoadingSpinner size="sm" color="white" />
        ) : (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )}
      </button>

      {/* Collapsible Query Panel */}
      <div
        className={`
          absolute bottom-full left-0 mb-2 bg-white border border-gray-200 rounded-lg shadow-lg
          transition-all duration-200 ease-in-out transform origin-bottom-left
          ${isOpen 
            ? 'opacity-100 scale-100 translate-y-0' 
            : 'opacity-0 scale-95 translate-y-2 pointer-events-none'
          }
        `}
        style={{ minWidth: '320px' }}
      >
        {/* Arrow pointing down */}
        <div className="absolute top-full left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-200"></div>
        <div className="absolute top-full left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-white" style={{ marginTop: '-1px' }}></div>

        {/* Query Content */}
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-900">🔍 Document Query</h3>
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
            Ask questions about your uploaded PDF documents using AI-powered search.
          </div>

          <div className="space-y-3">
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="What would you like to know about your documents?"
              disabled={isSubmitting}
              className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed"
              rows={3}
            />

            <button
              onClick={handleSubmit}
              disabled={!query.trim() || isSubmitting}
              className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <LoadingSpinner size="sm" color="white" />
                  <span>Searching...</span>
                </>
              ) : (
                <>
                  <span>🔍</span>
                  <span>Search Documents</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}; 