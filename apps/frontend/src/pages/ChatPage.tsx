import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useChat, useSendMessageNew, useGenerateResponse, useStatus, useFilesByChat, useUploadFile, useProcessFile, useDeleteFile, useSearchInFile, useParseAndExecuteFunctions, useSearchAcrossAllFiles } from '../hooks/useApi';
import { ChatPageSkeleton } from '../components/SkeletonLoader';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { VoiceInput } from '../components/VoiceInput';
import { ChatSidebar } from '../components/ChatSidebar';
import { MarkdownRenderer } from '../components/MarkdownRenderer';
import { FileUploadButton } from '../components/FileUploadButton';
import { RagQueryButton } from '../components/RagQueryButton';
import { FileList } from '../components/FileList';
import { FunctionCallDisplay } from '../components/FunctionCallDisplay';
import type { Message, MessageStatus, Chat } from 'shared/src/types';

export const ChatPage: React.FC = () => {
  const { chatId } = useParams<{ chatId: string }>();
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  
  const { data: chatData, isLoading, error } = useChat(chatId || null);
  const { data: statusData } = useStatus();
  const { data: filesData, refetch: refetchFiles } = useFilesByChat(chatId || null);
  const sendMessageMutation = useSendMessageNew();
  const generateResponseMutation = useGenerateResponse();
  const uploadFileMutation = useUploadFile();
  const processFileMutation = useProcessFile();
  const deleteFileMutation = useDeleteFile();
  const searchInFileMutation = useSearchInFile();
  const parseAndExecuteFunctionsMutation = useParseAndExecuteFunctions();
  const searchAcrossAllFilesMutation = useSearchAcrossAllFiles();
  
  const [inputMessage, setInputMessage] = useState('');
  const [localMessages, setLocalMessages] = useState<Message[]>([]);
  const [messageStatuses, setMessageStatuses] = useState<Map<string, MessageStatus>>(new Map());
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [processingFileId, setProcessingFileId] = useState<string | null>(null);
  const [deletingFileId, setDeletingFileId] = useState<string | null>(null);
  const [functionCalls, setFunctionCalls] = useState<any[]>([]);
  const [functionResults, setFunctionResults] = useState<any[]>([]);

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

    // Check for function calls in the message
    await handleFunctionCall(inputMessage.trim());

    // Create a temporary message ID for tracking
    const tempMessageId = `temp_${Date.now()}`;
    setMessageStatuses(prev => new Map(prev).set(tempMessageId, {
      messageId: tempMessageId,
      status: 'sending'
    }));

    try {
      // Step 1: Send message to backend
      const sendResult = await sendMessageMutation.mutateAsync({
        messages: newMessages,
        model: 'gemma3n:latest',
        chatId
      });

      if (sendResult.success && sendResult.messageId) {
        const messageId = sendResult.messageId; // Extract to avoid TypeScript issues
        
        // Update status to sent
        setMessageStatuses(prev => new Map(prev).set(messageId, {
          messageId: messageId,
          status: 'sent'
        }));

        // Step 2: Generate AI response
        setMessageStatuses(prev => new Map(prev).set(messageId, {
          messageId: messageId,
          status: 'generating'
        }));

        const responseResult = await generateResponseMutation.mutateAsync({
          messageId: messageId,
          chatId: chatId,
          model: 'gemma3n:latest'
        });

        // Update status to completed
        setMessageStatuses(prev => new Map(prev).set(messageId, {
          messageId: messageId,
          status: 'completed'
        }));

        // Clean up status after a delay
        setTimeout(() => {
          setMessageStatuses(prev => {
            const newMap = new Map(prev);
            newMap.delete(messageId);
            return newMap;
          });
        }, 2000);

      } else {
        throw new Error(sendResult.error || 'Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Update status to error
      setMessageStatuses(prev => new Map(prev).set(tempMessageId, {
        messageId: tempMessageId,
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      }));

      const errorMessage: Message = {
        role: 'assistant',
        content: 'Sorry, an error occurred while processing your request.'
      };
      setLocalMessages(prev => [...prev, errorMessage]);

      // Clean up error status after a delay
      setTimeout(() => {
        setMessageStatuses(prev => {
          const newMap = new Map(prev);
          newMap.delete(tempMessageId);
          return newMap;
        });
      }, 5000);
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

    // Create a temporary message ID for tracking
    const tempMessageId = `temp_${Date.now()}`;
    setMessageStatuses(prev => new Map(prev).set(tempMessageId, {
      messageId: tempMessageId,
      status: 'sending'
    }));

    try {
      // Step 1: Send message to backend
      const sendResult = await sendMessageMutation.mutateAsync({
        messages: newMessages,
        model: 'gemma3n:latest',
        chatId
      });

      if (sendResult.success && sendResult.messageId) {
        const messageId = sendResult.messageId; // Extract to avoid TypeScript issues
        
        // Update status to sent
        setMessageStatuses(prev => new Map(prev).set(messageId, {
          messageId: messageId,
          status: 'sent'
        }));

        // Step 2: Generate AI response
        setMessageStatuses(prev => new Map(prev).set(messageId, {
          messageId: messageId,
          status: 'generating'
        }));

        const responseResult = await generateResponseMutation.mutateAsync({
          messageId: messageId,
          chatId: chatId,
          model: 'gemma3n:latest'
        });

        // Update status to completed
        setMessageStatuses(prev => new Map(prev).set(messageId, {
          messageId: messageId,
          status: 'completed'
        }));

        // Clean up status after a delay
        setTimeout(() => {
          setMessageStatuses(prev => {
            const newMap = new Map(prev);
            newMap.delete(messageId);
            return newMap;
          });
        }, 2000);

      } else {
        throw new Error(sendResult.error || 'Failed to send message');
      }
    } catch (error) {
      console.error('Error sending voice message:', error);
      
      // Update status to error
      setMessageStatuses(prev => new Map(prev).set(tempMessageId, {
        messageId: tempMessageId,
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      }));

      const errorMessage: Message = {
        role: 'assistant',
        content: 'Sorry, an error occurred while processing your voice message.'
      };
      setLocalMessages(prev => [...prev, errorMessage]);

      // Clean up error status after a delay
      setTimeout(() => {
        setMessageStatuses(prev => {
          const newMap = new Map(prev);
          newMap.delete(tempMessageId);
          return newMap;
        });
      }, 5000);
    }
  };

  const getMessageStatus = (messageId: string): MessageStatus | undefined => {
    return messageStatuses.get(messageId);
  };

  const handleChatSelect = (selectedChat: Chat) => {
    navigate(`/chat/${selectedChat._id}`);
    setSidebarOpen(false);
  };

  // File handling functions
  const handleFileUpload = async (file: File) => {
    console.log('handleFileUpload called with file:', file.name, 'chatId:', chatId);
    if (!chatId) return;
    
    try {
      console.log('Calling uploadFileMutation.mutateAsync...');
      const result = await uploadFileMutation.mutateAsync({ file, chatId });
      console.log('File upload result:', result);
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };

  const handleProcessFile = async (fileId: string) => {
    setProcessingFileId(fileId);
    try {
      await processFileMutation.mutateAsync(fileId);
    } catch (error) {
      console.error('Error processing file:', error);
    } finally {
      setProcessingFileId(null);
    }
  };

  const handleDeleteFile = async (fileId: string) => {
    console.log('handleDeleteFile called with fileId:', fileId);
    if (!window.confirm('Are you sure you want to delete this file?')) return;
    
    setDeletingFileId(fileId);
    try {
      console.log('Calling deleteFileMutation.mutateAsync...');
      await deleteFileMutation.mutateAsync(fileId);
      refetchFiles();
      console.log('File deleted successfully');
    } catch (error) {
      console.error('Error deleting file:', error);
    } finally {
      setDeletingFileId(null);
    }
  };

  const handleSearchInFile = async (fileId: string, query: string) => {
    if (!chatId) return;
    
    try {
      const result = await searchInFileMutation.mutateAsync({ fileId, query });
      if (result.success && result.chunks.length > 0) {
        // Create a context message with the relevant chunks
        const contextMessage = `Based on the document, here are the relevant sections:\n\n${result.chunks.join('\n\n')}\n\nQuestion: ${query}`;
        
        // Send the context as a user message
        const userMessage: Message = {
          role: 'user',
          content: contextMessage
        };

        const newMessages = [...localMessages, userMessage];
        setLocalMessages(newMessages);

        // Send message to backend
        const sendResult = await sendMessageMutation.mutateAsync({
          messages: newMessages,
          model: 'gemma3n:latest',
          chatId
        });

        if (sendResult.success && sendResult.messageId) {
          const messageId = sendResult.messageId;
          
          // Generate AI response
          await generateResponseMutation.mutateAsync({
            messageId: messageId,
            chatId: chatId,
            model: 'gemma3n:latest'
          });
        }
      }
    } catch (error) {
      console.error('Error searching in file:', error);
    }
  };

  const handleFunctionCall = async (text: string) => {
    try {
      const result = await parseAndExecuteFunctionsMutation.mutateAsync(text);
      if (result.success) {
        setFunctionCalls(result.functionCalls);
        setFunctionResults(result.results);
        
        // Clear function calls after 10 seconds
        setTimeout(() => {
          setFunctionCalls([]);
          setFunctionResults([]);
        }, 10000);
      }
    } catch (error) {
      console.error('Error executing functions:', error);
    }
  };

  const handleRagQuery = async (query: string) => {
    if (!chatId) return;
    
    try {
      const result = await searchAcrossAllFilesMutation.mutateAsync({ chatId, query });
      if (result.success && result.results.length > 0) {
        // Create a context message with the relevant chunks from all files
        const contextParts = result.results.map((fileResult: any) => {
          return `From ${fileResult.fileName}:\n${fileResult.chunks.join('\n\n')}`;
        });
        
        const contextMessage = `Based on the uploaded documents, here are the relevant sections:\n\n${contextParts.join('\n\n---\n\n')}\n\nQuestion: ${query}`;
        
        // Send the context as a user message
        const userMessage: Message = {
          role: 'user',
          content: contextMessage
        };

        const newMessages = [...localMessages, userMessage];
        setLocalMessages(newMessages);

        // Send message to backend
        const sendResult = await sendMessageMutation.mutateAsync({
          messages: newMessages,
          model: 'gemma3n:latest',
          chatId
        });

        if (sendResult.success && sendResult.messageId) {
          const messageId = sendResult.messageId;
          
          // Generate AI response
          await generateResponseMutation.mutateAsync({
            messageId: messageId,
            chatId: chatId,
            model: 'gemma3n:latest'
          });
        }
      } else {
        // If no results found, send a simple query
        const userMessage: Message = {
          role: 'user',
          content: `I searched for "${query}" in my uploaded documents but found no relevant information. Can you help me with this question?`
        };

        const newMessages = [...localMessages, userMessage];
        setLocalMessages(newMessages);

        const sendResult = await sendMessageMutation.mutateAsync({
          messages: newMessages,
          model: 'gemma3n:latest',
          chatId
        });

        if (sendResult.success && sendResult.messageId) {
          const messageId = sendResult.messageId;
          await generateResponseMutation.mutateAsync({
            messageId: messageId,
            chatId: chatId,
            model: 'gemma3n:latest'
          });
        }
      }
    } catch (error) {
      console.error('Error processing RAG query:', error);
    }
  };

  const isSending = sendMessageMutation.isPending;
  const isGenerating = generateResponseMutation.isPending;

  if (isLoading) {
    return <ChatPageSkeleton />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Chat</h2>
          <p className="text-gray-600 mb-4">Failed to load the chat. Please try again.</p>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Back to Chats
          </button>
        </div>
      </div>
    );
  }

  if (!chat) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Chat Not Found</h2>
          <p className="text-gray-600 mb-4">The requested chat could not be found.</p>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Back to Chats
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <ChatSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        currentChatId={chatId}
        onChatSelect={handleChatSelect}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 text-gray-600 hover:text-gray-900"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  {chat.title}
                </h1>
                <p className="text-sm text-gray-500">
                  Model: {chat.modelName}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {status && (
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${status.ollamaAvailable ? 'bg-green-500' : 'bg-red-500'}`} />
                  <span className="text-sm text-gray-600">
                    {status.ollamaAvailable ? 'AI Ready' : 'AI Unavailable'}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Messages */}
        <div 
          ref={messagesContainerRef}
          className="flex-1 overflow-y-auto p-6 space-y-4 overlay-scrollbar"
        >
          {localMessages.map((message, index) => {
            const messageStatus = getMessageStatus(message.role === 'user' ? `user_${index}` : `assistant_${index}`);
            
            return (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-3xl px-4 py-2 rounded-lg ${
                    message.role === 'user'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white border border-gray-200 text-gray-900'
                  }`}
                >
                  {message.role === 'user' ? (
                    <div className="whitespace-pre-wrap">{message.content}</div>
                  ) : (
                    <MarkdownRenderer content={message.content} />
                  )}
                  
                  {/* Status indicators */}
                  {messageStatus && (
                    <div className="mt-2 flex items-center space-x-2">
                      {messageStatus.status === 'sending' && (
                        <div className="flex items-center space-x-1 text-xs">
                          <LoadingSpinner size="sm" color={message.role === 'user' ? 'white' : 'indigo'} />
                          <span>Sending...</span>
                        </div>
                      )}
                      {messageStatus.status === 'sent' && (
                        <div className="flex items-center space-x-1 text-xs">
                          <span>✓ Sent</span>
                        </div>
                      )}
                      {messageStatus.status === 'generating' && (
                        <div className="flex items-center space-x-1 text-xs">
                          <LoadingSpinner size="sm" color={message.role === 'user' ? 'white' : 'indigo'} />
                          <span>AI is thinking...</span>
                        </div>
                      )}
                      {messageStatus.status === 'error' && (
                        <div className="flex items-center space-x-1 text-xs text-red-500">
                          <span>✗ Error: {messageStatus.error}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          
          {/* Overall status indicators */}
          {(isSending || isGenerating) && (
            <div className="flex justify-center">
              <div className="bg-white border border-gray-200 rounded-lg px-4 py-2 flex items-center space-x-2">
                {isSending && (
                  <>
                    <LoadingSpinner size="sm" color="indigo" />
                    <span className="text-sm text-gray-600">Sending message...</span>
                  </>
                )}
                {isGenerating && (
                  <>
                    <LoadingSpinner size="sm" color="indigo" />
                    <span className="text-sm text-gray-600">Generating response...</span>
                  </>
                )}
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Function Calls Display */}
        {functionCalls.length > 0 && (
          <div className="bg-white border-t border-gray-200 p-6">
            <div className="max-w-4xl mx-auto">
              <FunctionCallDisplay
                functionCalls={functionCalls}
                results={functionResults}
              />
            </div>
          </div>
        )}

                {/* Files Section */}
        {filesData?.files && filesData.files.length > 0 && (
          <div className="bg-white border-t border-gray-200 p-6">
            <div className="max-w-4xl mx-auto">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">📄 Uploaded Documents</h3>
                <FileList
                  files={filesData.files}
                  onProcessFile={handleProcessFile}
                  onDeleteFile={handleDeleteFile}
                  onSearchInFile={handleSearchInFile}
                  processingFileId={processingFileId || undefined}
                  deletingFileId={deletingFileId || undefined}
                />
              </div>
            </div>
          </div>
        )}

        {/* Input */}
        <div className="bg-white border-t border-gray-200 p-6">
          <div className="max-w-4xl mx-auto">
            <div className="flex gap-3 items-end">
              {/* File Upload Button */}
              <FileUploadButton
                onFileUpload={handleFileUpload}
                disabled={isSending || isGenerating || !status?.ollamaAvailable || uploadFileMutation.isPending}
              />
              
              {/* RAG Query Button */}
              <RagQueryButton
                onQuerySubmit={handleRagQuery}
                disabled={isSending || isGenerating || !status?.ollamaAvailable || searchAcrossAllFilesMutation.isPending}
              />
              
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                disabled={isSending || isGenerating || !status?.ollamaAvailable}
                className="flex-1 p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                rows={1}
                style={{ minHeight: '44px', maxHeight: '120px' }}
              />
              <div className="flex gap-2">
                <VoiceInput
                  onTranscription={handleVoiceTranscription}
                  onAutoSend={handleVoiceAutoSend}
                  disabled={isSending || isGenerating || !status?.ollamaAvailable}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || isSending || isGenerating || !status?.ollamaAvailable}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isSending ? (
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