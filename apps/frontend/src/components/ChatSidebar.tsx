import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useChats, useDeleteChat } from '../hooks/useApi';
import { LoadingSpinner } from './LoadingSpinner';
import type { Chat } from 'shared/src/types';

interface ChatSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  currentChatId?: string;
  onChatSelect: (chat: Chat) => void;
}

export const ChatSidebar: React.FC<ChatSidebarProps> = ({
  isOpen,
  onClose,
  currentChatId,
  onChatSelect
}) => {
  const navigate = useNavigate();
  const { data: chatsData, isLoading } = useChats();
  const deleteChatMutation = useDeleteChat();

  const chats = chatsData?.chats || [];

  const handleDeleteChat = async (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this chat?')) {
      try {
        await deleteChatMutation.mutateAsync(chatId);
        if (currentChatId === chatId) {
          navigate('/');
        }
      } catch (error) {
        console.error('Error deleting chat:', error);
      }
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 168) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 h-full w-80 bg-white border-r border-gray-200 z-50 transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 h-[81px]">
          <h2 className="text-lg font-semibold text-gray-900">Chats</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="p-4">
              <div className="flex items-center justify-center">
                <LoadingSpinner size="md" color="indigo" />
              </div>
            </div>
          ) : chats.length === 0 ? (
            <div className="p-4 text-center">
              <p className="text-gray-500 text-sm">No chats yet</p>
            </div>
          ) : (
            <div className="p-2">
              {chats.map((chat) => (
                <div
                  key={chat._id}
                  className={`
                    group relative p-3 rounded-lg cursor-pointer transition-colors mb-1
                    ${currentChatId === chat._id
                      ? 'bg-indigo-50 border border-indigo-200'
                      : 'hover:bg-gray-50'
                    }
                  `}
                  onClick={() => onChatSelect(chat)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-gray-900 truncate">
                        {chat.title}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatDate(chat.updated_at)}
                      </p>
                    </div>
                    <button
                      onClick={(e) => handleDeleteChat(chat._id, e)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 transition-all"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={() => navigate('/')}
            className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            New Chat
          </button>
        </div>
      </div>
    </>
  );
}; 