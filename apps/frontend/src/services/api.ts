import type { 
  Message, 
  Chat, 
  CreateChatRequest, 
  UpdateChatRequest, 
  ChatResponse, 
  VoiceInputRequest, 
  VoiceInputResponse,
  SendMessageRequest,
  SendMessageResponse,
  GenerateResponseRequest,
  GenerateResponseResponse
} from 'shared/src/types';
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

// Chat API (legacy for backward compatibility)
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

// New Message API
export const messageApi = {
  sendMessage: (data: SendMessageRequest) => apiRequest<SendMessageResponse>('/messages/send', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  
  generateResponse: (data: GenerateResponseRequest) => apiRequest<GenerateResponseResponse>('/messages/generate-response', {
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

// File API
export const fileApi = {
  uploadFile: (file: File, chatId?: string) => {
    const formData = new FormData();
    formData.append('file', file);
    if (chatId) {
      formData.append('chatId', chatId);
    }
    
    return apiRequest<{ success: boolean; file: any }>('/files/upload', {
      method: 'POST',
      body: formData,
      headers: {}, // Let browser set Content-Type for FormData
    });
  },

  processPDF: (fileId: string) => apiRequest<{ success: boolean; chunks: string[]; chunkCount: number }>(`/files/${fileId}/process`, {
    method: 'POST',
  }),

  searchInFile: (fileId: string, query: string, topK: number = 3) => apiRequest<{ success: boolean; chunks: string[]; query: string }>(`/files/${fileId}/search`, {
    method: 'POST',
    body: JSON.stringify({ query, topK }),
  }),

  getFilesByChat: (chatId: string) => apiRequest<{ success: boolean; files: any[] }>(`/chats/${chatId}/files`, {
    method: 'GET',
  }),

  deleteFile: (fileId: string) => apiRequest<{ success: boolean; message: string }>(`/files/${fileId}`, {
    method: 'DELETE',
  }),

  // Enhanced file operations
  getFileStats: (chatId: string) => apiRequest<{ success: boolean; stats: any }>(`/chats/${chatId}/files/stats`, {
    method: 'GET',
  }),

  searchAcrossAllFiles: (chatId: string, query: string, topK: number = 5) => apiRequest<{ success: boolean; results: any[]; query: string }>(`/chats/${chatId}/files/search`, {
    method: 'POST',
    body: JSON.stringify({ query, topK }),
  }),

  updateFileMetadata: (fileId: string, metadata: any) => apiRequest<{ success: boolean; file: any }>(`/files/${fileId}/metadata`, {
    method: 'PUT',
    body: JSON.stringify(metadata),
  }),

  getFileContent: (fileId: string) => apiRequest<{ success: boolean; content: any }>(`/files/${fileId}/content`, {
    method: 'GET',
  }),
};

// Function API
export const functionApi = {
  getFunctions: () => apiRequest<{ success: boolean; functions: any[] }>('/functions', {
    method: 'GET',
  }),

  executeFunction: (name: string, args: any) => apiRequest<{ success: boolean; data?: any; error?: string }>('/functions/execute', {
    method: 'POST',
    body: JSON.stringify({ name, arguments: args }),
  }),

  parseAndExecuteFunctions: (text: string) => apiRequest<{ success: boolean; functionCalls: any[]; results: any[] }>('/functions/parse', {
    method: 'POST',
    body: JSON.stringify({ text }),
  }),
}; 