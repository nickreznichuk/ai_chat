// Environment configuration for the frontend application
export const config = {
  // API Configuration
  api: {
    baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api',
  },
  
  // Application Configuration
  app: {
    name: import.meta.env.VITE_APP_NAME || 'AI Chat Frontend',
    version: import.meta.env.VITE_APP_VERSION || '1.0.0',
  },
  
  // Development Configuration
  dev: {
    serverPort: import.meta.env.VITE_DEV_SERVER_PORT || '5173',
    serverHost: import.meta.env.VITE_DEV_SERVER_HOST || 'localhost',
  },
  
  // Feature Flags
  features: {
    debugMode: import.meta.env.VITE_ENABLE_DEBUG_MODE === 'true',
    analytics: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
  },
  
  // Environment
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
} as const;

export default config; 