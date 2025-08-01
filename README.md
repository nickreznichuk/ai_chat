# AI Chat Frontend - Ollama Integration with Gemma3n

A modern AI chat application built with React, TypeScript, and Express, featuring integration with Ollama's Gemma3n model. The application includes chat management, real-time messaging, voice input with automatic transcription, and a beautiful responsive UI.

## ✨ Features

### 🤖 AI Chat
- **Local AI Integration**: Powered by Ollama with Gemma3n model
- **Real-time Conversations**: Interactive chat interface with streaming responses
- **Markdown Support**: AI responses are rendered in beautiful Markdown format with syntax highlighting
- **Two-step Message Handling**: Separate message sending and response generation for better UX
- **Message Status Tracking**: Visual indicators for message states (sending, generating, completed, error)
- **Function Calling**: Automatic detection and execution of functions from natural language

### 📄 Document Analysis (RAG System)
- **File Upload**: Upload PDF documents and images for AI processing
- **General File Processing**: AI automatically analyzes and processes uploaded files
- **RAG Queries**: Ask specific questions about uploaded documents using AI-powered search
- **Cross-File Search**: Search across all uploaded documents simultaneously
- **File Statistics**: View detailed statistics about uploaded files
- **Metadata Management**: Add titles, descriptions, and tags to files
- **Separate RAG Interface**: Dedicated button for document queries with context-aware responses

### 🎤 Voice Input
- **Speech-to-Text**: Local voice transcription using Whisper.cpp
- **Auto-send**: Transcribed text automatically sent to chat
- **Visual Feedback**: Recording and processing animations
- **Background Processing**: Non-blocking audio transcription

### 🔧 Function Calling
- **Weather Information**: Get current weather for any location
- **Email Sending**: Send emails to specified recipients
- **Calendar Events**: Add events to user's calendar
- **File Operations**: List and search through uploaded files
- **Natural Language Parsing**: Automatic function detection from user messages
- **Real-time Execution**: Functions execute immediately when detected
- **Visual Results**: Function calls and results displayed in chat interface

### 💬 Chat Management
- **Persistent Storage**: All conversations saved to MongoDB
- **Chat History**: Browse and switch between previous conversations
- **Sidebar Navigation**: Collapsible sidebar for easy chat switching
- **Chat Operations**: Create, update, and delete chats

### 🎨 Modern UI/UX
- **Responsive Design**: Works seamlessly on desktop and mobile
- **Tailwind CSS**: Beautiful, modern styling with utility-first approach
- **Loading States**: Skeleton loaders and spinners for smooth UX
- **Dark Mode Ready**: Clean, accessible interface design

### 🔧 Technical Features
- **TypeScript**: Full type safety across frontend and backend
- **React Query**: Efficient data fetching and caching
- **Modular Architecture**: Organized code structure with separate routes and services
- **Environment Configuration**: Centralized configuration management
- **Error Handling**: Comprehensive error handling and user feedback

## 📁 Project Structure

```
ai_frontend/
├── apps/
│   ├── backend/                    # Express.js backend server
│   │   ├── src/
│   │   │   ├── controllers/        # API route controllers
│   │   │   │   ├── chatController.ts
│   │   │   │   ├── chatManagementController.ts
│   │   │   │   └── voiceController.ts
│   │   │   ├── models/             # MongoDB schemas
│   │   │   │   ├── Chat.ts
│   │   │   │   └── Message.ts
│   │   │   ├── routes/             # API route definitions
│   │   │   │   ├── chatRoutes.ts
│   │   │   │   ├── chatManagementRoutes.ts
│   │   │   │   ├── voiceRoutes.ts
│   │   │   │   └── healthRoutes.ts
│   │   │   ├── services/           # Business logic services
│   │   │   │   ├── ollamaService.ts
│   │   │   │   ├── chatService.ts
│   │   │   │   └── messageService.ts
│   │   │   ├── config/             # Configuration management
│   │   │   │   └── env.ts
│   │   │   ├── temp/               # Temporary files for voice processing
│   │   │   ├── models/             # Whisper model files
│   │   │   │   └── ggml-base.bin
│   │   │   └── index.ts            # Server entry point
│   │   ├── package.json
│   │   ├── .env.example
│   │   └── tsconfig.json
│   ├── frontend/                   # React frontend application
│   │   ├── src/
│   │   │   ├── components/         # Reusable UI components
│   │   │   │   ├── ChatSidebar.tsx
│   │   │   │   ├── VoiceInput.tsx
│   │   │   │   ├── LoadingSpinner.tsx
│   │   │   │   └── SkeletonLoader.tsx
│   │   │   ├── hooks/              # Custom React hooks
│   │   │   │   └── useApi.ts
│   │   │   ├── pages/              # Page components
│   │   │   │   ├── ChatListPage.tsx
│   │   │   │   └── ChatPage.tsx
│   │   │   ├── services/           # API service layer
│   │   │   │   └── api.ts
│   │   │   ├── config/             # Configuration management
│   │   │   │   └── env.ts
│   │   │   ├── App.tsx             # Main application component
│   │   │   ├── index.css           # Global styles with Tailwind
│   │   │   └── main.tsx            # Application entry point
│   │   ├── package.json
│   │   ├── .env.example
│   │   ├── tailwind.config.js      # Tailwind CSS configuration
│   │   ├── postcss.config.js       # PostCSS configuration
│   │   └── tsconfig.json
│   └── shared/                     # Shared TypeScript types
│       ├── src/
│       │   └── types.ts            # Common type definitions
│       ├── package.json
│       └── tsconfig.json
├── setup-whisper.sh                # Whisper.cpp installation script
├── package.json                    # Root package.json with workspaces
├── yarn.lock                       # Yarn lock file
└── README.md                       # This file
```

## 🛠️ Prerequisites

Before running this project, make sure you have the following installed:

- **Node.js** (v22.12.0 or higher)
- **Yarn** (v1.22.0 or higher)
- **MongoDB** (v6.0 or higher)
- **Ollama** (latest version)
- **FFmpeg** (for audio processing)
- **Git** and **Make** (for Whisper.cpp installation)
- **CMake** (for building Whisper.cpp)

## 📦 Installation

### 1. Install System Dependencies

```bash
# Install FFmpeg (macOS)
brew install ffmpeg

# Install CMake (required for Whisper.cpp)
brew install cmake
```

### 2. Install Ollama and Gemma3n Model

```bash
# Install Ollama (macOS)
curl -fsSL https://ollama.ai/install.sh | sh

# Download Gemma3n model
ollama pull gemma3n

# Start Ollama service
ollama serve
```

### 3. Install Whisper.cpp for Voice Input

```bash
# Run the setup script (requires sudo for global installation)
./setup-whisper.sh
```

**Note**: The setup script will:
- Clone and build whisper.cpp
- Download the ggml-base.bin model (~150MB)
- Install the whisper executable globally (`/usr/local/bin/whisper`)
- Copy the model to `apps/backend/models/`

### 4. Install MongoDB

```bash
# macOS with Homebrew
brew tap mongodb/brew
brew install mongodb-community

# Start MongoDB service
brew services start mongodb-community
```

### 5. Clone and Setup Project

```bash
# Clone the repository
git clone <repository-url>
cd ai_frontend

# Install dependencies for all workspaces
yarn install
```

### 6. Environment Configuration

Create environment files for both frontend and backend:

**Backend (.env):**
```bash
# Server Configuration
PORT=3001
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/ai_chat
MONGODB_DATABASE=ai_chat

# Ollama Configuration
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_DEFAULT_MODEL=gemma3n:latest

# CORS Configuration
CORS_ORIGIN=http://localhost:5173

# API Configuration
API_PREFIX=/api

# Whisper Configuration
WHISPER_PATH=whisper
WHISPER_MODEL_PATH=./models/ggml-base.bin

# Logging Configuration
LOG_LEVEL=info
```

**Frontend (.env):**
```bash
# API Configuration
VITE_API_BASE_URL=http://localhost:3001/api

# App Configuration
VITE_APP_NAME=AI Chat
VITE_APP_VERSION=1.0.0

# Development Configuration
VITE_DEV_SERVER_PORT=5173
VITE_DEV_SERVER_HOST=localhost
VITE_ENABLE_DEBUG_MODE=true
VITE_ENABLE_ANALYTICS=false
```

## 🚀 Running the Application

### 1. Start the Backend Server

```bash
# Navigate to backend directory
cd apps/backend

# Start development server
yarn dev
```

The backend will start on `http://localhost:3001`

### 2. Start the Frontend Application

```bash
# Navigate to frontend directory (in a new terminal)
cd apps/frontend

# Start development server
yarn dev
```

The frontend will start on `http://localhost:5173`

### 3. Verify Services

Check that all services are running:

```bash
# Check backend health
curl http://localhost:3001/health

# Check Ollama status
curl http://localhost:11434/api/tags

# Check voice service status
curl http://localhost:3001/api/voice/status

# Check MongoDB connection
# (MongoDB should be running on default port 27017)
```

## 🔧 API Endpoints

### Chat Management
- `GET /api/chats` - Get all chats
- `GET /api/chats/:id` - Get specific chat with messages
- `POST /api/chats` - Create new chat
- `PUT /api/chats/:id` - Update chat
- `DELETE /api/chats/:id` - Delete chat

### Messaging
- `POST /api/chat` - Legacy chat endpoint (backward compatibility)
- `POST /api/messages/send` - Send message and save to database
- `POST /api/messages/generate-response` - Generate AI response for a message
- `GET /api/status` - Check Ollama service status

### Voice Input
- `POST /api/voice/transcribe` - Transcribe audio to text
- `GET /api/voice/status` - Check Whisper service status

### File Management
- `POST /api/files/upload` - Upload PDF file
- `POST /api/files/:fileId/process` - Process PDF and generate embeddings
- `POST /api/files/:fileId/search` - Search for relevant chunks in document
- `GET /api/chats/:chatId/files` - Get files for specific chat
- `DELETE /api/files/:fileId` - Delete file
- `GET /api/chats/:chatId/files/stats` - Get file statistics for chat
- `POST /api/chats/:chatId/files/search` - Search across all files in chat
- `PUT /api/files/:fileId/metadata` - Update file metadata
- `GET /api/files/:fileId/content` - Get file content and chunks

### Function Calling
- `GET /api/functions` - Get available functions
- `POST /api/functions/execute` - Execute a specific function
- `POST /api/functions/parse` - Parse text and execute detected functions

### Health Check
- `GET /health` - Server health status

## 🎯 Usage

### Starting the Application
1. **Start Backend**: `cd apps/backend && yarn dev`
2. **Start Frontend**: `cd apps/frontend && yarn dev`
3. **Access Application**: Open `http://localhost:5173` in your browser

### Basic Chat Features
- **New Chat**: Click "New Chat" to start a conversation
- **Send Messages**: Type your message and press Enter or click the send button
- **Voice Input**: Click the microphone icon to record and transcribe voice messages
- **Chat History**: Use the sidebar to switch between different conversations

### Document Analysis
1. **Upload PDF**: Drag and drop a PDF file or click to browse
2. **Process Document**: Click "Process" to extract text and generate searchable chunks
3. **Ask Questions**: Click "Ask Question" to query the document content
4. **AI Responses**: Get context-aware answers based on document content

### Function Calling
- **Weather**: Type "погода в Києві" to get current weather
- **Email**: Type "відправити емейл на user@example.com з темою Test" to send an email
- **Calendar**: Type "додати зустріч з назвою Team Meeting" to create a calendar event
- **Files**: Type "показати файли" to list uploaded documents
- **Search**: Type "знайти в файлах AI" to search across all documents

### Voice Input
- **Recording**: Click and hold the microphone button to record
- **Auto-send**: Transcribed text is automatically sent to the chat
- **Visual Feedback**: Watch the recording animation and processing indicators

### File Management
1. **Upload Files**: Click the upload button (📁) next to the text input to upload PDFs or images
2. **General Processing**: Files are automatically processed by AI for general analysis
3. **RAG Queries**: Click the query button (🔍) to ask specific questions about your documents
4. **View Files**: See all uploaded documents in the chat interface
5. **Process Files**: Convert files to searchable content
6. **Delete Files**: Remove files you no longer need
7. **Search Content**: Ask questions about specific documents
8. **Cross-File Search**: Search across all documents simultaneously
9. **File Statistics**: View detailed information about your documents

## 🔧 Configuration

### Environment Variables

#### Backend Configuration

Create a `.env` file in the `apps/backend` directory:

```env
# Server Configuration
PORT=3001
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/ai_chat
MONGODB_DATABASE=ai_chat

# Ollama Configuration
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_DEFAULT_MODEL=gemma3n:latest

# CORS Configuration
CORS_ORIGIN=http://localhost:5173

# API Configuration
API_PREFIX=/api

# Whisper Configuration
WHISPER_PATH=whisper
WHISPER_MODEL_PATH=./models/ggml-base.bin

# Logging Configuration
LOG_LEVEL=info
```

#### Frontend Configuration

Create a `.env` file in the `apps/frontend` directory:

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:3001/api

# App Configuration
VITE_APP_NAME=AI Chat
VITE_APP_VERSION=1.0.0

# Development Configuration
VITE_DEV_SERVER_PORT=5173
VITE_DEV_SERVER_HOST=localhost
VITE_ENABLE_DEBUG_MODE=true
VITE_ENABLE_ANALYTICS=false
```

### Environment Setup

1. **Copy example files**: Copy `.env.example` files to `.env` in both directories
2. **Customize settings**: Modify the values according to your environment
3. **Security**: Never commit `.env` files to version control (they're already in `.gitignore`)

### Tailwind CSS

The frontend uses Tailwind CSS with custom configurations:
- Custom animations for voice input and typing indicators
- Responsive design utilities
- Custom scrollbar styling
- Voice input animations (pulse, bounce effects)

## 🧪 Testing

### Backend API Testing

```bash
# Test chat creation
curl -X POST http://localhost:3001/api/chats \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Chat","model":"gemma3n:latest"}'

# Test message sending
curl -X POST http://localhost:3001/api/chat \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"Hello!"}],"model":"gemma3n:latest","chatId":"YOUR_CHAT_ID"}'

# Test voice service status
curl http://localhost:3001/api/voice/status
```

### Frontend Testing

Open the browser and navigate to `http://localhost:5173` to test the full application.

### Voice Input Testing

1. **Microphone Access**: Allow microphone access when prompted
2. **Recording**: Click the microphone button and speak
3. **Transcription**: Watch the animation during processing
4. **Auto-send**: Verify the message is automatically sent

## 🐛 Troubleshooting

### Common Issues

1. **Ollama not responding**
   ```bash
   # Check if Ollama is running
   ollama list
   
   # Restart Ollama service
   ollama serve
   ```

2. **MongoDB connection issues**
   ```bash
   # Check MongoDB status
   brew services list | grep mongodb
   
   # Restart MongoDB
   brew services restart mongodb-community
   ```

3. **Voice input not working**
   ```bash
   # Check if whisper is installed
   which whisper
   
   # Check if FFmpeg is installed
   which ffmpeg
   
   # Check voice service status
   curl http://localhost:3001/api/voice/status
   ```

4. **Port conflicts**
   ```bash
   # Check what's using port 3001
   lsof -i :3001
   
   # Check what's using port 5173
   lsof -i :5173
   ```

5. **Node.js version issues**
   ```bash
   # Check Node.js version
   node --version
   
   # Use correct Node.js version
   nvm use default
   ```

6. **Whisper.cpp build issues**
   ```bash
   # Reinstall whisper.cpp
   cd whisper.cpp
   make clean
   make
   sudo cp build/bin/whisper-cli /usr/local/bin/whisper
   ```

### Voice Input Troubleshooting

1. **Microphone not accessible**
   - Check browser permissions
   - Ensure HTTPS in production (required for microphone access)
   - Try refreshing the page

2. **Transcription fails**
   - Check if whisper executable is in PATH
   - Verify model file exists in `apps/backend/models/`
   - Check backend logs for FFmpeg errors

3. **Audio format issues**
   - Backend automatically converts WebM to WAV
   - Ensure FFmpeg is properly installed
   - Check temporary file permissions

## 🔮 Future Enhancements

- [ ] Real-time streaming responses
- [ ] WebSocket support for live chat
- [ ] Message search functionality
- [ ] Chat export/import features
- [ ] User authentication
- [ ] Multiple AI model support
- [ ] Message reactions and editing
- [ ] File upload support
- [ ] Dark mode theme
- [ ] Chat categories and tags
- [ ] Voice output (text-to-speech)
- [ ] Multiple language support for voice input
- [ ] Voice command recognition

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Ollama](https://ollama.ai/) for providing the local AI model infrastructure
- [Gemma3n](https://huggingface.co/google/gemma-3n-6b) model by Google
- [Whisper.cpp](https://github.com/ggerganov/whisper.cpp) for speech-to-text functionality
- [FFmpeg](https://ffmpeg.org/) for audio processing
- [React Query](https://tanstack.com/query) for efficient data fetching
- [Tailwind CSS](https://tailwindcss.com/) for the beautiful UI components 