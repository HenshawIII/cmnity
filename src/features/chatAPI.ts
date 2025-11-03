import backendApi from '@/utils/backendApi';
import { createAsyncThunk } from '@reduxjs/toolkit';

export interface ChatMessage {
  id: string;
  sender: string;
  message: string;
  timestamp: Date;
  streamId: string;
  walletAddress: string;
}

export interface SendMessageRequest {
  message: string;
  streamId: string;
  walletAddress: string;
  sender: string; // shortened wallet address
}

// Send a chat message
export const sendChatMessage = createAsyncThunk(
  'chat/sendMessage',
  async (messageData: SendMessageRequest) => {
    const response = await backendApi.post(`/chat/${messageData.streamId}/send`, {
      message: messageData.message,
      walletAddress: messageData.walletAddress,
      sender: messageData.sender,
    });
    
    console.log('sendChatMessage response:', response.data);
    return {message: messageData.message, sender: messageData.sender, timestamp: new Date()};
  }
);

// Fetch chat messages for a stream
export const fetchChatMessages = createAsyncThunk(
  'chat/fetchMessages',
  async (playbackId: string) => {
    const response = await backendApi.get(`/chat/${playbackId}/fetch`);
    // console.log('fetchChatMessages response:', response.data);
    if (Array.isArray(response.data)) {
      return response.data;
    }
    if (response.data && Array.isArray(response.data.messages)) {
      return response.data.messages;
    }
    return [];
  }
);

// Fetch recent chat messages (for real-time updates)
export const fetchRecentMessages = createAsyncThunk(
  'chat/fetchRecent',
  async ({ streamId, lastMessageId }: { streamId: string; lastMessageId?: string }) => {
    const params = lastMessageId ? `?lastMessageId=${lastMessageId}` : '';
    const response = await backendApi.get(`/chat/${streamId}/fetch${params}`);
    console.log('fetchRecentMessages response:', response.data);
    if (Array.isArray(response.data)) {
      return response.data;
    }
    if (response.data && Array.isArray(response.data.messages)) {
      return response.data.messages;
    }
    return [];
  }
); 