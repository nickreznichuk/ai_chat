import axios from 'axios';
import { config } from '../config/env';
import type { 
  OllamaGenerateRequest, 
  OllamaGenerateResponse, 
  ChatRequest, 
  ChatResponse,
  Message 
} from 'shared/src/types';

export class OllamaService {
  private baseUrl: string;
  private defaultModel: string;

  constructor(baseUrl?: string, defaultModel?: string) {
    this.baseUrl = baseUrl || config.ollama.baseUrl;
    this.defaultModel = defaultModel || config.ollama.defaultModel;
  }

  /**
   * Генерує відповідь від моделі Ollama
   */
  async generate(request: OllamaGenerateRequest): Promise<OllamaGenerateResponse> {
    try {
      const response = await axios.post(`${this.baseUrl}/api/generate`, request);
      return response.data;
    } catch (error) {
      console.error('Error calling Ollama API:', error);
      throw new Error('Failed to generate response from Ollama');
    }
  }

  /**
   * Обробляє чат з історією повідомлень
   */
  async chat(request: ChatRequest): Promise<ChatResponse> {
    try {
      // Формуємо промпт з історії повідомлень
      const prompt = this.formatMessagesToPrompt(request.messages);
      
      const generateRequest: OllamaGenerateRequest = {
        model: request.model || this.defaultModel,
        prompt,
        stream: request.stream || false,
        options: request.options
      };

      const response = await this.generate(generateRequest);
      
      return {
        response: response.response,
        model: response.model,
        created_at: response.created_at,
        done: response.done
      };
    } catch (error) {
      console.error('Error in chat:', error);
      throw error;
    }
  }

  /**
   * Форматує історію повідомлень у промпт для моделі
   */
  private formatMessagesToPrompt(messages: Message[]): string {
    return messages
      .map(msg => {
        const role = msg.role === 'user' ? 'User' : 'Assistant';
        return `${role}: ${msg.content}`;
      })
      .join('\n') + '\nAssistant:';
  }

  /**
   * Перевіряє чи доступна модель
   */
  async checkModel(model: string = this.defaultModel): Promise<boolean> {
    try {
      const response = await axios.get(`${this.baseUrl}/api/tags`);
      const models = response.data.models || [];
      return models.some((m: any) => m.model === model);
    } catch (error) {
      console.error('Error checking model availability:', error);
      return false;
    }
  }
} 