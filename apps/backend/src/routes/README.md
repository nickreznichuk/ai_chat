# Backend Routes Structure

This directory contains all the route definitions for the backend API, organized by functionality.

## Route Files

### `chatRoutes.ts`
Handles chat messaging functionality:
- `POST /api/chat` - Legacy chat endpoint (backward compatibility)
- `POST /api/messages/send` - Send message and save to database
- `POST /api/messages/generate-response` - Generate AI response for a message
- `GET /api/status` - Check Ollama service status

### `chatManagementRoutes.ts`
Handles chat management operations:
- `GET /api/chats` - Get all chats
- `GET /api/chats/:id` - Get specific chat with messages
- `POST /api/chats` - Create new chat
- `PUT /api/chats/:id` - Update chat
- `DELETE /api/chats/:id` - Delete chat

### `voiceRoutes.ts`
Handles voice input functionality:
- `POST /api/voice/transcribe` - Transcribe audio to text
- `GET /api/voice/status` - Check Whisper service status

### `healthRoutes.ts`
Handles health monitoring:
- `GET /health` - Server health status (no API prefix)

## Usage

Routes are imported and used in the main `index.ts` file:

```typescript
// API routes with prefix
app.use(`${config.api.prefix}`, chatRoutes);
app.use(`${config.api.prefix}`, chatManagementRoutes);
app.use(`${config.api.prefix}`, voiceRoutes);

// Health check route (no prefix)
app.use('/', healthRoutes);
```

## Benefits

- **Modularity**: Each route file handles a specific domain
- **Maintainability**: Easy to find and modify specific routes
- **Scalability**: Easy to add new route files for new features
- **Testing**: Routes can be tested independently
- **Documentation**: Clear separation of concerns 