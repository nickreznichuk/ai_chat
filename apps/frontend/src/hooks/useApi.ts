import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { statusApi, chatApi, chatManagementApi, messageApi, fileApi, functionApi } from '../services/api';
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
  files: (chatId?: string | null) => ['files', chatId],
  fileStats: (chatId?: string | null) => ['fileStats', chatId],
  functions: ['functions'],
};

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

// File hooks
export const useFilesByChat = (chatId: string | null) => {
  return useQuery({
    queryKey: queryKeys.files(chatId),
    queryFn: () => fileApi.getFilesByChat(chatId!),
    enabled: !!chatId,
  });
};

export const useUploadFile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ file, chatId }: { file: File; chatId?: string }) => fileApi.uploadFile(file, chatId),
    onSuccess: (_, { chatId }) => {
      if (chatId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.files(chatId) });
      }
    },
  });
};

export const useProcessFile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (fileId: string) => fileApi.processFile(fileId),
    onSuccess: (_, fileId) => {
      // Invalidate files query to refresh file status
      queryClient.invalidateQueries({ queryKey: queryKeys.files });
    },
  });
};

export const useDeleteFile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (fileId: string) => fileApi.deleteFile(fileId),
    onSuccess: () => {
      // Invalidate files query to refresh file list
      queryClient.invalidateQueries({ queryKey: queryKeys.files });
    },
  });
};

export const useSearchInFile = () => {
  return useMutation({
    mutationFn: ({ fileId, query, topK }: { fileId: string; query: string; topK?: number }) => 
      fileApi.searchInFile(fileId, query, topK),
  });
};

// Enhanced file hooks
export const useFileStats = (chatId: string | null) => {
  return useQuery({
    queryKey: queryKeys.fileStats(chatId),
    queryFn: () => fileApi.getFileStats(chatId!),
    enabled: !!chatId,
  });
};

export const useSearchAcrossAllFiles = () => {
  return useMutation({
    mutationFn: ({ chatId, query, topK }: { chatId: string; query: string; topK?: number }) => 
      fileApi.searchAcrossAllFiles(chatId, query, topK),
  });
};

export const useUpdateFileMetadata = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ fileId, metadata }: { fileId: string; metadata: any }) => 
      fileApi.updateFileMetadata(fileId, metadata),
    onSuccess: () => {
      // Invalidate files query to refresh file list
      queryClient.invalidateQueries({ queryKey: queryKeys.files });
    },
  });
};

export const useGetFileContent = () => {
  return useMutation({
    mutationFn: (fileId: string) => fileApi.getFileContent(fileId),
  });
};

// Function hooks
export const useFunctions = () => {
  return useQuery({
    queryKey: queryKeys.functions,
    queryFn: functionApi.getFunctions,
  });
};

export const useExecuteFunction = () => {
  return useMutation({
    mutationFn: ({ name, args }: { name: string; args: any }) => 
      functionApi.executeFunction(name, args),
  });
};

export const useParseAndExecuteFunctions = () => {
  return useMutation({
    mutationFn: (text: string) => functionApi.parseAndExecuteFunctions(text),
  });
}; 