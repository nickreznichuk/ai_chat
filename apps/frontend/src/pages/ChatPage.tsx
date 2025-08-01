import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useChat, useSendMessage, useStatus } from '../hooks/useApi';
import { ChatPageSkeleton } from '../components/SkeletonLoader';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { VoiceInput } from '../components/VoiceInput';
import type { Message } from 'shared/src/types';

export const ChatPage: React.FC = () => {
  const { chatId } = useParams<{ chatId: string }>();
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  
  const { data: chatData, isLoading, error } = useChat(chatId || null);
  const { data: statusData } = useStatus();
  const sendMessageMutation = useSendMessage();
  
  const [inputMessage, setInputMessage] = useState('');
  const [localMessages, setLocalMessages] = useState<Message[]>([]);

  const messages = chatData?.messages || [];
  const chat = chatData?.chat;
  const status = statusData;

  const handleScrollToBottom = () => {
    messagesContainerRef.current?.scrollTo({
      top: messagesContainerRef.current?.scrollHeight + 200,
      behavior: "smooth"
    });
  }

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    handleScrollToBottom();
  }, [localMessages]);

  // Update local messages when chat data changes
  useEffect(() => {
    if (chatData?.messages) {
      setLocalMessages(chatData.messages);
    }
  }, [chatData?.messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || sendMessageMutation.isPending || !chatId) return;

    const userMessage: Message = {
      role: 'user',
      content: inputMessage.trim()
    };

    const newMessages = [...localMessages, userMessage];
    setLocalMessages(newMessages);
    setInputMessage('');

    try {
      await sendMessageMutation.mutateAsync({
        messages: newMessages,
        model: 'gemma3n:latest',
        chatId
      });
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        role: 'assistant',
        content: 'Sorry, an error occurred while processing your request.'
      };
      setLocalMessages(prev => [...prev, errorMessage]);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleVoiceTranscription = (text: string) => {
    setInputMessage(text);
  };

  const handleVoiceAutoSend = async (text: string) => {
    if (!text.trim() || sendMessageMutation.isPending || !chatId) return;

    const userMessage: Message = {
      role: 'user',
      content: text.trim()
    };

    const newMessages = [...localMessages, userMessage];
    setLocalMessages(newMessages);
    setInputMessage(''); // Clear input since we're auto-sending

    try {
      await sendMessageMutation.mutateAsync({
        messages: newMessages,
        model: 'gemma3n:latest',
        chatId
      });
    } catch (error) {
      console.error('Error sending voice message:', error);
      const errorMessage: Message = {
        role: 'assistant',
        content: 'Sorry, an error occurred while processing your voice message.'
      };
      setLocalMessages(prev => [...prev, errorMessage]);
    }
  };

  if (isLoading) {
    return <ChatPageSkeleton />;
  }

  if (error || !chat) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center">
        <div className="bg-white/95 backdrop-blur-lg rounded-xl p-8 shadow-2xl">
          <div className="text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Chat Not Found</h2>
            <p className="text-gray-600 mb-4">The chat you're looking for doesn't exist</p>
            <button
              onClick={() => navigate('/')}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Back to Chats
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen max-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-[20px] box-border">
      <div className="h-full max-h-[calc(100vh-40px)] max-w-4xl mx-auto flex flex-col bg-white/95 backdrop-blur-lg shadow-2xl rounded-xl">
        {/* Header */}
        <header className="px-6 py-5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white flex justify-between items-center border-b border-white/10 rounded-t-xl">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/')}
              className="p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <div>
              <h1 className="text-xl font-semibold flex items-center gap-2">
                {chat.title}
                {sendMessageMutation.isPending && (
                  <LoadingSpinner size="sm" color="white" />
                )}
              </h1>
              <p className="text-sm text-white/80">Gemma3n AI Assistant</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {status ? (
              <span className={`px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm ${
                status.ollamaAvailable 
                  ? 'bg-green-500/20 text-green-100' 
                  : 'bg-red-500/20 text-red-100'
              }`}>
                {status.ollamaAvailable ? '🟢' : '🔴'} {status.model}
              </span>
            ) : (
              <span className="px-3 py-1 rounded-full text-sm font-medium bg-white/20 backdrop-blur-sm flex items-center gap-2">
                <LoadingSpinner size="sm" color="white" />
                Checking...
              </span>
            )}
          </div>
        </header>

        {/* Chat Container */}
        <div className="flex-1 flex flex-col overflow-hidden rounded-b-xl h-full">
          {/* Messages */}
          <div 
            ref={messagesContainerRef}
            className="flex-1 overflow-y-auto p-6 space-y-4 overlay-scrollbar"
          >
            {localMessages.length === 0 && (
              <div className="text-center py-12 px-6 bg-gray-50 rounded-xl">
                <p className="text-lg text-gray-600 leading-relaxed">
                  👋 Hello! I'm Gemma3n, a local AI model. Ask me anything!
                </p>
              </div>
            )}
            
            {localMessages.map((message, index) => (
              <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] px-4 py-3 rounded-2xl ${
                  message.role === 'user'
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-br-md'
                    : 'bg-gray-100 text-gray-800 rounded-bl-md'
                }`}>
                  <div className="text-sm leading-relaxed whitespace-pre-wrap">
                    {message.content}
                  </div>
                </div>
              </div>
            ))}
            
            {sendMessageMutation.isPending && (
              <div className="flex justify-start">
                <div className="max-w-[80%] px-4 py-3 rounded-2xl bg-gray-100 text-gray-800 rounded-bl-md">
                  <div className="flex gap-1 items-center">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-typing"></span>
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-typing" style={{ animationDelay: '-0.16s' }}></span>
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-typing" style={{ animationDelay: '-0.32s' }}></span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input Container */}
          <div className="p-6 border-t border-gray-200 bg-white">
            <div className="flex gap-3 items-end">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={sendMessageMutation.isPending ? "Sending message..." : "Type your message..."}
                disabled={sendMessageMutation.isPending || !status?.ollamaAvailable}
                rows={3}
                className={`flex-1 px-4 py-3 border-2 rounded-xl text-sm font-medium resize-none outline-none transition-colors ${
                  sendMessageMutation.isPending 
                    ? 'border-gray-300 bg-gray-100 text-gray-400 cursor-not-allowed' 
                    : 'border-gray-200 bg-gray-50 focus:border-indigo-500 focus:bg-white'
                }`}
              />
              <div className="flex gap-2">
                <VoiceInput
                  onTranscription={handleVoiceTranscription}
                  onAutoSend={handleVoiceAutoSend}
                  disabled={sendMessageMutation.isPending || !status?.ollamaAvailable}
                />
                <button 
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || sendMessageMutation.isPending || !status?.ollamaAvailable}
                  className="px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none min-w-[48px] h-[48px] flex items-center justify-center text-lg"
                >
                  {sendMessageMutation.isPending ? (
                    <LoadingSpinner size="md" color="white" />
                  ) : (
                    '📤'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 