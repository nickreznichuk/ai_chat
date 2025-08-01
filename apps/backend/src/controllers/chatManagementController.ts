import { Request, Response } from 'express';
import { ChatService } from '../services/chatService';
import type { CreateChatRequest, UpdateChatRequest } from 'shared/src/types';

export class ChatManagementController {
  private chatService: ChatService;

  constructor() {
    this.chatService = new ChatService();
  }

  /**
   * Get all chats
   */
  async getAllChats(req: Request, res: Response): Promise<void> {
    try {
      const chats = await this.chatService.getAllChats();
      res.json({ chats });
    } catch (error) {
      console.error('Error getting chats:', error);
      res.status(500).json({ 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get chat by ID with messages
   */
  async getChatById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const chatWithMessages = await this.chatService.getChatWithMessages(id);
      
      if (!chatWithMessages) {
        res.status(404).json({ error: 'Chat not found' });
        return;
      }
      
      res.json(chatWithMessages);
    } catch (error) {
      console.error('Error getting chat:', error);
      res.status(500).json({ 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Create new chat
   */
  async createChat(req: Request, res: Response): Promise<void> {
    try {
      const createRequest: CreateChatRequest = req.body;
      
      if (!createRequest.title) {
        res.status(400).json({ error: 'Title is required' });
        return;
      }

      const chat = await this.chatService.createChat(createRequest);
      res.status(201).json({ chat });
    } catch (error) {
      console.error('Error creating chat:', error);
      res.status(500).json({ 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Update chat
   */
  async updateChat(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updateRequest: UpdateChatRequest = req.body;
      
      const chat = await this.chatService.updateChat(id, updateRequest);
      
      if (!chat) {
        res.status(404).json({ error: 'Chat not found' });
        return;
      }
      
      res.json({ chat });
    } catch (error) {
      console.error('Error updating chat:', error);
      res.status(500).json({ 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Delete chat
   */
  async deleteChat(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const deleted = await this.chatService.deleteChat(id);
      
      if (!deleted) {
        res.status(404).json({ error: 'Chat not found' });
        return;
      }
      
      res.json({ message: 'Chat deleted successfully' });
    } catch (error) {
      console.error('Error deleting chat:', error);
      res.status(500).json({ 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
} 