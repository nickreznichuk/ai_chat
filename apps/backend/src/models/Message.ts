import mongoose, { Schema, Document } from 'mongoose';

export interface IMessage extends Document {
  chatId: mongoose.Types.ObjectId;
  role: 'user' | 'assistant';
  content: string;
  created_at: Date;
}

const MessageSchema = new Schema({
  chatId: {
    type: Schema.Types.ObjectId,
    ref: 'Chat',
    required: true,
    index: true
  },
  role: {
    type: String,
    enum: ['user', 'assistant'],
    required: true
  },
  content: {
    type: String,
    required: true
  }
}, {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: false // We don't need updated_at for messages
  }
});

// Index for efficient querying
MessageSchema.index({ chatId: 1, created_at: 1 });

export const Message = mongoose.model<IMessage>('Message', MessageSchema); 