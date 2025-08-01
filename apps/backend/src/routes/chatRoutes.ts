import { Router } from 'express';
import { ChatController } from '../controllers/chatController';

const router = Router();
const chatController = new ChatController();

// Chat routes
router.post('/chat', (req, res) => chatController.handleChat(req, res));
router.post('/messages/send', (req, res) => chatController.sendMessage(req, res));
router.post('/messages/generate-response', (req, res) => chatController.generateResponse(req, res));
router.get('/status', (req, res) => chatController.checkStatus(req, res));

export default router; 