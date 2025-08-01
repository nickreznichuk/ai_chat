import { Message, IMessage } from '../models/Message';
import { Chat } from '../models/Chat';
import type { Message as SharedMessage } from 'shared/src/types';
import mongoose from 'mongoose';

export class MessageService {
  /**
   * Add a message to a chat
   */
  async addMessage(chatId: string, message: SharedMessage): Promise<IMessage> {
    const newMessage = new Message({
      chatId: new mongoose.Types.ObjectId(chatId),
      role: message.role,
      content: message.content
    });
    
    const savedMessage = await newMessage.save();
    
    // Update chat's updated_at timestamp
    await Chat.findByIdAndUpdate(chatId, { updated_at: new Date() });
    
    return savedMessage;
  }

  /**
   * Get all messages for a chat
   */
  async getMessagesByChatId(chatId: string): Promise<SharedMessage[]> {
    const messages = await Message.find({ chatId })
      .sort({ created_at: 1 })
      .lean();
    
    return messages.map(msg => ({
      role: msg.role,
      content: msg.content
    }));
  }

  /**
   * Get messages with pagination
   */
  async getMessagesByChatIdPaginated(
    chatId: string, 
    page: number = 1, 
    limit: number = 50
  ): Promise<{ messages: SharedMessage[]; total: number; hasMore: boolean }> {
    const skip = (page - 1) * limit;
    
    const [messages, total] = await Promise.all([
      Message.find({ chatId })
        .sort({ created_at: 1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Message.countDocuments({ chatId })
    ]);
    
    const formattedMessages = messages.map(msg => ({
      role: msg.role,
      content: msg.content
    }));
    
    return {
      messages: formattedMessages,
      total,
      hasMore: skip + limit < total
    };
  }

  /**
   * Delete all messages for a chat
   */
  async deleteMessagesByChatId(chatId: string): Promise<number> {
    const result = await Message.deleteMany({ chatId });
    return result.deletedCount || 0;
  }

  /**
   * Get the first user message for a chat (for title generation)
   */
  async getFirstUserMessage(chatId: string): Promise<SharedMessage | null> {
    const message = await Message.findOne({ 
      chatId, 
      role: 'user' 
    }).sort({ created_at: 1 }).lean();
    
    if (!message) return null;
    
    return {
      role: message.role,
      content: message.content
    };
  }

  /**
   * Update chat title based on first message
   */
  async updateChatTitleFromFirstMessage(chatId: string): Promise<void> {
    const firstMessage = await this.getFirstUserMessage(chatId);
    
    if (firstMessage) {
      const title = firstMessage.content.slice(0, 50) + 
        (firstMessage.content.length > 50 ? '...' : '');
      
      await Chat.findByIdAndUpdate(chatId, { title });
    }
  }
} 