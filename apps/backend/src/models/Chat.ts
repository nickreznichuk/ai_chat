import mongoose, { Schema, Document } from 'mongoose';
import { config } from '../config/env';

export interface IChat extends Document {
  title: string;
  modelName: string;
  created_at: Date;
  updated_at: Date;
}

const ChatSchema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  modelName: {
    type: String,
    default: config.ollama.defaultModel
  }
}, {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
});

export const Chat = mongoose.model<IChat>('Chat', ChatSchema); 