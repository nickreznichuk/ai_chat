import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { statusApi, chatApi, chatManagementApi, messageApi } from '../services/api';
import type { 
  Message, 
  CreateChatRequest, 
  UpdateChatRequest,
  SendMessageRequest,
  GenerateResponseRequest
} from 'shared/src/types';

// Query keys
export const queryKeys = {
  status: ['status'],
  chats: ['chats'],
  chat: (id: string) => ['chat', id],
} as const;

// Status hooks
export const useStatus = () => {
  return useQuery({
    queryKey: queryKeys.status,
    queryFn: statusApi.checkStatus,
    refetchInterval: 30000, // Refetch every 30 seconds
  });
};

// Chat management hooks
export const useChats = () => {
  return useQuery({
    queryKey: queryKeys.chats,
    queryFn: chatManagementApi.getAllChats,
  });
};

export const useChat = (id: string | null) => {
  return useQuery({
    queryKey: queryKeys.chat(id!),
    queryFn: () => chatManagementApi.getChatById(id!),
    enabled: !!id,
  });
};

export const useCreateChat = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateChatRequest) => chatManagementApi.createChat(data),
    onSuccess: () => {
      // Invalidate and refetch chats list
      queryClient.invalidateQueries({ queryKey: queryKeys.chats });
    },
  });
};

export const useUpdateChat = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateChatRequest }) =>
      chatManagementApi.updateChat(id, data),
    onSuccess: (_, { id }) => {
      // Invalidate specific chat and chats list
      queryClient.invalidateQueries({ queryKey: queryKeys.chat(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.chats });
    },
  });
};

export const useDeleteChat = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => chatManagementApi.deleteChat(id),
    onSuccess: () => {
      // Invalidate chats list
      queryClient.invalidateQueries({ queryKey: queryKeys.chats });
    },
  });
};

// Legacy chat message hook (for backward compatibility)
export const useSendMessage = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: {
      messages: Message[];
      model?: string;
      chatId?: string;
      options?: any;
    }) => chatApi.sendMessage(data),
    onSuccess: (_, { chatId }) => {
      if (chatId) {
        // Invalidate specific chat to refetch messages
        queryClient.invalidateQueries({ queryKey: queryKeys.chat(chatId) });
      }
      // Invalidate chats list to update timestamps
      queryClient.invalidateQueries({ queryKey: queryKeys.chats });
    },
  });
};

// New message handling hooks
export const useSendMessageNew = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: SendMessageRequest) => messageApi.sendMessage(data),
    onSuccess: (_, { chatId }) => {
      if (chatId) {
        // Invalidate specific chat to refetch messages
        queryClient.invalidateQueries({ queryKey: queryKeys.chat(chatId) });
      }
      // Invalidate chats list to update timestamps
      queryClient.invalidateQueries({ queryKey: queryKeys.chats });
    },
  });
};

export const useGenerateResponse = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: GenerateResponseRequest) => messageApi.generateResponse(data),
    onSuccess: (_, { chatId }) => {
      if (chatId) {
        // Invalidate specific chat to refetch messages
        queryClient.invalidateQueries({ queryKey: queryKeys.chat(chatId) });
      }
      // Invalidate chats list to update timestamps
      queryClient.invalidateQueries({ queryKey: queryKeys.chats });
    },
  });
}; 