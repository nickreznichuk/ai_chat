import { File, IFile } from '../models/File';
import * as fs from 'fs';
import * as path from 'path';

export class FileService {
  async uploadFile(file: Express.Multer.File, chatId?: string): Promise<IFile> {
    const fileDoc = new File({
      filename: file.filename,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      path: file.path,
      chatId: chatId
    });

    return await fileDoc.save();
  }

  async processPDF(fileId: string): Promise<{ chunks: string[], embeddings: number[][] }> {
    const file = await File.findById(fileId);
    if (!file) {
      throw new Error('File not found');
    }

    if (file.mimeType !== 'application/pdf') {
      throw new Error('File is not a PDF');
    }

    // For now, we'll create simple chunks without PDF parsing
    // In a real implementation, you would use pdf-parse here
    const mockText = `This is a mock PDF content for file ${file.originalName}. 
    In a real implementation, this would be the actual text extracted from the PDF.
    The text would be split into meaningful chunks for vector search.
    
    This document contains information about various topics that users might ask about.
    It includes sections on technology, business, and general knowledge.
    Each section provides detailed information that can be searched and retrieved.`;
    
    // Split text into chunks
    const chunks = this.splitTextIntoChunks(mockText, 1000);
    
    // Create mock embeddings (in real implementation, use TensorFlow)
    const embeddings = chunks.map(() => Array(512).fill(0).map(() => Math.random()));

    // Update file with chunks and embeddings
    file.chunks = chunks;
    file.embeddings = embeddings;
    await file.save();

    return { chunks, embeddings };
  }

  private splitTextIntoChunks(text: string, maxChunkSize: number): string[] {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const chunks: string[] = [];
    let currentChunk = '';

    for (const sentence of sentences) {
      const trimmedSentence = sentence.trim();
      if (currentChunk.length + trimmedSentence.length > maxChunkSize) {
        if (currentChunk.length > 0) {
          chunks.push(currentChunk.trim());
          currentChunk = trimmedSentence;
        } else {
          // If a single sentence is too long, split it
          const words = trimmedSentence.split(' ');
          let tempChunk = '';
          for (const word of words) {
            if (tempChunk.length + word.length > maxChunkSize) {
              if (tempChunk.length > 0) {
                chunks.push(tempChunk.trim());
                tempChunk = word;
              } else {
                chunks.push(word);
              }
            } else {
              tempChunk += (tempChunk ? ' ' : '') + word;
            }
          }
          if (tempChunk.length > 0) {
            currentChunk = tempChunk;
          }
        }
      } else {
        currentChunk += (currentChunk ? '. ' : '') + trimmedSentence;
      }
    }

    if (currentChunk.length > 0) {
      chunks.push(currentChunk.trim());
    }

    return chunks;
  }

  async searchSimilarChunks(query: string, fileId: string, topK: number = 3): Promise<string[]> {
    const file = await File.findById(fileId);
    if (!file || !file.embeddings || !file.chunks) {
      throw new Error('File not found or not processed');
    }

    // For now, return random chunks (in real implementation, use vector similarity)
    const shuffled = [...file.chunks].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.min(topK, shuffled.length));
  }

  async getFilesByChatId(chatId: string): Promise<IFile[]> {
    return await File.find({ chatId }).sort({ created_at: -1 });
  }

  async deleteFile(fileId: string): Promise<void> {
    const file = await File.findById(fileId);
    if (file) {
      // Delete physical file
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
      // Delete from database
      await File.findByIdAndDelete(fileId);
    }
  }

  // New methods for enhanced file operations
  async getFileStats(chatId: string): Promise<{
    totalFiles: number;
    totalSize: number;
    processedFiles: number;
    fileTypes: Record<string, number>;
  }> {
    const files = await this.getFilesByChatId(chatId);
    
    const stats = {
      totalFiles: files.length,
      totalSize: files.reduce((sum, file) => sum + file.size, 0),
      processedFiles: files.filter(file => file.chunks && file.chunks.length > 0).length,
      fileTypes: {} as Record<string, number>
    };

    files.forEach(file => {
      const ext = path.extname(file.originalName).toLowerCase();
      stats.fileTypes[ext] = (stats.fileTypes[ext] || 0) + 1;
    });

    return stats;
  }

  async searchAcrossAllFiles(chatId: string, query: string, topK: number = 5): Promise<Array<{
    fileId: string;
    fileName: string;
    chunks: string[];
    relevance: number;
  }>> {
    const files = await this.getFilesByChatId(chatId);
    const results = [];

    for (const file of files) {
      if (file.chunks && file.chunks.length > 0) {
        try {
          const chunks = await this.searchSimilarChunks(query, file._id?.toString() || '', topK);
          results.push({
            fileId: file._id?.toString() || '',
            fileName: file.originalName,
            chunks,
            relevance: Math.random() // In real implementation, calculate actual relevance
          });
        } catch (error) {
          console.error(`Error searching file ${file._id}:`, error);
        }
      }
    }

    // Sort by relevance
    results.sort((a, b) => b.relevance - a.relevance);
    return results.slice(0, topK);
  }

  async updateFileMetadata(fileId: string, metadata: {
    title?: string;
    description?: string;
    tags?: string[];
  }): Promise<IFile> {
    const file = await File.findById(fileId);
    if (!file) {
      throw new Error('File not found');
    }

    // Add metadata fields to the file
    Object.assign(file, metadata);
    return await file.save();
  }

  async getFileContent(fileId: string): Promise<{
    content: string;
    chunks: string[];
    metadata: any;
  }> {
    const file = await File.findById(fileId);
    if (!file) {
      throw new Error('File not found');
    }

    return {
      content: file.chunks ? file.chunks.join('\n\n') : '',
      chunks: file.chunks || [],
      metadata: {
        id: file._id,
        name: file.originalName,
        size: file.size,
        uploadedAt: file.created_at,
        processed: !!file.chunks && file.chunks.length > 0
      }
    };
  }
} 