import React from 'react';

// Skeleton loader for chat list items
export const ChatSkeleton: React.FC = () => (
  <div className="p-4 border border-gray-200 rounded-lg animate-pulse">
    <div className="flex items-start justify-between">
      <div className="flex-1 min-w-0">
        <div className="h-5 bg-gray-200 rounded mb-2 w-3/4 animate-pulse"></div>
        <div className="h-4 bg-gray-200 rounded w-1/3 animate-pulse"></div>
      </div>
      <div className="w-5 h-5 bg-gray-200 rounded animate-pulse"></div>
    </div>
  </div>
);

// Skeleton loader for chat list
export const ChatListSkeleton: React.FC = () => (
  <div className="space-y-3">
    {Array.from({ length: 5 }).map((_, index) => (
      <ChatSkeleton key={index} />
    ))}
  </div>
);

// Skeleton loader for message bubbles
export const MessageSkeleton: React.FC = () => (
  <div className="flex justify-start">
    <div className="max-w-[80%] px-4 py-3 rounded-2xl bg-gray-100 rounded-bl-md">
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
        <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
      </div>
    </div>
  </div>
);

// Skeleton loader for chat messages
export const ChatMessagesSkeleton: React.FC = () => (
  <div className="space-y-4">
    {Array.from({ length: 3 }).map((_, index) => (
      <MessageSkeleton key={index} />
    ))}
  </div>
);

// Skeleton loader for chat header
export const ChatHeaderSkeleton: React.FC = () => (
  <div className="px-6 py-5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white flex justify-between items-center border-b border-white/10 rounded-t-xl">
    <div className="flex items-center gap-4">
      <div className="w-10 h-10 bg-white/20 rounded-lg animate-pulse"></div>
      <div className="space-y-2">
        <div className="h-5 bg-white/20 rounded w-32"></div>
        <div className="h-4 bg-white/20 rounded w-24"></div>
      </div>
    </div>
    <div className="w-20 h-6 bg-white/20 rounded-full animate-pulse"></div>
  </div>
);

// Skeleton loader for full chat page
export const ChatPageSkeleton: React.FC = () => (
  <div className="min-h-screen max-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-[20px] box-border">
    <div className="h-full max-h-[calc(100vh-40px)] max-w-4xl mx-auto flex flex-col bg-white/95 backdrop-blur-lg shadow-2xl rounded-xl">
      <ChatHeaderSkeleton />
      <div className="flex-1 flex flex-col overflow-hidden rounded-b-xl h-full">
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <ChatMessagesSkeleton />
        </div>
        <div className="p-6 border-t border-gray-200 bg-white">
          <div className="flex gap-3 items-end">
            <div className="flex-1 h-16 bg-gray-200 rounded-xl animate-pulse"></div>
            <div className="w-12 h-12 bg-gray-200 rounded-xl animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Skeleton loader for chat list page
export const ChatListPageSkeleton: React.FC = () => (
  <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
    <div className="max-w-4xl mx-auto p-[20px]">
      <div className="bg-white/95 backdrop-blur-lg rounded-xl shadow-2xl overflow-hidden">
        {/* Header Skeleton */}
        <div className="px-6 py-5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
          <div className="flex items-center justify-between">
            <div className="h-8 bg-white/20 rounded w-48 animate-pulse"></div>
            <div className="w-24 h-10 bg-white/20 rounded-lg animate-pulse"></div>
          </div>
        </div>
        
        {/* Chat List Skeleton */}
        <div className="p-6">
          <ChatListSkeleton />
        </div>
      </div>
    </div>
  </div>
); 