#!/bin/bash

echo "🎤 Setting up Whisper.cpp for voice input..."

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo "❌ Git is not installed. Please install git first."
    exit 1
fi

# Check if make is installed
if ! command -v make &> /dev/null; then
    echo "❌ Make is not installed. Please install make first."
    exit 1
fi

# Clone whisper.cpp repository
echo "📥 Cloning whisper.cpp repository..."
if [ ! -d "whisper.cpp" ]; then
    git clone https://github.com/ggerganov/whisper.cpp.git
else
    echo "✅ whisper.cpp directory already exists"
fi

cd whisper.cpp

# Build whisper.cpp
echo "🔨 Building whisper.cpp..."
make

# Download a model (ggml-base.bin is a good balance of speed and accuracy)
echo "📥 Downloading whisper model (ggml-base.bin)..."
if [ ! -f "models/ggml-base.bin" ]; then
    bash ./models/download-ggml-model.sh base
else
    echo "✅ Model already exists"
fi

# Create models directory in backend if it doesn't exist
echo "📁 Setting up models directory..."
mkdir -p ../apps/backend/models

# Copy the model to the backend directory
echo "📋 Copying model to backend..."
cp models/ggml-base.bin ../apps/backend/models/

# Make whisper executable available globally
echo "🔗 Making whisper executable available..."
if [ ! -f "/usr/local/bin/whisper" ]; then
    sudo cp main /usr/local/bin/whisper
    echo "✅ Whisper executable installed globally"
else
    echo "✅ Whisper executable already exists"
fi

cd ..

echo "✅ Whisper.cpp setup complete!"
echo ""
echo "📝 Next steps:"
echo "1. Add the following to your backend .env file:"
echo "   WHISPER_PATH=whisper"
echo "   WHISPER_MODEL_PATH=./models/ggml-base.bin"
echo ""
echo "2. Restart your backend server"
echo "3. Test voice input in the chat interface"
echo ""
echo "🎤 Voice input is now ready to use!" 