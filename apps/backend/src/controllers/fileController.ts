import { Request, Response } from 'express';
import { FileService } from '../services/fileService';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow PDF files and images
    if (file.mimetype === 'application/pdf' || file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files and images are allowed'));
    }
  }
});

export class FileController {
  private fileService: FileService;

  constructor() {
    this.fileService = new FileService();
  }

  // Middleware for file upload
  uploadMiddleware = upload.single('file');

  async uploadFile(req: Request, res: Response): Promise<void> {
    try {
      console.log('uploadFile called, req.file:', req.file?.originalname, 'req.body:', req.body);
      
      if (!req.file) {
        res.status(400).json({ error: 'No file uploaded' });
        return;
      }

      const { chatId } = req.body;
      console.log('chatId from request:', chatId);
      
      const file = await this.fileService.uploadFile(req.file, chatId);
      console.log('File saved with ID:', file._id);

      res.json({
        success: true,
        file: {
          id: file._id,
          filename: file.filename,
          originalName: file.originalName,
          mimeType: file.mimeType,
          size: file.size,
          created_at: file.created_at
        }
      });
    } catch (error) {
      console.error('Error uploading file:', error);
      res.status(500).json({
        error: 'Failed to upload file',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async processFile(req: Request, res: Response): Promise<void> {
    try {
      const { fileId } = req.params;
      
      const result = await this.fileService.processFile(fileId);
      
      res.json({
        success: true,
        chunks: result.chunks,
        chunkCount: result.chunks.length
      });
    } catch (error) {
      console.error('Error processing file:', error);
      res.status(500).json({
        error: 'Failed to process file',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async searchInFile(req: Request, res: Response): Promise<void> {
    try {
      const { fileId } = req.params;
      const { query, topK = 3 } = req.body;

      if (!query) {
        res.status(400).json({ error: 'Query is required' });
        return;
      }

      const chunks = await this.fileService.searchSimilarChunks(query, fileId, topK);
      
      res.json({
        success: true,
        chunks,
        query
      });
    } catch (error) {
      console.error('Error searching in file:', error);
      res.status(500).json({
        error: 'Failed to search in file',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async getFilesByChat(req: Request, res: Response): Promise<void> {
    try {
      const { chatId } = req.params;
      console.log('getFilesByChat called with chatId:', chatId);
      
      const files = await this.fileService.getFilesByChatId(chatId);
      console.log('Found files:', files.length);
      
      res.json({
        success: true,
        files: files.map(file => ({
          id: file._id,
          filename: file.filename,
          originalName: file.originalName,
          mimeType: file.mimeType,
          size: file.size,
          created_at: file.created_at,
          hasChunks: !!file.chunks && file.chunks.length > 0
        }))
      });
    } catch (error) {
      console.error('Error getting files:', error);
      res.status(500).json({
        error: 'Failed to get files',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async deleteFile(req: Request, res: Response): Promise<void> {
    try {
      const { fileId } = req.params;
      
      await this.fileService.deleteFile(fileId);
      
      res.json({
        success: true,
        message: 'File deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting file:', error);
      res.status(500).json({
        error: 'Failed to delete file',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async getFileStats(req: Request, res: Response): Promise<void> {
    try {
      const { chatId } = req.params;
      
      const stats = await this.fileService.getFileStats(chatId);
      
      res.json({
        success: true,
        stats
      });
    } catch (error) {
      console.error('Error getting file stats:', error);
      res.status(500).json({
        error: 'Failed to get file stats',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async searchAcrossAllFiles(req: Request, res: Response): Promise<void> {
    try {
      const { chatId } = req.params;
      const { query, topK = 5 } = req.body;

      if (!query) {
        res.status(400).json({ error: 'Query is required' });
        return;
      }

      const results = await this.fileService.searchAcrossAllFiles(chatId, query, topK);
      
      res.json({
        success: true,
        results,
        query
      });
    } catch (error) {
      console.error('Error searching across files:', error);
      res.status(500).json({
        error: 'Failed to search across files',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async updateFileMetadata(req: Request, res: Response): Promise<void> {
    try {
      const { fileId } = req.params;
      const metadata = req.body;
      
      const file = await this.fileService.updateFileMetadata(fileId, metadata);
      
      res.json({
        success: true,
        file: {
          id: file._id,
          filename: file.filename,
          originalName: file.originalName,
          mimeType: file.mimeType,
          size: file.size,
          created_at: file.created_at,
          hasChunks: !!file.chunks && file.chunks.length > 0
        }
      });
    } catch (error) {
      console.error('Error updating file metadata:', error);
      res.status(500).json({
        error: 'Failed to update file metadata',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async getFileContent(req: Request, res: Response): Promise<void> {
    try {
      const { fileId } = req.params;
      
      const content = await this.fileService.getFileContent(fileId);
      
      res.json({
        success: true,
        content
      });
    } catch (error) {
      console.error('Error getting file content:', error);
      res.status(500).json({
        error: 'Failed to get file content',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
} 