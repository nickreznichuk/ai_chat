import { Request, Response } from 'express';
import { OllamaService } from '../services/ollamaService';
import { MessageService } from '../services/messageService';
import type { 
  ChatRequest, 
  ChatResponse, 
  Message,
  SendMessageRequest,
  SendMessageResponse,
  GenerateResponseRequest,
  GenerateResponseResponse
} from 'shared/src/types';

export class ChatController {
  private ollamaService: OllamaService;
  private messageService: MessageService;

  constructor() {
    this.ollamaService = new OllamaService();
    this.messageService = new MessageService();
  }

  /**
   * Send message and save to database (legacy endpoint for backward compatibility)
   */
  async handleChat(req: Request, res: Response): Promise<void> {
    try {
      const { messages, model, chatId, options } = req.body;
      
      // Validate input data
      if (!messages || !Array.isArray(messages)) {
        res.status(400).json({ 
          error: 'Messages array is required' 
        });
        return;
      }

      if (messages.length === 0) {
        res.status(400).json({ 
          error: 'At least one message is required' 
        });
        return;
      }

      // Check if model is available
      const modelAvailable = await this.ollamaService.checkModel(model);
      if (!modelAvailable) {
        res.status(503).json({ 
          error: `Model ${model || 'gemma3n:latest'} is not available. Please make sure Ollama is running and the model is installed.` 
        });
        return;
      }

      // Get response from model
      const response: ChatResponse = await this.ollamaService.chat({
        messages,
        model,
        options
      });
      
      // Save messages to database if chatId is provided
      if (chatId) {
        const lastUserMessage = messages[messages.length - 1];
        const assistantMessage: Message = {
          role: 'assistant',
          content: response.response
        };

        // Add both messages to database
        await this.messageService.addMessage(chatId, lastUserMessage);
        await this.messageService.addMessage(chatId, assistantMessage);
        
        // Update chat title from first message if it's the first message
        if (messages.length === 1) {
          await this.messageService.updateChatTitleFromFirstMessage(chatId);
        }
      }
      
      res.json(response);
    } catch (error) {
      console.error('Error in chat controller:', error);
      res.status(500).json({ 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Send message and save to database (new endpoint)
   */
  async sendMessage(req: Request, res: Response): Promise<void> {
    try {
      const { messages, model, chatId, options }: SendMessageRequest = req.body;
      
      // Validate input data
      if (!messages || !Array.isArray(messages)) {
        res.status(400).json({ 
          success: false,
          error: 'Messages array is required' 
        });
        return;
      }

      if (messages.length === 0) {
        res.status(400).json({ 
          success: false,
          error: 'At least one message is required' 
        });
        return;
      }

      if (!chatId) {
        res.status(400).json({ 
          success: false,
          error: 'Chat ID is required' 
        });
        return;
      }

      // Check if model is available
      const modelAvailable = await this.ollamaService.checkModel(model);
      if (!modelAvailable) {
        res.status(503).json({ 
          success: false,
          error: `Model ${model || 'gemma3n:latest'} is not available. Please make sure Ollama is running and the model is installed.` 
        });
        return;
      }

      // Get the last user message
      const lastUserMessage = messages[messages.length - 1];
      
      // Save user message to database
      const savedMessage = await this.messageService.addMessage(chatId, lastUserMessage);
      
      // Update chat title from first message if it's the first message
      if (messages.length === 1) {
        await this.messageService.updateChatTitleFromFirstMessage(chatId);
      }

      const response: SendMessageResponse = {
        success: true,
        messageId: savedMessage._id?.toString() || '',
        chatId: chatId
      };
      
      res.json(response);
    } catch (error) {
      console.error('Error in sendMessage controller:', error);
      res.status(500).json({ 
        success: false,
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Generate AI response for a specific message
   */
  async generateResponse(req: Request, res: Response): Promise<void> {
    try {
      const { messageId, chatId, model, options }: GenerateResponseRequest = req.body;
      
      // Validate input data
      if (!messageId || !chatId) {
        res.status(400).json({ 
          error: 'Message ID and Chat ID are required' 
        });
        return;
      }

      // Check if model is available
      const modelAvailable = await this.ollamaService.checkModel(model);
      if (!modelAvailable) {
        res.status(503).json({ 
          error: `Model ${model || 'gemma3n:latest'} is not available. Please make sure Ollama is running and the model is installed.` 
        });
        return;
      }

      // Get all messages for the chat to provide context
      const chatMessages = await this.messageService.getMessagesByChatId(chatId);
      
      // Get response from model
      const response: ChatResponse = await this.ollamaService.chat({
        messages: chatMessages,
        model,
        options
      });

      // Save assistant message to database
      const assistantMessage: Message = {
        role: 'assistant',
        content: response.response
      };
      
      await this.messageService.addMessage(chatId, assistantMessage);

      const generateResponse: GenerateResponseResponse = {
        response: response.response,
        model: response.model,
        created_at: response.created_at,
        done: response.done,
        messageId: messageId
      };
      
      res.json(generateResponse);
    } catch (error) {
      console.error('Error in generateResponse controller:', error);
      res.status(500).json({ 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Check Ollama service status
   */
  async checkStatus(req: Request, res: Response): Promise<void> {
    try {
      const modelAvailable = await this.ollamaService.checkModel();
      res.json({ 
        status: 'ok',
        ollamaAvailable: modelAvailable,
        model: 'gemma3n:latest'
      });
    } catch (error) {
      console.error('Error checking status:', error);
      res.status(503).json({ 
        status: 'error',
        ollamaAvailable: false,
        error: 'Ollama service is not available'
      });
    }
  }
} 