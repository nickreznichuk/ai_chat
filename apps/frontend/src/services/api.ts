import type { Message, Chat, CreateChatRequest, UpdateChatRequest, ChatResponse, VoiceInputRequest, VoiceInputResponse } from 'shared/src/types';
import { config } from '../config/env';

const API_BASE_URL = config.api.baseUrl;

// Generic API request function
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

// Status API
export const statusApi = {
  checkStatus: () => apiRequest<{ status: string; ollamaAvailable: boolean; model: string }>('/status'),
};

// Chat API
export const chatApi = {
  sendMessage: (data: {
    messages: Message[];
    model?: string;
    chatId?: string;
    options?: any;
  }) => apiRequest<ChatResponse>('/chat', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
};

// Chat Management API
export const chatManagementApi = {
  getAllChats: () => apiRequest<{ chats: Chat[] }>('/chats'),
  
  getChatById: (id: string) => apiRequest<{ chat: Chat; messages: Message[] }>(`/chats/${id}`),
  
  createChat: (data: CreateChatRequest) => apiRequest<{ chat: Chat }>('/chats', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  
  updateChat: (id: string, data: UpdateChatRequest) => apiRequest<{ chat: Chat }>(`/chats/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  
  deleteChat: (id: string) => apiRequest<{ message: string }>(`/chats/${id}`, {
    method: 'DELETE',
  }),
};

// Voice API
export const voiceApi = {
  transcribe: (data: VoiceInputRequest) => apiRequest<VoiceInputResponse>('/voice/transcribe', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  getStatus: () => apiRequest<{ whisperAvailable: boolean; modelPath: string; whisperPath: string }>('/voice/status'),
}; 