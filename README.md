# AI Chat Frontend - Ollama Integration with Gemma3n

A modern AI chat application built with React, TypeScript, and Express, featuring integration with Ollama's Gemma3n model. The application includes chat management, real-time messaging, voice input with automatic transcription, and a beautiful responsive UI.

## 🚀 Features

- **🤖 AI Integration**: Seamless integration with Ollama's Gemma3n model
- **🎤 Voice Input**: Speech-to-text functionality using Whisper.cpp with automatic message sending
- **💬 Chat Management**: Create, view, and manage multiple chat conversations
- **💾 Message Persistence**: All messages are stored in MongoDB with optimized database structure
- **🎨 Modern UI**: Beautiful responsive design with Tailwind CSS and custom animations
- **⚡ Real-time Updates**: Instant message updates with React Query
- **📱 Responsive Design**: Works perfectly on desktop and mobile devices
- **🔄 Auto-scroll**: Automatic scrolling to latest messages
- **🎯 Type Safety**: Full TypeScript support throughout the application
- **🎵 Voice Animations**: Beautiful animations during recording and transcription
- **🚀 Auto-send**: Voice messages are automatically sent after transcription

## 🏗️ Architecture

### Backend (Express + TypeScript)
- **Modular Route Structure**: Organized routes in separate files for better maintainability
- **Separate Message Model**: Optimized database structure with dedicated Message collection
- **RESTful API**: Clean API endpoints for chat management and voice processing
- **MongoDB Integration**: Persistent storage with Mongoose ODM
- **Ollama Service**: Integration with local Ollama API
- **Voice Processing**: FFmpeg integration for audio conversion and Whisper.cpp for transcription
- **Error Handling**: Comprehensive error handling and validation

### Frontend (React + TypeScript)
- **React Query**: Efficient data fetching and caching
- **React Router**: Client-side routing for better UX
- **Tailwind CSS**: Modern, responsive styling with custom animations
- **Custom Hooks**: Reusable API hooks for data management
- **Component Architecture**: Modular, maintainable components
- **Voice Input**: Web Audio API integration with MediaRecorder

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

### Chat Messaging
- `POST /api/chat` - Send message to AI model
- `GET /api/status` - Check Ollama service status

### Voice Input
- `POST /api/voice/transcribe` - Transcribe audio to text
- `GET /api/voice/status` - Check Whisper service status

### Health Check
- `GET /health` - Server health status

## 🎯 Usage

### Creating a New Chat
1. Open the application at `http://localhost:5173`
2. Click "New Chat" button
3. Start typing your message
4. Press Enter or click the send button

### Managing Chats
- **View Chats**: All your conversations are listed on the main page
- **Switch Chats**: Click on any chat to continue the conversation
- **Delete Chats**: Hover over a chat and click the delete icon
- **Auto-save**: Messages are automatically saved to the database

### Voice Input Features
- **🎤 Start Recording**: Click the microphone button to start recording
- **⏱️ Recording Duration**: See how long you've been recording
- **🔄 Auto-stop**: Recording automatically stops after 30 seconds
- **🎵 Audio Processing**: WebM audio is converted to WAV for better compatibility
- **📝 Automatic Transcription**: Speech is converted to text using Whisper.cpp
- **🚀 Auto-send**: Transcribed text is automatically sent as a message
- **✨ Beautiful Animations**: Visual feedback during recording and processing

### Chat Features
- **Real-time Messaging**: Messages appear instantly
- **Auto-scroll**: Automatically scrolls to latest messages
- **Voice Input**: Full voice-to-text functionality with automatic sending
- **Message History**: All conversations are preserved
- **Responsive Design**: Works on all device sizes
- **Loading States**: Skeleton loaders and spinners for better UX

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