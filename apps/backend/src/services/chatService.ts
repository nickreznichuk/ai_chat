import { Chat, IChat } from '../models/Chat';
import { MessageService } from './messageService';
import { config } from '../config/env';
import type { CreateChatRequest, UpdateChatRequest } from 'shared/src/types';

export class ChatService {
  private messageService: MessageService;

  constructor() {
    this.messageService = new MessageService();
  }

  /**
   * Create a new chat
   */
  async createChat(request: CreateChatRequest): Promise<IChat> {
    const chat = new Chat({
      title: request.title,
      modelName: request.model || config.ollama.defaultModel
    });
    
    return await chat.save();
  }

  /**
   * Get all chats with message count
   */
  async getAllChats(): Promise<IChat[]> {
    return await Chat.find().sort({ updated_at: -1 });
  }

  /**
   * Get chat by ID
   */
  async getChatById(id: string): Promise<IChat | null> {
    return await Chat.findById(id);
  }

  /**
   * Update chat
   */
  async updateChat(id: string, request: UpdateChatRequest): Promise<IChat | null> {
    const updateData: any = {};
    
    if (request.title !== undefined) {
      updateData.title = request.title;
    }

    return await Chat.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );
  }

  /**
   * Delete chat and all its messages
   */
  async deleteChat(id: string): Promise<boolean> {
    // Delete all messages first
    await this.messageService.deleteMessagesByChatId(id);
    
    // Then delete the chat
    const result = await Chat.findByIdAndDelete(id);
    return result !== null;
  }

  /**
   * Get chat with messages
   */
  async getChatWithMessages(id: string): Promise<{ chat: IChat; messages: any[] } | null> {
    const chat = await Chat.findById(id);
    if (!chat) return null;

    const messages = await this.messageService.getMessagesByChatId(id);
    
    return { chat, messages };
  }

  /**
   * Update chat title from first message
   */
  async updateChatTitleFromFirstMessage(chatId: string): Promise<void> {
    await this.messageService.updateChatTitleFromFirstMessage(chatId);
  }
} 