import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { ChatController } from './controllers/chatController';
import { ChatManagementController } from './controllers/chatManagementController';
import { VoiceController } from './controllers/voiceController';
import { config } from './config/env';

// Load environment variables
require('dotenv').config();

const app = express();
const chatController = new ChatController();
const chatManagementController = new ChatManagementController();
const voiceController = new VoiceController();

// Middleware
app.use(cors());

// Increase JSON body size limit for audio data
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Connect to MongoDB
mongoose.connect(config.mongodb.uri)
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
  });

// Chat routes
app.post(`${config.api.prefix}/chat`, (req, res) => chatController.handleChat(req, res));
app.get(`${config.api.prefix}/status`, (req, res) => chatController.checkStatus(req, res));

// Chat management routes
app.get(`${config.api.prefix}/chats`, (req, res) => chatManagementController.getAllChats(req, res));
app.get(`${config.api.prefix}/chats/:id`, (req, res) => chatManagementController.getChatById(req, res));
app.post(`${config.api.prefix}/chats`, (req, res) => chatManagementController.createChat(req, res));
app.put(`${config.api.prefix}/chats/:id`, (req, res) => chatManagementController.updateChat(req, res));
app.delete(`${config.api.prefix}/chats/:id`, (req, res) => chatManagementController.deleteChat(req, res));

// Voice input routes
app.post(`${config.api.prefix}/voice/transcribe`, (req, res) => voiceController.transcribeAudio(req, res));
app.get(`${config.api.prefix}/voice/status`, (req, res) => voiceController.checkWhisperStatus(req, res));

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    environment: config.server.nodeEnv,
    port: config.server.port
  });
});

app.listen(config.server.port, () => {
  console.log(`Server running on http://localhost:${config.server.port}`);
});
