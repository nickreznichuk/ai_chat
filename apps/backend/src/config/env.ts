// Environment configuration for the backend application
export const config = {
  // Server Configuration
  server: {
    port: parseInt(process.env.PORT || '3001', 10),
    nodeEnv: process.env.NODE_ENV || 'development',
  },
  
  // MongoDB Configuration
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/ai_chat',
    database: process.env.MONGODB_DATABASE || 'ai_chat',
  },
  
  // Ollama Configuration
  ollama: {
    baseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
    defaultModel: process.env.OLLAMA_DEFAULT_MODEL || 'gemma3n:latest',
  },
  
  // Whisper Configuration
  whisper: {
    path: process.env.WHISPER_PATH || 'whisper',
    modelPath: process.env.WHISPER_MODEL_PATH || './models/ggml-base.bin',
  },
  
  // CORS Configuration
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  },
  
  // API Configuration
  api: {
    prefix: process.env.API_PREFIX || '/api',
  },
  
  // Logging Configuration
  logging: {
    level: process.env.LOG_LEVEL || 'info',
  },
} as const;

export default config; 