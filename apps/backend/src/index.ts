import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { config } from './config/env';

// Import route files
import chatRoutes from './routes/chatRoutes';
import chatManagementRoutes from './routes/chatManagementRoutes';
import voiceRoutes from './routes/voiceRoutes';
import healthRoutes from './routes/healthRoutes';

// Load environment variables
require('dotenv').config();

const app = express();

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

// API routes
app.use(`${config.api.prefix}`, chatRoutes);
app.use(`${config.api.prefix}`, chatManagementRoutes);
app.use(`${config.api.prefix}`, voiceRoutes);

// Health check route (no prefix)
app.use('/', healthRoutes);

app.listen(config.server.port, () => {
  console.log(`Server running on http://localhost:${config.server.port}`);
});
