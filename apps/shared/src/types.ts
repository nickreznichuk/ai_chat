export type Message = { role: 'user' | 'assistant'; content: string };

// Ollama API types
export interface OllamaGenerateRequest {
  model: string;
  prompt: string;
  stream?: boolean;
  options?: {
    temperature?: number;
    top_p?: number;
    top_k?: number;
    num_predict?: number;
  };
}

export interface OllamaGenerateResponse {
  model: string;
  created_at: string;
  response: string;
  done: boolean;
  context?: number[];
  total_duration?: number;
  load_duration?: number;
  prompt_eval_count?: number;
  prompt_eval_duration?: number;
  eval_count?: number;
  eval_duration?: number;
}

export interface ChatRequest {
  messages: Message[];
  model?: string;
  stream?: boolean;
  options?: {
    temperature?: number;
    top_p?: number;
    top_k?: number;
    num_predict?: number;
  };
}

export interface ChatResponse {
  response: string;
  model: string;
  created_at: string;
  done: boolean;
}

// Chat management types
export interface Chat {
  _id: string;
  title: string;
  modelName: string;
  created_at: string;
  updated_at: string;
}

export interface CreateChatRequest {
  title: string;
  model?: string;
}

export interface UpdateChatRequest {
  title?: string;
}

export interface ChatListResponse {
  chats: Chat[];
}

export interface ChatDetailResponse {
  chat: Chat;
  messages: Message[];
}
