import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useChats, useCreateChat, useDeleteChat } from '../hooks/useApi';
import { ChatListPageSkeleton } from '../components/SkeletonLoader';
import { LoadingSpinner } from '../components/LoadingSpinner';
import type { Chat } from 'shared/src/types';

export const ChatListPage: React.FC = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [deletingChatId, setDeletingChatId] = useState<string | null>(null);
  
  const { data: chatsData, isLoading, error } = useChats();
  const createChatMutation = useCreateChat();
  const deleteChatMutation = useDeleteChat();

  const chats = chatsData?.chats || [];

  const handleCreateChat = async () => {
    try {
      const result = await createChatMutation.mutateAsync({
        title: 'New Chat',
        model: 'gemma3n:latest'
      });
      navigate(`/chat/${result.chat._id}`);
    } catch (error) {
      console.error('Error creating chat:', error);
    }
  };

  const handleDeleteChat = async (chatId: string) => {
    if (window.confirm('Are you sure you want to delete this chat?')) {
      setDeletingChatId(chatId);
      try {
        await deleteChatMutation.mutateAsync(chatId);
      } catch (error) {
        console.error('Error deleting chat:', error);
      } finally {
        setDeletingChatId(null);
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

  if (isLoading) {
    return <ChatListPageSkeleton />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center">
        <div className="bg-white/95 backdrop-blur-lg rounded-xl p-8 shadow-2xl">
          <div className="text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Error Loading Chats</h2>
            <p className="text-gray-600 mb-4">Failed to load your chat history</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-[20px]">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white/95 backdrop-blur-lg rounded-xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="px-6 py-5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-semibold">🤖 AI Chat з Gemma3n</h1>
              <button
                onClick={handleCreateChat}
                disabled={createChatMutation.isPending}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {createChatMutation.isPending ? (
                  <>
                    <LoadingSpinner size="sm" color="white" />
                    Creating...
                  </>
                ) : (
                  'New Chat'
                )}
              </button>
            </div>
          </div>

          {/* Chat List */}
          <div className="p-6">
            {chats.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">💬</div>
                <h2 className="text-xl font-semibold text-gray-800 mb-2">No chats yet</h2>
                <p className="text-gray-600 mb-6">Start your first conversation with AI</p>
                <button
                  onClick={handleCreateChat}
                  disabled={createChatMutation.isPending}
                  className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  {createChatMutation.isPending ? (
                    <>
                      <LoadingSpinner size="sm" color="white" />
                      Creating...
                    </>
                  ) : (
                    'Start New Chat'
                  )}
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {chats.map((chat) => (
                  <div
                    key={chat._id}
                    className={`group relative p-4 border border-gray-200 rounded-lg hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer ${
                      deletingChatId === chat._id ? 'opacity-50 pointer-events-none' : ''
                    }`}
                    onClick={() => navigate(`/chat/${chat._id}`)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-medium text-gray-900 truncate">
                          {chat.title}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          {formatDate(chat.updated_at)}
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteChat(chat._id);
                        }}
                        disabled={deleteChatMutation.isPending || deletingChatId === chat._id}
                        className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-red-500 transition-all disabled:opacity-50"
                      >
                        {deletingChatId === chat._id ? (
                          <LoadingSpinner size="sm" color="gray" />
                        ) : (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}; 