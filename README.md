# AI Chat Frontend - Ollama Integration with Gemma3n

A modern AI chat application built with React, TypeScript, and Express, featuring integration with Ollama's Gemma3n model. The application includes chat management, real-time messaging, and a beautiful responsive UI.

## 🚀 Features

- **🤖 AI Integration**: Seamless integration with Ollama's Gemma3n model
- **💬 Chat Management**: Create, view, and manage multiple chat conversations
- **💾 Message Persistence**: All messages are stored in MongoDB
- **🎨 Modern UI**: Beautiful responsive design with Tailwind CSS
- **⚡ Real-time Updates**: Instant message updates with React Query
- **📱 Responsive Design**: Works perfectly on desktop and mobile devices
- **🔄 Auto-scroll**: Automatic scrolling to latest messages
- **🎯 Type Safety**: Full TypeScript support throughout the application

## 🏗️ Architecture

### Backend (Express + TypeScript)
- **Separate Message Model**: Optimized database structure with dedicated Message collection
- **RESTful API**: Clean API endpoints for chat management
- **MongoDB Integration**: Persistent storage with Mongoose ODM
- **Ollama Service**: Integration with local Ollama API
- **Error Handling**: Comprehensive error handling and validation

### Frontend (React + TypeScript)
- **React Query**: Efficient data fetching and caching
- **React Router**: Client-side routing for better UX
- **Tailwind CSS**: Modern, responsive styling
- **Custom Hooks**: Reusable API hooks for data management
- **Component Architecture**: Modular, maintainable components

## 📁 Project Structure

```
ai_frontend/
├── apps/
│   ├── backend/                    # Express.js backend server
│   │   ├── src/
│   │   │   ├── controllers/        # API route controllers
│   │   │   │   ├── chatController.ts
│   │   │   │   └── chatManagementController.ts
│   │   │   ├── models/             # MongoDB schemas
│   │   │   │   ├── Chat.ts
│   │   │   │   └── Message.ts
│   │   │   ├── services/           # Business logic services
│   │   │   │   ├── ollamaService.ts
│   │   │   │   ├── chatService.ts
│   │   │   │   └── messageService.ts
│   │   │   └── index.ts            # Server entry point
│   │   ├── package.json
│   │   └── tsconfig.json
│   ├── frontend/                   # React frontend application
│   │   ├── src/
│   │   │   ├── components/         # Reusable UI components
│   │   │   │   └── ChatSidebar.tsx
│   │   │   ├── hooks/              # Custom React hooks
│   │   │   │   └── useApi.ts
│   │   │   ├── pages/              # Page components
│   │   │   │   ├── ChatListPage.tsx
│   │   │   │   └── ChatPage.tsx
│   │   │   ├── services/           # API service layer
│   │   │   │   └── api.ts
│   │   │   ├── App.tsx             # Main application component
│   │   │   ├── index.css           # Global styles with Tailwind
│   │   │   └── main.tsx            # Application entry point
│   │   ├── package.json
│   │   ├── tailwind.config.js      # Tailwind CSS configuration
│   │   ├── postcss.config.js       # PostCSS configuration
│   │   └── tsconfig.json
│   └── shared/                     # Shared TypeScript types
│       ├── src/
│       │   └── types.ts            # Common type definitions
│       ├── package.json
│       └── tsconfig.json
├── package.json                    # Root package.json with workspaces
├── yarn.lock                       # Yarn lock file
└── README.md                       # This file
```

## 🛠️ Prerequisites

Before running this project, make sure you have the following installed:

- **Node.js** (v20.19.0 or higher)
- **Yarn** (v1.22.0 or higher)
- **MongoDB** (v6.0 or higher)
- **Ollama** (latest version)

## 📦 Installation

### 1. Install Ollama and Gemma3n Model

```bash
# Install Ollama (macOS)
curl -fsSL https://ollama.ai/install.sh | sh

# Download Gemma3n model
ollama pull gemma3n

# Start Ollama service
ollama serve
```

### 2. Install MongoDB

```bash
# macOS with Homebrew
brew tap mongodb/brew
brew install mongodb-community

# Start MongoDB service
brew services start mongodb-community
```

### 3. Clone and Setup Project

```bash
# Clone the repository
git clone <repository-url>
cd ai_frontend

# Install dependencies for all workspaces
yarn install
```

### 4. Environment Configuration

```bash
# Copy environment example files
cp apps/backend/.env.example apps/backend/.env
cp apps/frontend/.env.example apps/frontend/.env

# Customize the .env files according to your environment
# (Optional: modify ports, database URLs, etc.)
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

### Chat Features
- **Real-time Messaging**: Messages appear instantly
- **Auto-scroll**: Automatically scrolls to latest messages
- **Message History**: All conversations are preserved
- **Responsive Design**: Works on all device sizes

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

# Logging Configuration
LOG_LEVEL=info
```

#### Frontend Configuration

Create a `.env` file in the `apps/frontend` directory:

```env
# Frontend Configuration
VITE_API_BASE_URL=http://localhost:3001/api
VITE_APP_NAME=AI Chat Frontend
VITE_APP_VERSION=1.0.0

# Development Configuration
VITE_DEV_SERVER_PORT=5173
VITE_DEV_SERVER_HOST=localhost

# Feature Flags
VITE_ENABLE_DEBUG_MODE=false
VITE_ENABLE_ANALYTICS=false
```

### Environment Setup

1. **Copy example files**: Copy `.env.example` files to `.env` in both directories
2. **Customize settings**: Modify the values according to your environment
3. **Security**: Never commit `.env` files to version control (they're already in `.gitignore`)

### Tailwind CSS

The frontend uses Tailwind CSS with custom configurations:
- Custom animations for typing indicators
- Responsive design utilities
- Custom scrollbar styling

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
```

### Frontend Testing

Open the browser and navigate to `http://localhost:5173` to test the full application.

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

3. **Port conflicts**
   ```bash
   # Check what's using port 3001
   lsof -i :3001
   
   # Check what's using port 5173
   lsof -i :5173
   ```

4. **Node.js version issues**
   ```bash
   # Check Node.js version
   node --version
   
   # Use correct Node.js version
   nvm use default
   ```

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
- [React Query](https://tanstack.com/query) for efficient data fetching
- [Tailwind CSS](https://tailwindcss.com/) for the beautiful UI components 