import { Router } from 'express';
import mongoose from 'mongoose';
import { config } from '../config/env';

const router = Router();

// Health check route
router.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    environment: config.server.nodeEnv,
    port: config.server.port
  });
});

export default router; 