import { Router } from 'express';
import { FileController } from '../controllers/fileController';

const router = Router();
const fileController = new FileController();

// File routes
router.post('/files/upload', fileController.uploadMiddleware, (req, res) => fileController.uploadFile(req, res));
router.post('/files/:fileId/process', (req, res) => fileController.processPDF(req, res));
router.post('/files/:fileId/search', (req, res) => fileController.searchInFile(req, res));
router.get('/chats/:chatId/files', (req, res) => fileController.getFilesByChat(req, res));
router.delete('/files/:fileId', (req, res) => fileController.deleteFile(req, res));

// Enhanced file routes
router.get('/chats/:chatId/files/stats', (req, res) => fileController.getFileStats(req, res));
router.post('/chats/:chatId/files/search', (req, res) => fileController.searchAcrossAllFiles(req, res));
router.put('/files/:fileId/metadata', (req, res) => fileController.updateFileMetadata(req, res));
router.get('/files/:fileId/content', (req, res) => fileController.getFileContent(req, res));

export default router; 