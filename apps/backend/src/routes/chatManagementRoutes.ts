import { Router } from 'express';
import { ChatManagementController } from '../controllers/chatManagementController';

const router = Router();
const chatManagementController = new ChatManagementController();

// Chat management routes
router.get('/chats', (req, res) => chatManagementController.getAllChats(req, res));
router.get('/chats/:id', (req, res) => chatManagementController.getChatById(req, res));
router.post('/chats', (req, res) => chatManagementController.createChat(req, res));
router.put('/chats/:id', (req, res) => chatManagementController.updateChat(req, res));
router.delete('/chats/:id', (req, res) => chatManagementController.deleteChat(req, res));

export default router; 